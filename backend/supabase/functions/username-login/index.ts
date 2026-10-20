import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, isAllowedOrigin, isJsonObject, jsonResponse } from '../_shared/http.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  throw new Error('Required Supabase function environment is not configured.');
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const authClient = createClient(supabaseUrl, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

Deno.serve(async (request) => {
  const origin = request.headers.get('Origin');
  const headers = corsHeaders(origin);

  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers });
  }
  if (!isAllowedOrigin(origin)) {
    return jsonResponse({ error: 'Origin is not allowed.' }, 403, headers);
  }
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405, headers);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request.' }, 400, headers);
  }
  if (!isJsonObject(body)) {
    return jsonResponse({ error: 'Invalid request.' }, 400, headers);
  }

  const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!/^[a-z0-9_]{3,32}$/.test(username) || password.length < 1 || password.length > 1024) {
    return jsonResponse({ error: 'Invalid username or password.' }, 401, headers);
  }

  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle();
  if (profileError) {
    console.error('Username lookup failed:', profileError.message);
    return jsonResponse({ error: 'Authentication is temporarily unavailable.' }, 503, headers);
  }
  if (!profile) {
    return jsonResponse({ error: 'Invalid username or password.' }, 401, headers);
  }

  const { data: account, error: accountError } = await adminClient.auth.admin.getUserById(profile.id);
  if (accountError || !account.user?.email) {
    console.error('Could not retrieve the account email for username login.');
    return jsonResponse({ error: 'Authentication is temporarily unavailable.' }, 503, headers);
  }

  const { data, error } = await authClient.auth.signInWithPassword({
    email: account.user.email,
    password,
  });
  if (error || !data.session) {
    if (error && /email not confirmed/i.test(error.message)) {
      return jsonResponse({ error: 'Please verify your email address before signing in.' }, 401, headers);
    }
    return jsonResponse({ error: 'Invalid username or password.' }, 401, headers);
  }

  return jsonResponse({ session: data.session }, 200, headers);
});

import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, isAllowedOrigin, isJsonObject, jsonResponse } from '../_shared/http.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const appOrigin = Deno.env.get('APP_ORIGIN');

if (!supabaseUrl || !anonKey || !serviceRoleKey || !appOrigin) {
  throw new Error('Required Supabase function environment is not configured.');
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const authClient = createClient(supabaseUrl, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const genericResponse = {
  message: 'If an account matches that information, a password reset email will be sent.',
};

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

  const identifier = typeof body.identifier === 'string' ? body.identifier.trim() : '';
  if (!identifier || identifier.length > 254) {
    return jsonResponse({ error: 'Enter a valid email address or username.' }, 400, headers);
  }

  let email: string | null = null;
  if (identifier.includes('@')) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      return jsonResponse({ error: 'Enter a valid email address or username.' }, 400, headers);
    }
    email = identifier;
  } else if (/^[a-zA-Z0-9_]{3,32}$/.test(identifier)) {
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('id')
      .eq('username', identifier.toLowerCase())
      .maybeSingle();

    if (profileError) {
      console.error('Password reset username lookup failed:', profileError.message);
      return jsonResponse({ error: 'Password recovery is temporarily unavailable.' }, 503, headers);
    }
    if (profile) {
      const { data: account, error: accountError } = await adminClient.auth.admin.getUserById(profile.id);
      if (accountError) {
        console.error('Password reset account lookup failed:', accountError.message);
        return jsonResponse({ error: 'Password recovery is temporarily unavailable.' }, 503, headers);
      }
      email = account.user?.email ?? null;
    }
  } else {
    return jsonResponse({ error: 'Enter a valid email address or username.' }, 400, headers);
  }

  if (email) {
    const { error } = await authClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${appOrigin.replace(/\/$/, '')}/reset-password`,
    });
    if (error) {
      console.error('Password reset email request failed:', error.message);
      return jsonResponse({ error: 'Password recovery is temporarily unavailable.' }, 503, headers);
    }
  }

  return jsonResponse(genericResponse, 200, headers);
});

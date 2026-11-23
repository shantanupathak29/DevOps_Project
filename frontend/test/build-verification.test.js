import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const frontendRoot = path.resolve(__dirname, '..');

describe('Project Structure & Pipeline Configuration', () => {
  it('has valid root package.json with CI scripts', () => {
    const pkgPath = path.join(projectRoot, 'package.json');
    assert.ok(fs.existsSync(pkgPath), 'root package.json should exist');

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    assert.ok(pkg.scripts, 'package.json should have scripts object');
    assert.ok(pkg.scripts.test, 'root should have test script');
    assert.ok(pkg.scripts.build, 'root should have build script');
    assert.ok(pkg.scripts.lint, 'root should have lint script');
  });

  it('has valid frontend package.json configuration', () => {
    const pkgPath = path.join(frontendRoot, 'package.json');
    assert.ok(fs.existsSync(pkgPath), 'frontend/package.json should exist');

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    assert.strictEqual(pkg.type, 'module', 'frontend should be configured as ES module');
    assert.ok(pkg.scripts.test, 'frontend should have test script');
    assert.ok(pkg.scripts.build, 'frontend should have build script');
    assert.ok(pkg.scripts.lint, 'frontend should have lint script');
  });

  it('contains essential frontend entry points and assets', () => {
    const indexHtml = path.join(frontendRoot, 'index.html');
    const mainJsx = path.join(frontendRoot, 'src', 'main.jsx');
    const appJsx = path.join(frontendRoot, 'src', 'App.jsx');

    assert.ok(fs.existsSync(indexHtml), 'index.html must exist');
    assert.ok(fs.existsSync(mainJsx), 'src/main.jsx must exist');
    assert.ok(fs.existsSync(appJsx), 'src/App.jsx must exist');
  });

  it('has GitHub Actions CI/CD workflow defined', () => {
    const workflowPath = path.join(projectRoot, '.github', 'workflows', 'ci-cd.yml');
    assert.ok(fs.existsSync(workflowPath), '.github/workflows/ci-cd.yml must exist');

    const workflowContent = fs.readFileSync(workflowPath, 'utf-8');
    assert.ok(workflowContent.includes('npm --prefix frontend test') || workflowContent.includes('npm test'),
      'Workflow must include an automated test step');
    assert.ok(workflowContent.includes('npm --prefix frontend run build') || workflowContent.includes('npm run build'),
      'Workflow must include a build step');
  });
});

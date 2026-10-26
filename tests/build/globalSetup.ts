import { execSync } from 'node:child_process';

export default function setup() {
  // vitest runs with NODE_ENV=test; the build must not inherit it, or Vite bundles
  // React's development build into dist/.
  execSync('npm run build', { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production' } });
}

import coreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [...coreWebVitals, { ignores: ['out/', 'out-relay/', '.next/', 'node_modules/', 'playwright-report/', 'test-results/'] }];
export default config;

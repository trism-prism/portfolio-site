import next from 'eslint-config-next/core-web-vitals';

const config = [
  ...next,
  { ignores: ['out/**', '.next/**'] },
  {
    rules: {
      // A statically exported page can only read browser state (localStorage, matchMedia, the URL) after
      // hydration, so a few effects intentionally set state on mount. Everything else follows the rules.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];

export default config;

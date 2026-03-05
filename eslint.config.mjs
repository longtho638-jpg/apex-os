import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// Patch rules in-place within configs that own the plugin
// This avoids "plugin not defined in same config object" errors
const patchedVitals = nextVitals.map((cfg) => {
  if (!cfg.rules) return cfg;
  const rulesToWarn = [
    'react-hooks/set-state-in-effect',
    'react-hooks/purity',
    'react-hooks/immutability',
    'react-hooks/rules-of-hooks',
    'react/no-unescaped-entities',
    'react/display-name',
    '@next/next/no-html-link-for-pages',
  ];
  const patchedRules = { ...cfg.rules };
  let patched = false;
  for (const rule of rulesToWarn) {
    if (patchedRules[rule] === 'error' || patchedRules[rule] === 2) {
      patchedRules[rule] = 'warn';
      patched = true;
    }
  }
  return patched ? { ...cfg, rules: patchedRules } : cfg;
});

const eslintConfig = defineConfig([
  ...patchedVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
  // Downgrade strict rules to warnings for gradual migration
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-this-alias': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      'prefer-const': 'warn',
    },
  },
]);

export default eslintConfig;

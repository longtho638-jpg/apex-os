# Research Report: Biome Adoption for Apex OS

**Date:** 2026-03-01 | **Scope:** biomejs/biome v2.x → apex-os Next.js 16 + React 19 + TypeScript

---

## Executive Summary

Biome is a Rust-powered unified toolchain (formatter + linter) that replaces ESLint + Prettier with a single binary, single config file. It is 10–25x faster, has 452 lint rules, and supports TypeScript/JSX natively with zero config. For apex-os, migration is straightforward: apex-os currently uses `eslint-config-next` flat config with ~7 rules downgraded to warnings — biome covers all of these. The main gap: biome does NOT support Next.js-specific rules (`@next/next/*`) natively, so `next lint` must run separately (or be dropped) during builds.

**Recommendation:** Adopt biome for formatting + general linting; keep `next lint` in CI for Next.js-specific checks (image optimization, `<Link>` usage). Full ESLint removal is feasible but requires Next.js-specific gap analysis.

---

## 1. Architecture Patterns

### Rust + One-Parse Architecture

```
biome binary
├── Parser (one parse → CST/AST)
│   ├── JavaScript/TypeScript/JSX/TSX
│   ├── JSON / JSONC
│   ├── CSS / GraphQL
│   └── HTML (experimental)
├── Formatter (reuses AST from parser)
│   └── Prettier-compatible output
├── Linter (visitor-based, reuses AST)
│   ├── RegistryVisitor traverses AST
│   ├── Rules match via Queryable trait
│   └── RuleContext provides semantic info + user options
└── LSP Server (Language Server Protocol)
    └── Powers VS Code / IntelliJ integration
```

**Key insight:** Parse once, run formatter + linter in the same pass. ESLint + Prettier each parse independently → 2x overhead minimum.

### Repository Structure (biomejs/biome)

```
biome/
├── crates/
│   ├── biome_analyze/        # Rule analysis framework
│   ├── biome_js_analyze/     # JS/TS lint rules (main rule crate)
│   ├── biome_css_analyze/    # CSS lint rules
│   ├── biome_js_formatter/   # JS/TS formatter
│   ├── biome_js_parser/      # JS/TS/JSX parser
│   ├── biome_js_semantic/    # Semantic model (type inference v2.0+)
│   └── biome_lsp/            # LSP server
├── packages/
│   └── @biomejs/biome/       # npm package wrapper
└── biome.json                # Biome's own config (dogfoods itself)
```

### Monorepo Support

Biome supports nested `biome.json` per package. Root config is `"root": true`. Child configs use `"root": false` and inherit from parent via `extends`. Glob matching is Gitignore-style.

```json
// Root: biome.json
{ "root": true, "formatter": { "indentStyle": "space" } }

// packages/foo/biome.json
{ "root": false, "extends": ["../../biome.json"] }
```

---

## 2. Linting & Formatting Approach

### Rule Groups (452 total rules as of v2.3)

| Group | Count | Severity Constraint | Purpose |
|-------|-------|---------------------|---------|
| `correctness` | ~60 | Must be `error` | Guaranteed bugs/errors |
| `suspicious` | ~50 | Can vary | Likely bugs |
| `style` | ~80 | Must NOT be `error` | Code conventions |
| `complexity` | ~30 | Must NOT be `error` | Simplification |
| `performance` | ~15 | Can vary | Runtime efficiency |
| `security` | ~10 | Must be `error` | Security flaws |
| `accessibility` | ~30 | Must be `error` | WCAG violations |
| `nursery` | ~150+ | Any (experimental) | Opt-in new rules |

### Safe vs Unsafe Fixes

- **Safe fixes**: Applied automatically (`biome check --write`)
- **Unsafe fixes**: Require explicit flag (`biome check --write --unsafe`) — may change behavior

### Suppression Comments

```typescript
// biome-ignore lint/suspicious/noExplicitAny: external API type
const data: any = externalApiCall();

// biome-ignore format: preserve manual alignment
const matrix = [1, 0,
                0, 1];
```

### Domains (v2.0+ feature)

Auto-detects React/Next.js from `package.json` deps and enables domain-specific rules:

```json
{
  "linter": {
    "rules": {
      "recommended": true
    }
  }
}
```

Biome reads `package.json` → detects `react`, `next` → enables React hooks rules, JSX rules automatically.

---

## 3. Configuration Schema

### Complete biome.json for apex-os

```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.11/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true,
    "defaultBranch": "main"
  },
  "files": {
    "includes": [
      "src/**",
      "app/**",
      "components/**",
      "lib/**",
      "hooks/**",
      "services/**",
      "types/**",
      "tests/**"
    ],
    "ignoreUnknown": true
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "lineEnding": "lf",
    "trailingNewline": true
  },
  "javascript": {
    "parser": {
      "jsxEverywhere": true
    },
    "formatter": {
      "quoteStyle": "double",
      "jsxQuoteStyle": "double",
      "trailingCommas": "all",
      "semicolons": "always",
      "arrowParentheses": "always",
      "bracketSameLine": false,
      "bracketSpacing": true
    }
  },
  "json": {
    "parser": {
      "allowComments": true,
      "allowTrailingCommas": true
    },
    "formatter": {
      "enabled": true,
      "trailingCommas": "none"
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "recommended": true,
        "noUnusedVariables": "error",
        "noUnusedImports": "error",
        "useExhaustiveDependencies": "warn"
      },
      "suspicious": {
        "recommended": true,
        "noExplicitAny": "warn",
        "noConsole": "warn"
      },
      "style": {
        "recommended": true,
        "useConst": "warn",
        "noParameterAssign": "warn"
      },
      "security": {
        "recommended": true,
        "noDangerouslySetInnerHtml": "error"
      },
      "performance": {
        "recommended": true
      },
      "complexity": {
        "recommended": true
      },
      "accessibility": {
        "recommended": true
      }
    }
  },
  "overrides": [
    {
      "includes": [
        ".next/**",
        "out/**",
        "build/**",
        "node_modules/**",
        "next-env.d.ts",
        "**/*.d.ts"
      ],
      "linter": { "enabled": false },
      "formatter": { "enabled": false }
    },
    {
      "includes": ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx", "tests/**"],
      "linter": {
        "rules": {
          "suspicious": {
            "noExplicitAny": "off"
          }
        }
      }
    },
    {
      "includes": ["*.config.ts", "*.config.js", "*.config.mjs"],
      "linter": {
        "rules": {
          "suspicious": {
            "noConsole": "off"
          }
        }
      }
    }
  ]
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "lint:unsafe": "biome check --write --unsafe .",
    "format": "biome format --write .",
    "format:check": "biome format .",
    "ci": "biome ci ."
  }
}
```

### next.config.ts — disable ESLint during builds

```typescript
// next.config.ts
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // biome handles linting now
  },
};
export default nextConfig;
```

---

## 4. Key Features vs ESLint

### Performance Benchmarks

| Metric | ESLint + Prettier | Biome | Speedup |
|--------|-------------------|-------|---------|
| Lint 10k files | 45.2s | 0.8s | **56x** |
| Format 10k files | 12.1s | 0.3s | **40x** |
| Lint 10k-line monorepo | 3–5s | ~200ms | **15–25x** |
| Install size | 127+ npm packages | 1 binary | **127x fewer deps** |

### What Biome Covers from apex-os ESLint Config

| apex-os ESLint rule | Biome equivalent |
|---------------------|-----------------|
| `react-hooks/rules-of-hooks` | `correctness/useHookAtTopLevel` |
| `react/no-unescaped-entities` | `correctness/noUnescapedEntities` |
| `react/display-name` | `suspicious/noEmptyBlockStatements` (partial) |
| `@typescript-eslint/no-explicit-any` | `suspicious/noExplicitAny` |
| `prefer-const` | `style/useConst` |
| `@typescript-eslint/no-require-imports` | `style/noCommonJs` |
| `@typescript-eslint/ban-ts-comment` | `suspicious/noTsComment` |

### What Biome Does NOT Cover

- `@next/next/no-html-link-for-pages` — Next.js specific, no biome equivalent
- `@next/next/no-img-element` — Next.js specific (`<Image>` enforcement)
- `@next/next/no-sync-scripts` — Next.js specific
- Full TypeScript type-aware rules (partial in v2.0+, improving)
- HTML/Markdown/SCSS formatting (not yet supported)
- Vue/Svelte/Astro (partial support)

### Biome 2.0 New Features (March 2025)

- **Type inference** — type-aware linting without `tsconfig` dependency
- **GritQL plugin system** — write custom lint rules in GritQL
- **Domains** — auto-detect React/Next.js and enable relevant rules
- **`biome ci` command** — CI-optimized check (no write, clear exit codes)

---

## 5. Migration from ESLint (apex-os Specific)

### Step 1: Install biome

```bash
cd /Users/macbookprom1/mekong-cli/apps/apex-os
npm install --save-dev --save-exact @biomejs/biome
```

### Step 2: Auto-migrate from ESLint

```bash
npx @biomejs/biome migrate eslint --write
npx @biomejs/biome migrate prettier --write
```

This reads `eslint.config.mjs`, converts rules to biome equivalents, writes `biome.json`.

### Step 3: Manual review — apex-os specific

The auto-migration will miss:
- `eslint-config-next` rules (Next.js specific) → keep `next lint` separately
- Downgraded rules (currently `warn`) → verify severity in biome.json

### Step 4: Remove ESLint packages

```bash
npm uninstall eslint eslint-config-next
```

Keep `next lint` available by adding to next.config.ts (Next.js bundles its own ESLint for `next lint`).

### Step 5: Update package.json scripts

```json
{
  "scripts": {
    "lint": "biome check . && next lint",
    "lint:fix": "biome check --write . && next lint --fix",
    "ci": "biome ci . && next lint"
  }
}
```

### Step 6: Update Husky pre-commit

```bash
# .husky/pre-commit
npx biome check --write --staged .
```

### Step 7: VS Code integration

Install **Biome** extension (official: `biomejs.biome`), add to `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  },
  "[typescript]": { "editor.defaultFormatter": "biomejs.biome" },
  "[typescriptreact]": { "editor.defaultFormatter": "biomejs.biome" },
  "[javascript]": { "editor.defaultFormatter": "biomejs.biome" },
  "[json]": { "editor.defaultFormatter": "biomejs.biome" }
}
```

### Step 8: CI/CD (GitHub Actions)

```yaml
- name: Lint (Biome)
  run: npx @biomejs/biome ci .

- name: Lint (Next.js specific)
  run: npx next lint
```

---

## 6. Best Practices for apex-os (Trading Platform)

### Security-first rules to enable

```json
{
  "linter": {
    "rules": {
      "security": {
        "noDangerouslySetInnerHtml": "error",
        "noGlobalEval": "error"
      },
      "suspicious": {
        "noConsole": "warn"
      }
    }
  }
}
```

### Performance rules for trading UI (React 19)

```json
{
  "linter": {
    "rules": {
      "correctness": {
        "useExhaustiveDependencies": "error",
        "noUnusedVariables": "error",
        "noUnusedImports": "error"
      },
      "performance": {
        "recommended": true,
        "noAccumulatingSpread": "error"
      }
    }
  }
}
```

### Gradual adoption strategy

1. Start with `biome format --write .` only (zero risk, just formatting)
2. Run `biome check .` without `--write` to see lint violations
3. Fix violations group by group: `correctness` first, `style` second
4. Enable `biome check --write` in pre-commit after violations resolved

### CI command

```bash
biome ci .
# Returns non-zero exit code on any violation
# Does NOT write changes (safe for CI)
```

---

## Comparative Summary

| Dimension | ESLint + Prettier | Biome |
|-----------|-------------------|-------|
| Speed | Slow (Node.js, 2 parsers) | 10–25x faster (Rust, 1 parser) |
| Config files | 4+ files | 1 `biome.json` |
| Install | 127+ packages | 1 binary |
| TypeScript | Plugin required | Native |
| JSX | Plugin required | Native |
| Next.js rules | Full via `eslint-config-next` | NOT covered |
| Type-aware | Full (tsconfig) | Partial (v2.0+) |
| Custom rules | Huge ecosystem | GritQL (early) |
| HTML/Markdown | Prettier | Not supported |
| Stability | Extremely mature | v2.3, production-ready |

---

## Unresolved Questions

1. **Next.js rules gap**: `@next/next/no-img-element`, `no-html-link-for-pages` — apex-os usage frequency? If these rules are actively violated, keeping `next lint` in CI is mandatory.
2. **Type-aware linting depth**: biome v2.0 type inference is still partial — does apex-os rely on `@typescript-eslint/no-floating-promises` or `@typescript-eslint/await-thenable`? These may not have biome equivalents yet.
3. **Husky staged-files integration**: Current Husky config — does apex-os use `lint-staged`? Biome has `--staged` flag but needs verification with current hook setup.
4. **Biome version pinning**: `--save-exact` is recommended — team should pin to a specific version to avoid rule drift between updates.
5. **CSS/SCSS**: apex-os uses Tailwind CSS v4. Biome formats CSS but does NOT handle SCSS. Tailwind v4 is CSS-native so likely fine, but needs confirmation.

---

## References

- [Biome official site](https://biomejs.dev/)
- [GitHub: biomejs/biome](https://github.com/biomejs/biome)
- [Configuration reference](https://biomejs.dev/reference/configuration/)
- [Migrate from ESLint & Prettier](https://biomejs.dev/guides/migrate-eslint-prettier/)
- [Linter documentation](https://biomejs.dev/linter/)
- [Biome vs ESLint — Better Stack](https://betterstack.com/community/guides/scaling-nodejs/biome-eslint/)
- [AppSignal migration guide 2025](https://blog.appsignal.com/2025/05/07/migrating-a-javascript-project-from-prettier-and-eslint-to-biomejs.html)
- [DeepWiki: Analyzer and Linter System](https://deepwiki.com/biomejs/biome/5-analyzer-and-linter-system)
- [Biome Roadmap 2025](https://biomejs.dev/blog/roadmap-2025/)
- [Next.js + Biome setup guide](https://www.timsanteford.com/posts/how-to-use-biome-with-next-js-for-linting-and-formatting/)

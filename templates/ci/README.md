# CI/CD Templates

Pre-configured GitHub Actions workflows for MADFAM ecosystem projects.

## Available Templates

### `lint-workflow.yml` - Documentation Linting

Enforces documentation quality across your repository:

- **Env Var Audit**: Ensures all `.env.example` variables are documented in README
- **Dead Link Check**: Verifies all HTTP(S) links return 200 OK
- **Brand Police**: Enforces inclusive language and brand-safe terminology

#### Usage

1. Copy `lint-workflow.yml` to `.github/workflows/doc-lint.yml` in your repo
2. Commit and push
3. DocGuard will run on every PR that modifies documentation

```bash
# Quick setup
cp templates/ci/lint-workflow.yml .github/workflows/doc-lint.yml
```

Or use the direct reference in your workflow:

```yaml
- uses: madfam-org/solarpunk-foundry/.github/actions/doc-guard@main
```

#### Configuration Options

| Input | Default | Description |
|-------|---------|-------------|
| `doc-path` | `./docs` | Path to documentation directory |
| `strict` | `false` | Fail on warnings (not just errors) |
| `check-env-vars` | `true` | Audit environment variables |
| `check-links` | `true` | Verify markdown links |
| `check-terminology` | `true` | Enforce brand-safe terms |
| `banned-terms-file` | `''` | Custom banned terms file (JSON) |

#### Custom Banned Terms

Create a JSON file with additional banned terms:

```json
{
  "legacy term": "preferred term",
  "old name": "new name"
}
```

Then reference it in your workflow:

```yaml
- uses: madfam-org/solarpunk-foundry/.github/actions/doc-guard@main
  with:
    banned-terms-file: '.github/banned-terms.json'
```

#### Default Banned Terms

DocGuard enforces these terms by default:

**Inclusive Language:**
| Banned | Replacement |
|--------|-------------|
| master/slave | primary/replica |
| master branch | main branch |
| whitelist | allowlist |
| blacklist | blocklist |
| sanity check | validation check |
| dummy | placeholder |

**Brand Protection:**
| Banned | Replacement |
|--------|-------------|
| auth0 | identity provider (or Janua) |
| vercel | deployment platform (or Enclii) |
| railway | PaaS (or Enclii) |
| heroku | PaaS (or Enclii) |

#### Example Output

```
============================================================
DocGuard - Documentation Quality Enforcement
============================================================
Doc path: ./docs
Strict mode: false

Checking environment variable documentation...
Checking terminology compliance...
Checking link validity (this may take a moment)...

============================================================
RESULTS
============================================================

2 WARNINGS:
  docs/example.md:15 - Banned term 'whitelist' found
    Suggestion: Replace with: allowlist
  .env.example:0 - Environment variable 'SECRET_KEY' not documented in README
    Suggestion: Add documentation for SECRET_KEY in README.md

All checks passed!
```

## Adding New Templates

When adding new CI templates:

1. Create the template in `templates/ci/`
2. Add documentation to this README
3. Test the template in a sample repository
4. Update the main Foundry README if needed

## Related Documentation

- [DocGuard Action Source](../../.github/actions/doc-guard/)
- [Trinity Architecture](../../docs/architecture/TRINITY.md)
- [Port Allocation Registry](../../docs/PORT_ALLOCATION.md)

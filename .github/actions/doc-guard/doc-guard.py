#!/usr/bin/env python3
"""
DocGuard - Documentation Quality Enforcement for MADFAM Ecosystem

Checks:
1. Environment variable consistency (README vs .env.example)
2. Dead link detection (HTTP 200 verification)
3. Banned terminology enforcement (brand police)
"""

import os
import re
import sys
import json
import asyncio
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional

try:
    import aiohttp
    AIOHTTP_AVAILABLE = True
except ImportError:
    AIOHTTP_AVAILABLE = False

# ============================================================================
# CONFIGURATION
# ============================================================================

DEFAULT_BANNED_TERMS = {
    # Inclusive language
    "master/slave": "primary/replica",
    "master branch": "main branch",
    "whitelist": "allowlist",
    "blacklist": "blocklist",
    "sanity check": "validation check",
    "dummy": "placeholder",

    # Brand protection (suggest MADFAM alternatives to competitor services)
    "auth0": "identity provider (or Janua)",
    "vercel": "deployment platform (or Enclii)",
    "railway": "PaaS (or Enclii)",
    "heroku": "PaaS (or Enclii)",
}

# URLs to skip (not real external links)
SKIP_URL_PATTERNS = [
    # Internal/local services
    r'\.svc\.cluster\.local',      # K8s internal services
    r'localhost[:/]',               # Local development
    r'127\.0\.0\.1',               # Loopback
    r'0\.0\.0\.0',                 # Bind-all address
    r'\.internal[:/]',             # Internal domains
    r'\.local[:/]',                # Local domains

    # Template placeholders
    r'\{[^}]+\}',                   # {var} placeholders
    r'\$\{[^}]+\}',                # ${VAR} shell-style
    r'<[^>]+>',                     # <var> angle bracket
    r'\$[A-Z_]+',                   # $PROJECT_ID style
    r'%[sd]',                       # %s, %d format strings
    r'YOUR_[A-Z_]+',               # YOUR_ACCOUNT_ID style placeholders

    # Example/test domains (RFC 2606 + common patterns)
    r'example\.(com|org|net)',      # RFC 2606
    r'your-[a-z-]+\.',             # your-domain.com
    r'myapp\.',                     # myapp.example.com
    r'foo\.',                       # foo.bar.com
    r'acme\.',                      # acme.com (common example)
    r'my-app\.',                    # my-app.example.com
    r'my-project\.',                # my-project.example.com

    # Example GitHub URLs
    r'github\.com/example/',        # github.com/example/repo
    r'github\.com/user/',           # github.com/user/repo
    r'github\.com/test/',           # github.com/test/repo
    r'github\.com/org/',            # github.com/org/repo
    r'github\.com/madfam/',         # github.com/madfam/ (typo, should be madfam-org)

    # URLs that are clearly incomplete or malformed
    r'^https?://$',                 # Just protocol
    r'^https?://\*',                # Wildcards
    r'\*\*$',                       # Glob patterns at end
    r'\|',                          # Pipe char (markdown table artifact)

    # Internal dev/staging domains that may not resolve publicly
    r'\.enclii\.local',             # Local dev
    r'\.fn\.enclii\.dev',           # Functions subdomain (may not exist)
    r'\.preview\.enclii',           # Preview environments
    r'\.staging\.',                 # Staging environments
    r'\.madfam\.io',                # MADFAM internal services (npm, etc.)
    r'links\.suluna\.mx',           # Internal link shortener

    # API endpoints that require parameters or auth
    r'/range/$',                    # pwnedpasswords API requires hash prefix
    r'/graphql',                    # GraphQL endpoints need POST
    r'api\.enclii\.dev',            # Our API (routes may not exist yet)
]


def should_skip_url(url: str) -> bool:
    """Check if URL should be skipped (internal/placeholder)"""
    for pattern in SKIP_URL_PATTERNS:
        if re.search(pattern, url, re.IGNORECASE):
            return True
    return False

# ============================================================================
# DATA CLASSES
# ============================================================================

@dataclass
class LintIssue:
    severity: str  # "error" | "warning"
    file: str
    line: int
    message: str
    suggestion: Optional[str] = None


@dataclass
class LintReport:
    errors: list = field(default_factory=list)
    warnings: list = field(default_factory=list)

    def add(self, issue: LintIssue):
        if issue.severity == "error":
            self.errors.append(issue)
        else:
            self.warnings.append(issue)

    @property
    def error_count(self) -> int:
        return len(self.errors)

    @property
    def warning_count(self) -> int:
        return len(self.warnings)

    def to_dict(self) -> dict:
        return {
            "errors": [vars(e) for e in self.errors],
            "warnings": [vars(w) for w in self.warnings],
            "summary": {
                "error_count": self.error_count,
                "warning_count": self.warning_count,
            }
        }


# ============================================================================
# CHECKERS
# ============================================================================

def check_env_vars(doc_path: Path, report: LintReport):
    """Check that env vars in README match .env.example"""
    readme_path = doc_path.parent / "README.md"
    env_example_path = doc_path.parent / ".env.example"

    if not readme_path.exists() or not env_example_path.exists():
        return

    # Extract env vars from .env.example
    env_vars = set()
    with open(env_example_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                var_name = line.split("=")[0].strip()
                env_vars.add(var_name)

    # Check README for undocumented vars
    readme_content = readme_path.read_text()

    for var in env_vars:
        if var not in readme_content:
            report.add(LintIssue(
                severity="warning",
                file=str(env_example_path),
                line=0,
                message=f"Environment variable '{var}' not documented in README",
                suggestion=f"Add documentation for {var} in README.md"
            ))


def check_terminology(doc_path: Path, report: LintReport, banned_terms: dict):
    """Check for banned terminology in all markdown files"""
    md_files = list(doc_path.rglob("*.md"))
    md_files.extend(doc_path.parent.glob("*.md"))

    for md_file in md_files:
        try:
            content = md_file.read_text().lower()
            lines = md_file.read_text().split("\n")

            for banned, replacement in banned_terms.items():
                if banned.lower() in content:
                    # Find line number
                    for i, line in enumerate(lines, 1):
                        if banned.lower() in line.lower():
                            report.add(LintIssue(
                                severity="warning",
                                file=str(md_file),
                                line=i,
                                message=f"Banned term '{banned}' found",
                                suggestion=f"Replace with: {replacement}"
                            ))
        except Exception as e:
            report.add(LintIssue(
                severity="error",
                file=str(md_file),
                line=0,
                message=f"Failed to read file: {e}"
            ))


async def check_link(session, url: str, file: str, line: int, report: LintReport):
    """Check if a single link is valid"""
    try:
        async with session.head(
            url,
            timeout=aiohttp.ClientTimeout(total=10),
            allow_redirects=True
        ) as resp:
            # 404 = genuinely broken (error)
            if resp.status == 404:
                report.add(LintIssue(
                    severity="error",
                    file=file,
                    line=line,
                    message=f"Dead link: {url} (HTTP 404 Not Found)"
                ))
            # 401/403 = auth-protected (warning, not error)
            elif resp.status in (401, 403):
                report.add(LintIssue(
                    severity="warning",
                    file=file,
                    line=line,
                    message=f"Auth-protected link: {url} (HTTP {resp.status})"
                ))
            # 5xx = server issues (warning, may be temporary)
            elif resp.status >= 500:
                report.add(LintIssue(
                    severity="warning",
                    file=file,
                    line=line,
                    message=f"Server error: {url} (HTTP {resp.status})"
                ))
            # 400 = bad request (often means requires parameters - warning)
            elif resp.status == 400:
                report.add(LintIssue(
                    severity="warning",
                    file=file,
                    line=line,
                    message=f"API requires parameters: {url} (HTTP 400)"
                ))
            # Other 4xx = broken (error)
            elif resp.status >= 400:
                report.add(LintIssue(
                    severity="error",
                    file=file,
                    line=line,
                    message=f"Dead link: {url} (HTTP {resp.status})"
                ))
    except asyncio.TimeoutError:
        report.add(LintIssue(
            severity="warning",
            file=file,
            line=line,
            message=f"Link timeout: {url}"
        ))
    except Exception as e:
        report.add(LintIssue(
            severity="warning",
            file=file,
            line=line,
            message=f"Link check failed: {url} ({type(e).__name__})"
        ))


async def check_links(doc_path: Path, report: LintReport):
    """Check all HTTP(S) links in markdown files"""
    if not AIOHTTP_AVAILABLE:
        print("Warning: aiohttp not installed, skipping link checks")
        return

    url_pattern = re.compile(r'https?://[^\s\)>\]"\']+')

    md_files = list(doc_path.rglob("*.md"))
    md_files.extend(doc_path.parent.glob("*.md"))

    links_to_check = []

    for md_file in md_files:
        try:
            lines = md_file.read_text().split("\n")
            for i, line in enumerate(lines, 1):
                urls = url_pattern.findall(line)
                for url in urls:
                    # Clean URL (remove trailing punctuation and markdown artifacts)
                    url = url.rstrip(".,;:!?`'\"")
                    # Remove backticks that may be inside the URL (from markdown `code` blocks)
                    url = url.replace('`', '')
                    # Skip internal/placeholder URLs
                    if should_skip_url(url):
                        continue
                    links_to_check.append((url, str(md_file), i))
        except Exception:
            pass

    # Deduplicate URLs
    seen_urls = set()
    unique_links = []
    for url, file, line in links_to_check:
        if url not in seen_urls:
            seen_urls.add(url)
            unique_links.append((url, file, line))

    if not unique_links:
        return

    # Check links concurrently (max 10 at a time)
    connector = aiohttp.TCPConnector(limit=10)
    async with aiohttp.ClientSession(connector=connector) as session:
        tasks = [
            check_link(session, url, file, line, report)
            for url, file, line in unique_links
        ]
        await asyncio.gather(*tasks)


# ============================================================================
# MAIN
# ============================================================================

def main():
    doc_path = Path(os.environ.get("DOC_PATH", "./docs"))
    strict = os.environ.get("STRICT", "false").lower() == "true"
    check_env = os.environ.get("CHECK_ENV_VARS", "true").lower() == "true"
    check_links_enabled = os.environ.get("CHECK_LINKS", "true").lower() == "true"
    check_terms = os.environ.get("CHECK_TERMINOLOGY", "true").lower() == "true"
    banned_terms_file = os.environ.get("BANNED_TERMS_FILE", "")

    report = LintReport()

    # Load custom banned terms if provided
    banned_terms = DEFAULT_BANNED_TERMS.copy()
    if banned_terms_file and Path(banned_terms_file).exists():
        with open(banned_terms_file) as f:
            custom_terms = json.load(f)
            banned_terms.update(custom_terms)

    print("=" * 60)
    print("DocGuard - Documentation Quality Enforcement")
    print("=" * 60)
    print(f"Doc path: {doc_path}")
    print(f"Strict mode: {strict}")
    print()

    # Run checks
    if check_env:
        print("Checking environment variable documentation...")
        check_env_vars(doc_path, report)

    if check_terms:
        print("Checking terminology compliance...")
        check_terminology(doc_path, report, banned_terms)

    if check_links_enabled:
        print("Checking link validity (this may take a moment)...")
        asyncio.run(check_links(doc_path, report))

    # Output results
    print()
    print("=" * 60)
    print("RESULTS")
    print("=" * 60)

    if report.errors:
        print(f"\n{len(report.errors)} ERRORS:")
        for issue in report.errors:
            print(f"  {issue.file}:{issue.line} - {issue.message}")
            if issue.suggestion:
                print(f"    Suggestion: {issue.suggestion}")

    if report.warnings:
        print(f"\n{len(report.warnings)} WARNINGS:")
        for issue in report.warnings:
            print(f"  {issue.file}:{issue.line} - {issue.message}")
            if issue.suggestion:
                print(f"    Suggestion: {issue.suggestion}")

    if not report.errors and not report.warnings:
        print("All checks passed!")

    # Set outputs for GitHub Actions
    github_output = os.environ.get("GITHUB_OUTPUT", "")
    if github_output:
        with open(github_output, "a") as f:
            f.write(f"errors={report.error_count}\n")
            f.write(f"warnings={report.warning_count}\n")
            f.write(f"report={json.dumps(report.to_dict())}\n")

    # Exit code
    if report.error_count > 0:
        sys.exit(1)
    if strict and report.warning_count > 0:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()

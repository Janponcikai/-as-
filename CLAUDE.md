# CLAUDE.md

This file provides guidance to AI assistants (Claude and others) working in this repository.

## Repository Overview

This is a newly initialized repository (`Janponcikai/-as-`). No source code has been committed yet. This file establishes conventions and workflows to follow as the project grows.

## Current State

- **Status**: Empty repository — no source files, no dependencies, no CI/CD pipelines
- **Branch**: Development happens on `claude/add-claude-documentation-82LA3` and related `claude/` prefixed branches
- **Remote**: Configured and ready for pushing

## Development Workflow

### Branching

- All Claude-driven development branches must be prefixed with `claude/` and end with the session ID (e.g., `claude/feature-name-XXXX`)
- Never push directly to `main` or `master` without explicit permission
- Always create the branch locally if it doesn't exist before pushing

### Git Operations

```bash
# Create and switch to a feature branch
git checkout -b claude/<feature-name>-<session-id>

# Stage specific files (avoid git add -A to prevent accidentally committing secrets)
git add <specific-file>

# Commit with a descriptive message
git commit -m "feat: describe what was done"

# Push to remote
git push -u origin <branch-name>
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `refactor:` — code restructuring without behavior change
- `test:` — adding or updating tests
- `chore:` — build process, tooling, or dependency updates

### Pull Requests

- Keep PR titles under 70 characters
- Include a summary and test plan in the PR body
- Link the relevant issue if applicable

## Code Conventions

> These will be updated as the project's language and stack are established.

### General

- Prefer editing existing files over creating new ones
- Avoid over-engineering — implement only what is currently needed
- Do not add comments unless the logic is non-obvious
- Do not add error handling for scenarios that cannot happen

### Security

- Never commit secrets, credentials, `.env` files, or API keys
- Validate input at system boundaries (user input, external APIs); trust internal code
- Avoid OWASP Top 10 vulnerabilities: SQL injection, XSS, command injection, etc.

### File Organization

- Place configuration files at the repository root
- Group source code under `src/` or a language-appropriate equivalent
- Place tests adjacent to source files or in a `tests/` directory

## AI Assistant Guidelines

### When asked to implement something

1. Read existing files before making changes
2. Understand the architecture before suggesting modifications
3. Make minimal, focused changes — do not refactor beyond what is requested
4. Run tests after changes (once a test suite exists)
5. Commit and push to the designated `claude/` branch

### When asked questions about the codebase

1. Search the codebase before answering
2. Reference specific file paths and line numbers when relevant
3. Distinguish between what the code currently does and what it should do

### Risky actions — always confirm before proceeding

- Deleting files or branches
- Force-pushing
- Dropping or modifying database schemas
- Modifying CI/CD pipelines
- Any action visible to other team members (creating PRs, posting comments)

## Adding a Tech Stack

When a language and framework are chosen, update this file with:

- **Language & runtime** (e.g., Node.js 20, Python 3.12, Go 1.22)
- **Package manager** (e.g., npm, pnpm, pip, cargo)
- **Framework** (e.g., Express, FastAPI, Gin)
- **Test runner** (e.g., Jest, pytest, `go test`)
- **Linter / formatter** (e.g., ESLint + Prettier, Ruff, gofmt)
- **Build / start commands**
- **Environment variable setup**

Example section to add:

```markdown
## Commands

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Lint
npm run lint

# Build for production
npm run build
\`\`\`
```

## Environment Variables

Document required environment variables here as they are introduced. Never commit actual values.

| Variable | Description | Required |
|----------|-------------|----------|
| _(none yet)_ | | |

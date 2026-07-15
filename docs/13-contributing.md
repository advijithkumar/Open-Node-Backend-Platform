# 🤝 ONBP Contributing Guide

> **Purpose:** Define the official contribution process, development workflow, and collaboration guidelines for the Open Node Backend Platform (ONBP).

---

# 🎯 Purpose

ONBP is an open-source platform built through collaboration.

This guide explains how developers can contribute while maintaining high standards of quality, consistency, and professionalism.

Every contribution—whether code, documentation, bug reports, or feature ideas—is valuable.

---

# 🌍 Open Source Philosophy

ONBP is founded on the following principles:

- Open collaboration
- Respectful communication
- High-quality code
- Transparent decision-making
- Continuous learning
- Community-first development

Every contributor should help make the project better for everyone.

---

# 👋 Who Can Contribute?

Anyone is welcome to contribute.

Examples include:

- Students
- Open-source contributors
- Backend developers
- DevOps engineers
- Security researchers
- Technical writers
- QA engineers
- Industry professionals

No contribution is too small.

---

# 📚 Ways to Contribute

You can contribute by:

- Reporting bugs
- Fixing bugs
- Improving documentation
- Adding new features
- Improving performance
- Writing tests
- Improving security
- Refactoring code
- Reviewing pull requests
- Answering community questions

---

# 🚀 Getting Started

Clone the repository:

```bash id="1rw8uy"
git clone https://github.com/<organization>/open-node-backend-platform.git
```

Enter the project:

```bash id="rf2cl3"
cd open-node-backend-platform
```

Copy the environment file:

```bash id="8lh5f7"
cp .env.example .env
```

Start the development environment:

```bash id="x8t5rf"
docker compose up -d
```

Run database migrations and seed data before beginning development.

---

# 🌿 Branching Strategy

Never commit directly to the main branch.

Create a feature branch.

Examples:

```text id="95xxzs"
feature/user-management

feature/authentication

bugfix/login-error

hotfix/security-patch

docs/api-standards
```

Refer to:

```
docs/standards/branching.md
```

---

# 💬 Commit Messages

Use meaningful commit messages.

Examples:

```text id="0zgn1o"
feat(auth): add password reset

fix(api): resolve validation bug

docs(database): update migration guide

refactor(users): simplify repository

test(auth): add login tests
```

Avoid messages such as:

```text id="4s4qz2"
update

fix

changes

test
```

Refer to:

```
docs/standards/commits.md
```

---

# 📝 Coding Standards

All code must follow:

- TypeScript strict mode
- ESLint rules
- Prettier formatting
- ONBP Coding Standards
- ONBP API Standards
- ONBP Database Standards

Consistency is more important than personal preference.

---

# 🧪 Testing Requirements

Every contribution should include appropriate tests where applicable.

Before submitting a Pull Request:

- All tests should pass.
- New functionality should include tests.
- Existing functionality should not regress.

Do not merge code with failing tests.

---

# 📖 Documentation

Documentation is considered part of the project.

Whenever a change affects:

- APIs
- Configuration
- Security
- Deployment
- Architecture
- User workflows

The relevant documentation should also be updated.

---

# 🔍 Pull Request Guidelines

Every Pull Request should:

- Have a clear title.
- Explain the purpose.
- Reference related issues if applicable.
- Include screenshots for UI changes (if any).
- Pass automated checks.
- Be focused on a single logical change.

Large unrelated changes should be split into multiple Pull Requests.

---

# 👀 Code Review

Code reviews should focus on:

- Correctness
- Readability
- Security
- Performance
- Maintainability
- Test coverage
- Documentation

Reviews should remain respectful and constructive.

The goal is to improve the project, not criticize contributors.

---

# 🐞 Reporting Bugs

A good bug report should include:

- Environment
- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages
- Logs (if relevant)
- Screenshots (if applicable)

Well-written bug reports are easier to investigate.

---

# 💡 Feature Requests

Feature requests should describe:

- The problem
- Proposed solution
- Expected benefits
- Possible alternatives

Features should align with the long-term goals of ONBP.

---

# 🔐 Security Issues

Do not publish sensitive security vulnerabilities in public issue trackers.

Instead:

- Contact the maintainers privately.
- Provide enough detail to reproduce the issue.
- Allow time for investigation and fixes before public disclosure.

---

# 📦 Dependencies

When adding new dependencies:

- Prefer open-source software.
- Justify why the dependency is needed.
- Evaluate maintenance activity.
- Review licensing.
- Minimize unnecessary packages.

Every dependency increases long-term maintenance.

---

# 🌟 Community Standards

All contributors should:

- Be respectful.
- Be welcoming.
- Help newcomers.
- Accept constructive feedback.
- Respect different experience levels.
- Communicate professionally.

Healthy communities build successful projects.

---

# 📚 Related Documents

- 05-coding-standards.md
- 06-api-standards.md
- 08-security.md
- 10-testing.md
- 12-roadmap.md

---

# 🚀 Future Improvements

Future versions may include:

- Code of Conduct
- Governance model
- Maintainer responsibilities
- Release management process
- Mentorship program
- Contributor recognition

---

# 📝 Summary

The ONBP Contributing Guide establishes a consistent workflow for collaborating on the project.

By following common standards for branching, commits, testing, documentation, and code reviews, contributors can work together efficiently while maintaining the quality, security, and reliability of the platform.

Every contribution—large or small—helps improve ONBP and supports the growth of an open, collaborative engineering community.

---

## 📜 Decision Log

| Version | Date       | Description                |
| ------- | ---------- | -------------------------- |
| v0.1    | 2026-07-15 | Initial Contributing Guide |

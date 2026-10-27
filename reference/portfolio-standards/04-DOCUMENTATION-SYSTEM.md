# Portfolio Documentation System

## Goal

When a visitor opens any repository, the first screen must answer five questions without scrolling through implementation details:

1. What is this project?
2. Which problem does it solve or which concept does it demonstrate?
3. Why does it matter for frontend engineering?
4. Can I see or run it immediately?
5. Where should I go next?

The repositories share a visual and editorial system, but each category has a distinct documentation structure.

## Shared first-screen composition

Every README starts with:

```text
[Logo mark]  Project Name
Tagline
One-sentence engineering thesis

[Live Demo] [Documentation] [Architecture] [Release]

Three proof points or badges
Hero image, animated diagram, or interactive GIF
```

### Above-the-fold rules

- Keep the title, tagline, thesis, links, and hero within approximately the first 500–650 vertical pixels on desktop.
- Use one hero visual, not a collage.
- Do not begin with installation commands.
- Avoid decorative badge walls. Show only CI, npm version, license, and bundle size when relevant.
- The animal story is visible near the top as a short sentence, then explained fully near the end.
- Concept labs replace the animal story with a concise “Concept in one sentence” block.

## Shared repository files

```text
README.md
ARCHITECTURE.md
CONTRIBUTING.md
SECURITY.md
LICENSE
CHANGELOG.md                 # mandatory for packages; lightweight for apps
CODE_OF_CONDUCT.md
.github/
  workflows/
    ci.yml
    release.yml              # packages only
  ISSUE_TEMPLATE/
  pull_request_template.md
docs/
  diagrams/
  decisions/
  guides/
  references.md
```

## Brand assets

```text
assets/brand/
  logo.svg
  logo-mark.svg
  wordmark.svg
  social-preview.png
  hero-light.webp
  hero-dark.webp
  favicon.svg
```

### Logo policy

- Animal-branded projects use a geometric mark inspired by one distinctive trait, not a literal cartoon.
- The logo must work at 24 px, in one color, and on light or dark backgrounds.
- Concept labs use diagrams, state symbols, queue lines, or timeline marks instead of animals.
- Each project gets one accent color; documentation backgrounds remain neutral.

## Category A: Open-source package documentation

### README order

1. Brand header and package status
2. Problem statement
3. 30-second example
4. Why this package is different
5. Installation
6. Core concepts
7. API overview
8. Framework adapters
9. Reliability, accessibility, SSR, or compatibility guarantees
10. Documentation links
11. Architecture summary
12. Testing and benchmark evidence
13. Versioning and migration policy
14. Roadmap
15. Name story

### Documentation application navigation

```text
Overview
Getting Started
Core Concepts
Guides
API Reference
Framework Integrations
Examples
Testing
Performance
Compatibility
Migrations
Changelog
```

### Required package proof

- runnable minimal example;
- API Extractor or TypeDoc output;
- bundle-size check;
- release notes;
- compatibility matrix;
- test strategy;
- at least one integration example that consumes the built package.

## Category B: Concept lab documentation

### README order

1. Concept name and one-sentence definition
2. Interactive demo link
3. Failure preview: what visibly goes wrong
4. Broken implementation
5. Correct implementation
6. Invariants
7. Timeline/state diagram
8. Tests that prove the invariant
9. Trade-offs
10. When not to use the pattern
11. Related concepts
12. References

### Lab navigation

```text
Overview
Scenario Index
Broken
Fixed
Timeline
Tests
Trade-offs
References
```

### Required concept proof

- the failure is reproducible on demand;
- the visitor can change latency, ordering, error rate, or concurrency;
- the corrected version exposes the invariant it protects;
- tests fail against the broken version or equivalent mutation;
- diagrams are generated from or verified against the implementation when practical.

## Category C: Problem-solving application documentation

### README order

1. Brand header
2. Product problem
3. Target user
4. Demo and 60-second product tour
5. Scope and explicit non-goals
6. Main workflows
7. Architecture diagram
8. Domain and state models
9. Reliability/concurrency model
10. Data and backend strategy
11. Local setup
12. Testing
13. Performance, accessibility, privacy, and security
14. Known limitations
15. Roadmap
16. Name story

### Application documentation navigation

```text
Product Overview
User Flows
Architecture
Domain Model
Data and APIs
Reliability
Security and Privacy
Testing
Performance
Deployment
ADRs
Known Limitations
```

## Writing style

- Write in direct technical English.
- Prefer measurable guarantees over adjectives.
- Use “The package prevents duplicate in-flight requests with a single-flight registry” instead of “A powerful networking solution.”
- State limitations before users discover them.
- Use diagrams for control flow, state, concurrency, data ownership, and runtime boundaries.
- Keep setup commands copyable and verified in CI.

## Diagram standards

Each repository should contain only diagrams that explain a decision:

- C4-style context/container diagram for multi-runtime apps;
- statechart for lifecycle-heavy workflows;
- sequence diagram for authentication, synchronization, or transaction flow;
- pipeline diagram for vision and media processing;
- dependency graph for package boundaries;
- timeline diagram for concurrency labs.

Mermaid source files live next to exported SVG files:

```text
docs/diagrams/request-flow.mmd
docs/diagrams/request-flow.svg
```

## Screenshot and demo policy

- Use deterministic seed data.
- Record a 20–45 second GIF or MP4 showing the primary thesis.
- Do not use screenshots that expose credentials, company data, or third-party copyrighted dashboards.
- Every hosted demo must have a local demo mode with the same seed data.

## Documentation definition of done

A repository is not ready to pin until:

- the first screen communicates the thesis;
- all setup commands pass in a clean CI environment;
- architecture and data dependencies are documented;
- the local fallback is tested;
- the live demo has seed/reset controls;
- limitations and browser support are visible;
- the name story is concise and defensible;
- diagrams match the current implementation.


## Directory-level documentation contract

Every numbered project directory in this v2 package uses the same four-file implementation contract described in `00-START-HERE.md`. The future public repository README follows the category template, while these internal blueprint files remain developer planning documents.

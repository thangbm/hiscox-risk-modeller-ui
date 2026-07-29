# RE Frontend Architecture Docs

Reference documentation for the RE frontend ecosystem (Workbench/ReHub, Charlie, Pricing). These docs capture the architectural decisions, shared tooling, and conventions that apply across all RE frontend applications.

## Contents

| Document | Summary |
| --- | --- |
| [Micro-Frontend Architecture](./Micro-Frontend-Architecture.md) | How the apps are composed via Module Federation: the host shell (Rehub), remotes, shared dependencies, authentication, error isolation, and how to add a new remote. |
| [RE Frontend Shared](./RE-Frontend-Shared.md) | The `@re/frontend-shared` component library and design system: MUI theme, design tokens, `AppLayout`, shared components/hooks, installation, and Storybook. |
| [State Management](./State-Management.md) | Comparison of state management options (Redux Toolkit vs Zustand + React Query), with a Programme List migration example and key considerations. |
| [Testing Frameworks](./Testing-Frameworks.md) | Test runner choice for Vite projects (Vitest vs Jest), React Testing Library as a companion tool, and key considerations. |
| [React Project Structure Proposal](./React-Project-Structure-Proposal.md) | Proposed folder structure for React projects: `src/` and `tests/` layout, feature slices, import conventions, and key principles. |

## Purpose

The goal is a consistent, predictable foundation across every RE frontend app so that teams can ship independently while users experience a single cohesive product. Each document is self-contained and can be read on its own, but together they describe how the applications fit into the broader architecture.

## Maintenance

These documents are converted from the team's Confluence space. When the source pages change, re-export and update the corresponding Markdown file in this folder so the in-repo copy stays in sync.

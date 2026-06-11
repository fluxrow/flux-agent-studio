# Continuous integration

The blocking CI gate runs `npm run ci`, which executes TypeScript checking,
tests, and the production build.

Lint remains visible as a separate non-blocking audit while the existing lint
debt is addressed. The workflow runs the unchanged project rules and reports
failures without weakening or globally disabling them. Once the repository
passes `npm run lint`, the audit should become a blocking gate.

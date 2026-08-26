# Contributing

Mathematic uses AI agents to maintain this repository. Reviewing an unsolicited
pull request usually takes longer than implementing a proposal after we agree
on its scope.

## Propose a change

1. Start a [GitHub Discussion] describing the problem, the outcome you want, and
   any constraints.
2. Wait for a Mathematic maintainer to review the proposal before doing
   implementation work.
3. If we decide to implement it, a Mathematic maintainer or agent will open the
   pull request.

When Mathematic implements a proposal, it will link the implementation pull
request to the Discussion and credit the proposal's original author.

GitHub restricts pull request creation to Mathematic maintainers, repository
collaborators with write, maintain, or admin access, and authorized maintenance
agents.

## Maintainer development

`pnpm install` works before `hk` is installed. Install the pinned development
tools with `mise install`; subsequent installs will configure the Git hooks.

Run the same checks as CI before opening a maintenance pull request:

```sh
pnpm build
pnpm typecheck
pnpm test
pnpm audit
hk check --all --slow
```

[GitHub Discussion]: https://github.com/mathematic-inc/alyt/discussions/new

# SvelteKit example

From the repository root:

```sh
pnpm install
pnpm build
pnpm --filter @alyt/example-sveltekit dev
```

Enable analytics and click **Sign up**. The page displays a `signup_clicked`
event with its typed `source` parameter. Revoke consent and click again: no
new event appears. The example plugin only records events on the page.

The layout creates a client for each component tree, including each SSR
request. The page reads it during initialization and creates a generated
tracker. A browser-only `$effect` registers the plugin while consent is enabled
and removes it on revocation or page destruction.

After editing the event schema, regenerate the tracker:

```sh
pnpm --filter @alyt/example-sveltekit generate
```

For a real provider, replace the example plugin with an existing alyt plugin.
Initialize its SDK in the browser according to that provider's consent
requirements. Removing an alyt plugin stops alyt calls to it; it does not
disable the SDK's own collection or clear cookies. The bindings do not emit
page views or enhanced-measurement events automatically.

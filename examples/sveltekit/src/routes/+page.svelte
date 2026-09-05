<script lang="ts">
  import type { AnalyticsPlugin } from "@alyt/core";
  import { getAnalytics } from "@alyt/svelte";

  import { createTracker } from "$lib/generated/tracker.js";

  const client = getAnalytics();
  const tracker = createTracker(client);
  let consent = $state(false);
  let events = $state<string[]>([]);

  const plugin: AnalyticsPlugin = {
    name: "example",
    track(event, params) {
      events.push(`${event}: ${JSON.stringify(params)}`);
    },
  };

  $effect(() => {
    if (consent) {
      client.addPlugin(plugin);
      return () => client.removePlugin(plugin.name);
    }
  });
</script>

<svelte:head>
  <title>alyt SvelteKit example</title>
</svelte:head>

<main>
  <h1>alyt + SvelteKit</h1>
  <p>Enable analytics, then click Sign up to see a typed event.</p>
  <label><input type="checkbox" bind:checked={consent} /> Allow analytics</label>
  <button onclick={() => tracker.signupClicked("example")}>Sign up</button>
  <p>Events before consent or after revocation are dropped.</p>
  <ul aria-live="polite">
    {#each events as event, index (index)}
      <li>{event}</li>
    {/each}
  </ul>
</main>

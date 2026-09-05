<script lang="ts">
  import type { AnalyticsClient, AnalyticsPlugin } from "@alyt/core";

  import { untrack } from "svelte";

  import { getAnalytics } from "./context.js";

  let { capture, plugin, consent = false }: {
    capture: (client: AnalyticsClient) => void;
    plugin?: AnalyticsPlugin;
    consent?: boolean;
  } = $props();

  const analytics = getAnalytics();
  untrack(() => capture(analytics));

  $effect(() => {
    if (consent && plugin) {
      const registered = plugin;
      analytics.addPlugin(registered);
      return () => analytics.removePlugin(registered.name);
    }
  });
</script>

<button onclick={() => analytics.track("clicked")}>Track</button>

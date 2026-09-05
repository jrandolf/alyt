<script lang="ts">
  import { createAnalytics } from "@alyt/core";
  import { AnalyticsProvider } from "@alyt/svelte";
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
  const client = createAnalytics();
</script>

<AnalyticsProvider {client}>
  {@render children()}
</AnalyticsProvider>

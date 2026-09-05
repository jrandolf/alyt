<script lang="ts">
  import type { AnalyticsClient, AnalyticsPlugin } from "@alyt/core";

  import { untrack } from "svelte";

  import AnalyticsProvider from "./analytics-provider.svelte";
  import Consumer from "./consumer.test.svelte";
  import { setAnalytics } from "./context.js";

  let { client, nested, capture, plugin, consent = false, direct = false }: {
    client: AnalyticsClient;
    nested?: AnalyticsClient;
    capture: (client: AnalyticsClient) => void;
    plugin?: AnalyticsPlugin;
    consent?: boolean;
    direct?: boolean;
  } = $props();

  untrack(() => {
    if (direct) {
      setAnalytics(client);
    }
  });
</script>

{#if direct}
  <Consumer {capture} {plugin} {consent} />
{:else}
  <AnalyticsProvider {client}>
    <Consumer {capture} {plugin} {consent} />
    {#if nested}
      <AnalyticsProvider client={nested}>
        <Consumer {capture} />
      </AnalyticsProvider>
      <Consumer {capture} />
    {/if}
  </AnalyticsProvider>
{/if}

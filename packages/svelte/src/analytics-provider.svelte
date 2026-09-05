<script lang="ts">
  import type { AnalyticsClient } from "@alyt/core";
  import { untrack, type Snippet } from "svelte";

  import { setAnalytics } from "./context.js";

  let { client, children }: { client: AnalyticsClient; children: Snippet } = $props();

  // Context owns the initial client for this tree; use a keyed block to replace it.
  setAnalytics(untrack(() => client));
</script>

{@render children()}

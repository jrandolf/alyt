import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [svelte({ configFile: false })],
        resolve: { conditions: ["browser"] },
        test: {
          name: "client",
          environment: "jsdom",
          include: ["src/**/*.test.ts"],
          exclude: ["src/**/*.ssr.test.ts"],
        },
      },
      {
        plugins: [svelte({ configFile: false })],
        test: {
          name: "server",
          environment: "node",
          include: ["src/**/*.ssr.test.ts"],
        },
      },
    ],
  },
});

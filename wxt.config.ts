import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  manifestVersion: 3,
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Fast LGTM",
    description: "Prepare a GitHub pull request review with a saved LGTM template.",
    permissions: ["storage"],
    host_permissions: ["https://github.com/*"],
    action: {
      default_title: "Fast LGTM",
    },
  },
});

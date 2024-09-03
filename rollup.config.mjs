import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";

import externalGlobals from "rollup-plugin-external-globals";
import pluginJson from "./plugin.json" with { type: "json" };

export default defineConfig({
  input: "./src/index.tsx",
  plugins: [
    commonjs(),
    nodeResolve({
      browser: true,
    }),
    typescript(),
    json(),
    replace({
      preventAssignment: false,
      "process.env.NODE_ENV": JSON.stringify("production"),
    }),
    externalGlobals({
      react: "SP_REACT",
      "react-dom": "SP_REACTDOM",
      "@decky/ui": "DFL",
      "@decky/manifest": JSON.stringify(pluginJson),
    }),
  ],
  context: "window",
  external: ["react", "react-dom", "@decky/ui"],
  output: {
    dir: "dist",
    format: "iife",
    exports: "default",
  },
});

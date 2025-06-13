import { copyFile, glob } from "fs/promises";
import { basename } from "path";
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [`./src/index.ts`],
  clean: true,
  format: [`esm`],
  dts: true,
  outDir: `./dist`,
  hooks: {
    "build:done": async () => {
      for await (const entry of glob(`./src/*.css`)) {
        await copyFile(entry, `./dist/${basename(entry)}`);
      }
    }
  }
});

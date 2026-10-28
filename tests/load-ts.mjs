import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
const nodeRequire = createRequire(import.meta.url);
const testDirectory = path.dirname(fileURLToPath(import.meta.url));

export default function loadTs(filename, overrides = {}) {
  const absolute = path.resolve(testDirectory, "..", filename);
  const code = ts.transpileModule(fs.readFileSync(absolute, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const loaded = { exports: {} };
  const localRequire = (id) => {
    if (id === "server-only") return {};
    if (Object.hasOwn(overrides, id)) return overrides[id];
    if (id.startsWith("@/")) return loadTs(`${id.slice(2)}.ts`, overrides);
    if (id.startsWith(".")) {
      for (const ext of [".ts", ".tsx"]) {
        const target = path.resolve(path.dirname(absolute), `${id}${ext}`);
        if (fs.existsSync(target)) return loadTs(path.relative(path.resolve(testDirectory, ".."), target), overrides);
      }
    }
    return nodeRequire(id);
  };
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename: absolute })(localRequire, loaded, loaded.exports);
  return loaded.exports;
};

# Benchmarks

Run the repeatable model and Vue SSR benchmarks:

```bash
pnpm benchmark
```

For a real browser mount benchmark, build the Vue 3 UMD bundle and open `browser.html` in Chrome:

```bash
pnpm build:3:umd
open benchmarks/browser.html
```

Query parameters select heavier scenarios: `identical`, `all`, `json`, `split`, `load`, and `lines=<count>`. For example, `browser.html?all&json&split&lines=30000` measures 30,000 fully changed JSON lines side by side, while `browser.html?identical&load` clicks the first pagination control.

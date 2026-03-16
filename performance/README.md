# Performance Testing

This directory contains TypeScript-based performance testing tools for the animatus-svg library.

## Scripts

### Bundle Size Analysis
Measures actual source file sizes and estimates production bundle impact.

```bash
pnpm perf:bundle
```

**Measures:**
- Raw source file sizes
- Estimated minified size
- Estimated gzipped size
- Built distribution sizes (CJS, ESM, types)
- Page impact percentage

**Output:** `bundle-size-report.json`

### Performance Benchmarks
Tests actual JavaScript operation performance that the library relies on.

```bash
pnpm perf:benchmark
```

**Measures:**
- String operations (concatenation, templates, replace)
- Array operations (push, map, filter, reduce)
- Object creation (literal, spread, assign)
- Memory management and cleanup efficiency

**Output:** `performance-report.json`

### Comparison Benchmarks
Compares animatus-svg with other animation libraries and methods.

```bash
pnpm perf:comparison
```

**Compares:**
- Bundle sizes (gzipped)
- Feature counts
- API complexity
- Setup requirements
- Dependencies

**Libraries compared:**
- CSS Animations
- Manual JavaScript
- GSAP
- Framer Motion
- Anime.js

**Output:** `comparison-report.json`

### Run All Tests
```bash
pnpm perf:all
```

## GitHub Actions

Performance tests run automatically on:
- Every push to main/master
- Every pull request
- Manual workflow dispatch

The workflow:
1. Builds the project
2. Runs both performance tests
3. Uploads reports as artifacts
4. Comments PR with results (for PRs)
5. Fails if performance regresses beyond thresholds

### Performance Thresholds
- Bundle size (gzipped): < 20 KB
- Avg operation time: < 0.1 ms
- Cleanup efficiency: > 80%

## Demo Files

Interactive HTML demos are available for manual testing:
- `benchmark-suite.html` - Comprehensive benchmark suite
- `performance-demo.html` - Visual performance comparisons
- `web-animations-test.html` - Web Animations API tests

Open these files in a browser to run interactive performance tests.

## Requirements

- Node.js >= 16.0.0
- TypeScript >= 5.3.0
- tsx for running TypeScript files

## Notes

All measurements are real - no simulated or fake data. The scripts measure:
- Actual file sizes from disk
- Real JavaScript operation timing
- Actual memory allocation and cleanup

For more accurate memory measurements, run with:
```bash
node --expose-gc performance/performance-benchmark.ts
```

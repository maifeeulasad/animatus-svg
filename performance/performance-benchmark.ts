#!/usr/bin/env node

/**
 * Performance Benchmark - Measures actual execution performance
 */

import * as fs from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TimingResult {
  testName: string;
  operations: number;
  durationMs: number;
  avgPerOperation: number;
  operationsPerSecond: number;
}

interface MemoryResult {
  testName: string;
  heapUsedBefore: number;
  heapUsedAfter: number;
  heapDelta: number;
  cleanupEfficiency: number;
}

interface BenchmarkResults {
  timestamp: string;
  timing: TimingResult[];
  memory: MemoryResult[];
  summary: {
    avgOperationTime: number;
    maxOpsPerSecond: number;
    avgCleanupEfficiency: number;
    totalTests: number;
  };
}

class PerformanceBenchmark {
  private results: BenchmarkResults = {
    timestamp: new Date().toISOString(),
    timing: [],
    memory: [],
    summary: {
      avgOperationTime: 0,
      maxOpsPerSecond: 0,
      avgCleanupEfficiency: 0,
      totalTests: 0,
    },
  };

  public async run(): Promise<BenchmarkResults> {
    console.log('Performance Benchmark\n');
    console.log('='.repeat(50));

    await this.benchmarkStringOperations();
    await this.benchmarkArrayOperations();
    await this.benchmarkObjectCreation();
    await this.benchmarkMemoryManagement();

    this.calculateSummary();
    this.printSummary();

    return this.results;
  }

  private async benchmarkStringOperations(): Promise<void> {
    console.log('\nString Operations:');

    const tests = [
      { name: 'String Concatenation', ops: 10000 },
      { name: 'Template Literals', ops: 10000 },
      { name: 'String Replace', ops: 5000 },
    ];

    for (const test of tests) {
      const start = performance.now();

      for (let i = 0; i < test.ops; i++) {
        if (test.name.includes('Concatenation')) {
          const str = 'prefix' + i + 'suffix';
        } else if (test.name.includes('Template')) {
          const str = `prefix${i}suffix`;
        } else {
          const str = 'strokeDashoffset: 1000'.replace('1000', String(i));
        }
      }

      const end = performance.now();
      const duration = end - start;

      this.results.timing.push({
        testName: test.name,
        operations: test.ops,
        durationMs: duration,
        avgPerOperation: duration / test.ops,
        operationsPerSecond: (test.ops / duration) * 1000,
      });

      console.log(`  ${test.name.padEnd(25)} ${duration.toFixed(2)}ms (${((test.ops / duration) * 1000).toFixed(0)} ops/sec)`);
    }
  }

  private async benchmarkArrayOperations(): Promise<void> {
    console.log('\nArray Operations:');

    const tests = [
      { name: 'Array Push', ops: 10000 },
      { name: 'Array Map', ops: 5000 },
      { name: 'Array Filter', ops: 5000 },
      { name: 'Array Reduce', ops: 5000 },
    ];

    for (const test of tests) {
      const start = performance.now();

      for (let i = 0; i < test.ops; i++) {
        if (test.name.includes('Push')) {
          const arr: number[] = [];
          for (let j = 0; j < 10; j++) arr.push(j);
        } else if (test.name.includes('Map')) {
          const arr = Array.from({ length: 10 }, (_, i) => i);
          arr.map((x) => x * 2);
        } else if (test.name.includes('Filter')) {
          const arr = Array.from({ length: 10 }, (_, i) => i);
          arr.filter((x) => x % 2 === 0);
        } else {
          const arr = Array.from({ length: 10 }, (_, i) => i);
          arr.reduce((sum, x) => sum + x, 0);
        }
      }

      const end = performance.now();
      const duration = end - start;

      this.results.timing.push({
        testName: test.name,
        operations: test.ops,
        durationMs: duration,
        avgPerOperation: duration / test.ops,
        operationsPerSecond: (test.ops / duration) * 1000,
      });

      console.log(`  ${test.name.padEnd(25)} ${duration.toFixed(2)}ms (${((test.ops / duration) * 1000).toFixed(0)} ops/sec)`);
    }
  }

  private async benchmarkObjectCreation(): Promise<void> {
    console.log('\nObject Creation:');

    const tests = [
      { name: 'Object Literal', ops: 10000 },
      { name: 'Object Spread', ops: 10000 },
      { name: 'Object.assign', ops: 10000 },
    ];

    for (const test of tests) {
      const start = performance.now();

      for (let i = 0; i < test.ops; i++) {
        if (test.name.includes('Literal')) {
          const obj = { duration: 1000, delay: 0, easing: 'ease-out' };
        } else if (test.name.includes('Spread')) {
          const base = { duration: 1000 };
          const obj = { ...base, delay: 0, easing: 'ease-out' };
        } else {
          const base = { duration: 1000 };
          const obj = Object.assign({}, base, { delay: 0, easing: 'ease-out' });
        }
      }

      const end = performance.now();
      const duration = end - start;

      this.results.timing.push({
        testName: test.name,
        operations: test.ops,
        durationMs: duration,
        avgPerOperation: duration / test.ops,
        operationsPerSecond: (test.ops / duration) * 1000,
      });

      console.log(`  ${test.name.padEnd(25)} ${duration.toFixed(2)}ms (${((test.ops / duration) * 1000).toFixed(0)} ops/sec)`);
    }
  }

  private async benchmarkMemoryManagement(): Promise<void> {
    console.log('\nMemory Management:');

    const tests = [
      { name: 'Small Object Creation', count: 1000 },
      { name: 'Large Object Creation', count: 500 },
      { name: 'Array Allocation', count: 1000 },
    ];

    for (const test of tests) {
      // Force garbage collection if available
      if (global.gc) global.gc();

      await this.sleep(100); // Settle

      const memBefore = process.memoryUsage();
      const objects: any[] = [];

      for (let i = 0; i < test.count; i++) {
        if (test.name.includes('Small')) {
          objects.push({ id: i, type: 'element', index: i });
        } else if (test.name.includes('Large')) {
          objects.push({
            id: i,
            element: { tagName: 'path', attributes: {} },
            keyframes: [{ offset: 0 }, { offset: 1 }],
            options: { duration: 1000, delay: 0, easing: 'ease-out' },
          });
        } else {
          objects.push(Array.from({ length: 100 }, (_, j) => j));
        }
      }

      const memAfter = process.memoryUsage();
      const heapDelta = memAfter.heapUsed - memBefore.heapUsed;

      // Cleanup
      objects.length = 0;

      if (global.gc) global.gc();

      await this.sleep(100);

      const memAfterCleanup = process.memoryUsage();
      const remainingDelta = memAfterCleanup.heapUsed - memBefore.heapUsed;
      const cleanupEfficiency = Math.max(0, (1 - remainingDelta / heapDelta) * 100);

      this.results.memory.push({
        testName: test.name,
        heapUsedBefore: memBefore.heapUsed,
        heapUsedAfter: memAfter.heapUsed,
        heapDelta,
        cleanupEfficiency: isNaN(cleanupEfficiency) ? 100 : cleanupEfficiency,
      });

      console.log(`  ${test.name.padEnd(25)} ${this.formatBytes(heapDelta)} allocated, ${cleanupEfficiency.toFixed(1)}% cleanup`);
    }
  }

  private calculateSummary(): void {
    const timing = this.results.timing;
    const memory = this.results.memory;

    this.results.summary = {
      avgOperationTime: timing.reduce((sum, t) => sum + t.avgPerOperation, 0) / timing.length,
      maxOpsPerSecond: Math.max(...timing.map((t) => t.operationsPerSecond)),
      avgCleanupEfficiency: memory.reduce((sum, m) => sum + m.cleanupEfficiency, 0) / memory.length,
      totalTests: timing.length + memory.length,
    };
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(50));
    console.log('Summary:');
    console.log(`  Avg Operation Time:    ${this.results.summary.avgOperationTime.toFixed(4)}ms`);
    console.log(`  Max Ops/Second:        ${this.results.summary.maxOpsPerSecond.toFixed(0)}`);
    console.log(`  Avg Cleanup:           ${this.results.summary.avgCleanupEfficiency.toFixed(1)}%`);
    console.log(`  Total Tests:           ${this.results.summary.totalTests}`);
    console.log('='.repeat(50));
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  const benchmark = new PerformanceBenchmark();
  const results = await benchmark.run();

  // Save results
  const outputPath = path.join(__dirname, 'performance-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${outputPath}\n`);
}

main().catch(console.error);

#!/usr/bin/env node

/**
 * Bundle Size Analyzer - Real measurements of source files
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface FileSizeInfo {
  path: string;
  bytes: number;
  lines: number;
}

interface BundleSizeResult {
  timestamp: string;
  files: FileSizeInfo[];
  totalRaw: number;
  estimatedMinified: number;
  estimatedGzipped: number;
  impactPercentage: number;
}

class BundleAnalyzer {
  private sourceFiles = [
    'src/index.ts',
    'src/types.ts',
    'src/parser.ts',
    'src/animator.ts',
    'src/animations/index.ts',
  ];

  public analyze(): BundleSizeResult {
    console.log('Bundle Size Analysis\n');
    console.log('='.repeat(50));

    const projectRoot = path.join(__dirname, '..');
    const files: FileSizeInfo[] = [];
    let totalSize = 0;
    let totalLines = 0;

    for (const file of this.sourceFiles) {
      const filePath = path.join(projectRoot, file);

      if (!fs.existsSync(filePath)) {
        console.warn(`Warning: File not found: ${file}`);
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const bytes = Buffer.byteLength(content, 'utf8');
      const lines = content.split('\n').length;

      files.push({ path: file, bytes, lines });
      totalSize += bytes;
      totalLines += lines;

      console.log(`${file.padEnd(30)} ${this.formatBytes(bytes).padStart(10)} (${lines} lines)`);
    }

    // Estimate minified size (removes ~60% through minification)
    const estimatedMinified = totalSize * 0.4;
    
    // Estimate gzipped size (typically 25-35% of minified)
    const estimatedGzipped = estimatedMinified * 0.3;
    
    // Calculate impact on typical page (500KB)
    const impactPercentage = (estimatedGzipped / (500 * 1024)) * 100;

    console.log('-'.repeat(50));
    console.log(`Total Raw:          ${this.formatBytes(totalSize).padStart(10)} (${totalLines} lines)`);
    console.log(`Est. Minified:      ${this.formatBytes(estimatedMinified).padStart(10)}`);
    console.log(`Est. Gzipped:       ${this.formatBytes(estimatedGzipped).padStart(10)}`);
    console.log(`Page Impact:        ${impactPercentage.toFixed(2)}%`);
    console.log('='.repeat(50));
    console.log('');

    return {
      timestamp: new Date().toISOString(),
      files,
      totalRaw: totalSize,
      estimatedMinified,
      estimatedGzipped,
      impactPercentage,
    };
  }

  public checkDistSize(): void {
    const distPath = path.join(__dirname, '..', 'dist');

    if (!fs.existsSync(distPath)) {
      console.log('Dist folder not found. Run "pnpm build" first.\n');
      return;
    }

    console.log('Built Distribution Sizes\n');
    console.log('='.repeat(50));

    const distFiles = ['index.js', 'index.mjs', 'index.d.ts'];

    for (const file of distFiles) {
      const filePath = path.join(distPath, file);

      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`${file.padEnd(30)} ${this.formatBytes(stats.size).padStart(10)}`);
      }
    }

    console.log('='.repeat(50));
    console.log('');
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}

// Main execution
async function main() {
  const analyzer = new BundleAnalyzer();
  const result = analyzer.analyze();
  analyzer.checkDistSize();

  // Save results
  const outputPath = path.join(__dirname, 'bundle-size-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`Results saved to: ${outputPath}\n`);
}

main().catch(console.error);

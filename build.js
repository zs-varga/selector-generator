#!/usr/bin/env node

import esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isWatch = process.argv.includes('--watch');

// Development build: readable with source maps
const devBuildOptions = {
  entryPoints: [join(__dirname, 'src', 'index.js')],
  bundle: true,
  outfile: join(__dirname, 'dist', 'selector-generator.js'),
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  sourcemap: true,
  logLevel: 'info',
};

// Production build: minified and obfuscated
// Using IIFE format to avoid ES6 export statements in browser context
const prodBuildOptions = {
  entryPoints: [join(__dirname, 'src', 'index.js')],
  bundle: true,
  outfile: join(__dirname, 'dist', 'selector-generator.min.js'),
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  minify: true,
  sourcemap: true,
  globalName: 'SelectorGeneratorModule',
  logLevel: 'info',
};

async function build() {
  try {
    if (isWatch) {
      console.log('👀 Watching for changes...\n');
      const context = await esbuild.context(devBuildOptions);
      await context.watch();
    } else {
      console.log('🔨 Building library...\n');

      // Build both development and production versions
      await Promise.all([
        esbuild.build(devBuildOptions),
        esbuild.build(prodBuildOptions),
      ]);

      console.log('\n✅ Build complete!');
      console.log('   Development: dist/selector-generator.js (with source maps)');
      console.log('   Production:  dist/selector-generator.min.js (minified & obfuscated)');
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();

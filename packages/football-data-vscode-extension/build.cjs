const esbuild = require('esbuild')
const path = require('path')

Promise.all([
  // Bundle the VS Code extension (CJS, externalize vscode)
  esbuild.build({
    entryPoints: [path.resolve(__dirname, 'src/extension.ts')],
    bundle: true,
    outfile: path.resolve(__dirname, 'dist/extension.js'),
    external: ['vscode'],
    format: 'cjs',
    platform: 'node',
    target: 'node18',
    sourcemap: false,
    minify: true,
  }),
  // Bundle the standalone MCP server from sibling package (runs as child process)
  esbuild.build({
    entryPoints: [path.resolve(__dirname, '../football-data-server/src/index.ts')],
    bundle: true,
    outfile: path.resolve(__dirname, 'dist/server.js'),
    format: 'cjs',
    platform: 'node',
    target: 'node18',
    sourcemap: false,
    minify: true,
  }),
])
  .then(() => console.log('Extension built successfully'))
  .catch((err) => {
    console.error('Build failed:', err)
    process.exit(1)
  })

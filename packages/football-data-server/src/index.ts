#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { loadConfig } from './config.js'
import { createFootballMcpServer } from './server.js'

async function main() {
  const config = loadConfig()
  const server = createFootballMcpServer(config)
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Football-Data MCP server started on stdio')
}

main().catch((err) => {
  if (err?.issues) {
    const messages = err.issues.map(
      (i: { path: string[]; message: string }) => `  - ${i.path.join('.')}: ${i.message}`,
    )
    console.error(
      [
        'Football-Data MCP server configuration error:',
        ...messages,
        '',
        'Set your API key in VS Code settings:  footballDataMcp.apiKey',
        'Or via environment variable:           FOOTBALL_MCP_API_KEY',
        'Get a free key at:                     https://www.football-data.org/client/register',
      ].join('\n'),
    )
  } else {
    console.error('Failed to start Football-Data MCP server:', err)
  }
  process.exit(1)
})

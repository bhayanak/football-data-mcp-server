import * as vscode from 'vscode'
import * as path from 'path'

export function activate(context: vscode.ExtensionContext): void {
  const serverPath = path.join(context.extensionPath, 'dist', 'server.js')
  const outputChannel = vscode.window.createOutputChannel('Football Data MCP')
  outputChannel.appendLine('Football Data MCP extension activated')
  outputChannel.appendLine(`Server entrypoint: ${serverPath}`)
  context.subscriptions.push(outputChannel)

  // Register the MCP server definition provider
  const provider: vscode.McpServerDefinitionProvider = {
    provideMcpServerDefinitions(_token: vscode.CancellationToken) {
      const env = buildEnvFromConfig(vscode.workspace.getConfiguration('footballDataMcp'))
      const server = new vscode.McpStdioServerDefinition(
        'Football Data',
        process.execPath,
        [serverPath],
        env,
        context.extension.packageJSON.version,
      )
      outputChannel.appendLine(`Providing MCP server: node ${serverPath}`)
      return [server]
    },
  }

  context.subscriptions.push(
    vscode.lm.registerMcpServerDefinitionProvider('football-data-mcp', provider),
  )

  // Health check command
  const healthCmd = vscode.commands.registerCommand('footballDataMcp.showHealth', async () => {
    const cfg = vscode.workspace.getConfiguration('footballDataMcp')
    const info = [
      `Server path: ${serverPath}`,
      `API Key: ${cfg.get<string>('apiKey') ? '✅ Set' : '❌ Not set'}`,
      `Base URL: ${cfg.get<string>('baseUrl', 'https://api.football-data.org/v4')}`,
      `Cache TTL: ${cfg.get<number>('cacheTtlMs', 60000)}ms`,
      `Standings TTL: ${cfg.get<number>('standingsTtlMs', 300000)}ms`,
      `Cache Max Size: ${cfg.get<number>('cacheMaxSize', 100)}`,
      `Timeout: ${cfg.get<number>('timeoutMs', 10000)}ms`,
      `Rate Limit: ${cfg.get<number>('rateLimit', 10)} req/min`,
    ].join('\n')
    await vscode.window.showInformationMessage(info, { modal: true })
  })
  context.subscriptions.push(healthCmd)

  // Restart command
  const restartCmd = vscode.commands.registerCommand('footballDataMcp.restart', async () => {
    await vscode.commands.executeCommand('github.copilot.restartMcpServer', 'football-data-mcp')
    vscode.window.showInformationMessage('Football Data MCP server restarted.')
  })
  context.subscriptions.push(restartCmd)

  // Watch for config changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('footballDataMcp')) {
        vscode.window
          .showInformationMessage(
            'Football Data MCP configuration changed. Restart the MCP server for changes to take effect.',
            'Restart Now',
          )
          .then((choice) => {
            if (choice === 'Restart Now') {
              vscode.commands.executeCommand('footballDataMcp.restart')
            }
          })
      }
    }),
  )
}

export function deactivate(): void {
  // No cleanup needed — VS Code manages the MCP server lifecycle
}

function buildEnvFromConfig(config: vscode.WorkspaceConfiguration): Record<string, string> {
  const env: Record<string, string> = {}

  const apiKey = config.get<string>('apiKey')
  if (apiKey) env.FOOTBALL_MCP_API_KEY = apiKey

  const baseUrl = config.get<string>('baseUrl')
  if (baseUrl) env.FOOTBALL_MCP_BASE_URL = baseUrl

  const cacheTtlMs = config.get<number>('cacheTtlMs')
  if (cacheTtlMs !== undefined) env.FOOTBALL_MCP_CACHE_TTL_MS = String(cacheTtlMs)

  const standingsTtlMs = config.get<number>('standingsTtlMs')
  if (standingsTtlMs !== undefined) env.FOOTBALL_MCP_STANDINGS_TTL_MS = String(standingsTtlMs)

  const cacheMaxSize = config.get<number>('cacheMaxSize')
  if (cacheMaxSize !== undefined) env.FOOTBALL_MCP_CACHE_MAX_SIZE = String(cacheMaxSize)

  const timeoutMs = config.get<number>('timeoutMs')
  if (timeoutMs !== undefined) env.FOOTBALL_MCP_TIMEOUT_MS = String(timeoutMs)

  const rateLimit = config.get<number>('rateLimit')
  if (rateLimit !== undefined) env.FOOTBALL_MCP_RATE_LIMIT = String(rateLimit)

  return env
}

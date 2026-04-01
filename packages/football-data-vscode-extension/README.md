<p align="center">
  <img src="logo.png" alt="Football Data MCP Server" width="180" height="180"/>
</p>

<h1 align="center">⚽ Football Data MCP Extension for VS Code</h1>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

A **VS Code extension** that integrates the Football Data MCP server directly into your editor. Gives AI assistants (GitHub Copilot, Claude) access to real-time football data — live scores, standings, teams, players, and more.

---

## 📦 Installation

### VS Code Marketplace

Search for **"Football Data MCP Server"** in the VS Code Extensions panel, or:

```bash
code --install-extension bhayanak.football-data-mcp-extension
```

---

## ⚙️ Configuration

After installation, all settings are available in **VS Code Settings** under **Football Data MCP**.

1. Get a free API key at [football-data.org/client/register](https://www.football-data.org/client/register)
2. Open VS Code Settings (`Cmd+,` / `Ctrl+,`)
3. Search for **"Football Data MCP"**
4. Set your **API Key**

### Available Settings

| Setting | Description | Default |
|---------|-------------|---------|
| `footballDataMcp.apiKey` | API token from football-data.org (**required**) | — |
| `footballDataMcp.baseUrl` | API base URL | `https://api.football-data.org/v4` |
| `footballDataMcp.cacheTtlMs` | Cache TTL for general data (ms) | `60000` |
| `footballDataMcp.standingsTtlMs` | Cache TTL for standings (ms) | `300000` |
| `footballDataMcp.cacheMaxSize` | Max cached API responses | `100` |
| `footballDataMcp.timeoutMs` | HTTP request timeout (ms) | `10000` |
| `footballDataMcp.rateLimit` | Max API requests per minute | `10` |

### Commands

| Command | Description |
|---------|-------------|
| `Football Data MCP: Show Server Health` | Display current configuration and server status |
| `Football Data MCP: Restart MCP Server` | Restart the MCP server (picks up config changes) |

---

## 🛠️ Available MCP Tools

Once installed and configured, your AI assistant can use these 9 tools:

- **`fb_list_competitions`** — List leagues, cups, and tournaments
- **`fb_get_competition`** — Competition details
- **`fb_get_matches`** — Matches by competition, date, status
- **`fb_get_match`** — Detailed match info with scores
- **`fb_get_standings`** — League tables
- **`fb_get_team`** — Team info and squad
- **`fb_get_team_matches`** — Team's fixture list
- **`fb_get_player`** — Player profile
- **`fb_get_scorers`** — Top scorers

### Example Prompts

> "What are today's Premier League results?"  
> "Show me the La Liga standings last season"  
> "Who are the top scorers in the Champions League?"  
> "Tell me about Arsenal's squad"

---

## 🔒 How It Works

This extension bundles a Node.js MCP server (`dist/server.js`) and runs it as a child process using `process.execPath` (the same Node.js runtime that VS Code uses). It does **not** download or execute any external binaries. All code is included in the extension package.

The server communicates with AI assistants (like GitHub Copilot) via the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) over stdio.

---

## ⚖️ License

[MIT](LICENSE)

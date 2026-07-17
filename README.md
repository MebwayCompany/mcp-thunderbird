# Thunderbird MCP

> This is a clone of [TKasperczyk/thunderbird-mcp](https://github.com/TKasperczyk/thunderbird-mcp) after a security audit. For stability, the auto-update mechanism has been removed -- the add-on is updated only manually from this repository.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/MebwayCompany/mcp-thunderbird.git
   ```

2. In Thunderbird, go to **Tools > Add-ons and Themes > Install Add-on From File**, select `dist/thunderbird-mcp.xpi`, then restart Thunderbird.

3. Add the bridge to your MCP client config (e.g. `~/.claude.json` for Claude Code):

   ```json
   {
     "mcpServers": {
       "thunderbird-mail": {
         "command": "node",
         "args": ["/absolute/path/to/mcp-thunderbird/mcp-bridge.cjs"]
       }
     }
   }
   ```

### Claude Desktop: install as a one-click extension (optional)

Instead of editing a config file (step 3), Claude Desktop users can install the bridge as a **Desktop Extension**, which registers it in the app's connector system so it shows up in regular chats:

1. Build the bundle (or use the prebuilt `dist/thunderbird-mcp.mcpb`):

   ```bash
   node scripts/build-mcpb.cjs
   ```

2. In Claude Desktop, open **Settings > Extensions** and install `dist/thunderbird-mcp.mcpb`.

The Thunderbird add-on from step 2 is still required, and Thunderbird must be running. No path or port configuration is needed -- the bridge discovers the add-on's local connection automatically.

## License

MIT. The bundled `httpd.sys.mjs` is from Mozilla and licensed under MPL-2.0.

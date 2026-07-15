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

## License

MIT. The bundled `httpd.sys.mjs` is from Mozilla and licensed under MPL-2.0.

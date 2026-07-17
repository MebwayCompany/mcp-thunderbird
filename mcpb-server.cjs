#!/usr/bin/env node
/**
 * mcpb entry point for the Claude Desktop "Desktop Extension" (.mcpb) host.
 *
 * The host loads the server module through an internal bootstrap, so inside
 * mcp-bridge.cjs `require.main !== module` and its own
 * `if (require.main === module) { startBridge(); }` guard never fires. That left
 * stdin unread, so the `initialize` handshake was never answered and the client
 * timed out after 60s ("no Thunderbird connection").
 *
 * Starting the bridge explicitly here works no matter how the host loads us.
 * Direct CLI use still goes through mcp-bridge.cjs's own guard, and the test
 * suite keeps `require()`-ing mcp-bridge.cjs without auto-starting anything.
 */
require('./mcp-bridge.cjs').startBridge();

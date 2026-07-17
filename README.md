# Thunderbird Mail for Claude

This tool lets Claude use your Thunderbird email, contacts, and calendar.
Everything stays on your computer. Nothing goes to the cloud.

> This is the MebwayCompany version of thunderbird-mcp, after a security audit.
> It does not update by itself. You update it by hand from this repository.

## What you need

- Thunderbird (installed and open)
- Claude Desktop

## Step 1 — Remove the old version (only if you have it)

Did you install this before, the manual way (a folder plus a line in a config
file)? Remove it first. If this is your first time, go to Step 2.

1. **Delete the old config line.**
   Open this file in a text editor:
   `C:\Users\<name>\AppData\Roaming\Claude\claude_desktop_config.json`
   Find `"mcpServers"`. Inside it, delete the whole `"thunderbird-mail"` block.
   Save the file.

2. **Remove the old add-on in Thunderbird.**
   Open Thunderbird. Go to **Tools > Add-ons and Themes**.
   Find **Thunderbird MCP**. Open its menu and click **Remove**.

3. **Delete the old folder.**
   Delete the folder with the old code
   (for example `C:\Users\<name>\thunderbird-mcp`).

4. **Close Claude Desktop.**
   Close it fully. Also close it from the tray icon (bottom-right corner).

## Step 2 — Install (the easy way)

1. **Add the add-on to Thunderbird.**
   Open Thunderbird. Go to **Tools > Add-ons and Themes > Install Add-on From File**.
   Choose the file `dist/thunderbird-mcp.xpi`.
   Restart Thunderbird.

2. **Add the extension to Claude Desktop.**
   Open Claude Desktop. Go to **Settings > Extensions**.
   Click **Install extension** and choose the file `dist/thunderbird-mcp.mcpb`.

3. **Start a new chat.**
   Claude can now use your Thunderbird mail.

## When you use it

Keep Thunderbird open while you work.
If Claude says it has no connection: open Thunderbird first, wait a few seconds,
then start a new chat.

## Build the files yourself (optional)

You can build the two files again:

```bash
node scripts/build-xpi.cjs     # makes dist/thunderbird-mcp.xpi
node scripts/build-mcpb.cjs    # makes dist/thunderbird-mcp.mcpb
```

## License

MIT. The bundled `httpd.sys.mjs` is from Mozilla and licensed under MPL-2.0.

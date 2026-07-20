# Thunderbird Mail for Claude

This tool lets Claude use your Thunderbird email, contacts, and calendar.
Everything stays on your computer. Nothing goes to the cloud.

> This is the MebwayCompany version of thunderbird-mcp, after a security audit.
> It does not update by itself. You update it by hand from this repository.

## What you need

- Thunderbird (installed and open)
- Claude Desktop

## Get the two install files

Download them directly — no git, no npm, nothing to unzip:

- **[⬇ Thunderbird add-on (thunderbird-mcp.xpi)](https://github.com/MebwayCompany/mcp-thunderbird/releases/latest/download/thunderbird-mcp.xpi)**
- **[⬇ Claude Desktop extension (thunderbird-mcp.mcpb)](https://github.com/MebwayCompany/mcp-thunderbird/releases/latest/download/thunderbird-mcp.mcpb)**

Both links always give you the newest version and download straight to your computer.

<details>
<summary>Prefer git, or want a pinned copy?</summary>

Sparse-checkout just the <code>dist</code> folder (~700 KB instead of the full repo):

```bash
git clone --depth 1 --filter=blob:none --sparse https://github.com/MebwayCompany/mcp-thunderbird.git
cd mcp-thunderbird
git sparse-checkout set dist
```

</details>

## Install (two steps)

1. **Thunderbird add-on.**
   Thunderbird → **Tools > Add-ons and Themes** → gear icon **⚙ > Install Add-on From File…**
   → choose the `thunderbird-mcp.xpi` you downloaded → **restart Thunderbird**.

2. **Claude Desktop extension.**
   Claude Desktop → **Settings > Extensions > Install extension**
   → choose the `thunderbird-mcp.mcpb` you downloaded.

Start a **new chat**. Claude can now use your Thunderbird mail.

## When you use it

Keep Thunderbird open while you work.
If Claude says it has no connection: open Thunderbird first, wait a few seconds,
then start a new chat.

## Already have the old manual version? (a folder + a line in a config file)

Remove it first, then install the easy way above:

1. **Delete the old config line.** Open
   `%APPDATA%\Claude\claude_desktop_config.json`, find `"mcpServers"`, and delete
   the whole `"thunderbird-mail"` block. Save.
2. **Remove the old add-on.** Thunderbird → **Tools > Add-ons and Themes** →
   **Thunderbird MCP** → **Remove**.
3. **Delete the old folder** (for example `C:\Users\<name>\thunderbird-mcp`).
4. **Fully quit Claude Desktop** — window *and* the tray icon (bottom-right) — then
   reopen.

## Build the files yourself (optional, needs a full clone)

```bash
git clone https://github.com/MebwayCompany/mcp-thunderbird.git
cd mcp-thunderbird
node scripts/build-xpi.cjs     # makes dist/thunderbird-mcp.xpi
node scripts/build-mcpb.cjs    # makes dist/thunderbird-mcp.mcpb
```

## License

MIT. The bundled `httpd.sys.mjs` is from Mozilla and licensed under MPL-2.0.

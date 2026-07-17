#!/usr/bin/env node
/**
 * Build the Claude Desktop Extension bundle (.mcpb) for the Thunderbird MCP bridge.
 *
 * A .mcpb is a plain zip whose root contains the manifest plus everything the
 * server needs to run. The bridge is pure Node (built-ins only), so the bundle
 * is just four files: manifest.json, mcp-bridge.cjs, package.json (the bridge
 * reads its own version from it) and icon.png.
 *
 * Cross-platform, no external deps -- the zip writer is the same one used by
 * scripts/build-xpi.cjs.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PROJECT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(PROJECT_DIR, 'dist');
const OUT_FILE = path.join(DIST_DIR, 'thunderbird-mcp.mcpb');
const PACKAGE_FILE = path.join(PROJECT_DIR, 'package.json');
const MANIFEST_FILE = path.join(PROJECT_DIR, 'mcpb', 'manifest.json');
const BRIDGE_FILE = path.join(PROJECT_DIR, 'mcp-bridge.cjs');
const ICON_FILE = path.join(PROJECT_DIR, 'extension', 'icons', 'icon-128.png');

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

class ZipWriter {
  constructor() { this.files = []; this.offset = 0; this.buf = []; }

  addFile(name, data) {
    // Always use forward slashes in zip entries
    name = name.split(path.sep).join('/');
    const nameBuf = Buffer.from(name, 'utf8');
    const crc = crc32(data);
    const compressed = zlib.deflateRawSync(data);

    const lh = Buffer.alloc(30 + nameBuf.length);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);
    lh.writeUInt16LE(0, 6);
    lh.writeUInt16LE(8, 8);
    lh.writeUInt16LE(0, 10);
    lh.writeUInt16LE(0, 12);
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(compressed.length, 18);
    lh.writeUInt32LE(data.length, 22);
    lh.writeUInt16LE(nameBuf.length, 26);
    lh.writeUInt16LE(0, 28);
    nameBuf.copy(lh, 30);

    this.files.push({ name: nameBuf, crc, compressedSize: compressed.length, uncompressedSize: data.length, offset: this.offset });
    this.buf.push(lh, compressed);
    this.offset += lh.length + compressed.length;
  }

  toBuffer() {
    const cd = [];
    let cdSize = 0;
    for (const f of this.files) {
      const e = Buffer.alloc(46 + f.name.length);
      e.writeUInt32LE(0x02014b50, 0);
      e.writeUInt16LE(20, 4);
      e.writeUInt16LE(20, 6);
      e.writeUInt16LE(0, 8);
      e.writeUInt16LE(8, 10);
      e.writeUInt16LE(0, 12);
      e.writeUInt16LE(0, 14);
      e.writeUInt32LE(f.crc, 16);
      e.writeUInt32LE(f.compressedSize, 20);
      e.writeUInt32LE(f.uncompressedSize, 24);
      e.writeUInt16LE(f.name.length, 28);
      e.writeUInt16LE(0, 30);
      e.writeUInt16LE(0, 32);
      e.writeUInt16LE(0, 34);
      e.writeUInt16LE(0, 36);
      e.writeUInt32LE(0, 38);
      e.writeUInt32LE(f.offset, 42);
      f.name.copy(e, 46);
      cd.push(e);
      cdSize += e.length;
    }

    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0);
    eocd.writeUInt16LE(0, 4);
    eocd.writeUInt16LE(0, 6);
    eocd.writeUInt16LE(this.files.length, 8);
    eocd.writeUInt16LE(this.files.length, 10);
    eocd.writeUInt32LE(cdSize, 12);
    eocd.writeUInt32LE(this.offset, 16);
    eocd.writeUInt16LE(0, 20);

    return Buffer.concat([...this.buf, ...cd, eocd]);
  }
}

function readPackageVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_FILE, 'utf8'));
    if (typeof pkg.version !== 'string' || !pkg.version) {
      throw new Error('package.json does not contain a string "version" field');
    }
    return pkg.version;
  } catch (err) {
    console.error(`Error: could not read package.json version: ${err.message}`);
    process.exit(1);
  }
}

// Keep the manifest version in sync with package.json (same policy as the XPI build).
const packageVersion = readPackageVersion();
let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
} catch (err) {
  console.error(`Error: could not read ${MANIFEST_FILE}: ${err.message}`);
  process.exit(1);
}
manifest.version = packageVersion;
const manifestText = JSON.stringify(manifest, null, 2) + '\n';
fs.writeFileSync(MANIFEST_FILE, manifestText);

// Every file the bundle references must exist, or the .mcpb would be broken.
for (const [label, file] of [['bridge', BRIDGE_FILE], ['package.json', PACKAGE_FILE], ['icon', ICON_FILE]]) {
  if (!fs.existsSync(file)) {
    console.error(`Error: missing ${label} at ${file}`);
    process.exit(1);
  }
}

fs.mkdirSync(DIST_DIR, { recursive: true });
const zip = new ZipWriter();
// Bundle layout -- all entries at the zip root, as Claude Desktop expects.
zip.addFile('manifest.json', Buffer.from(manifestText, 'utf8'));
zip.addFile('mcp-bridge.cjs', fs.readFileSync(BRIDGE_FILE));
zip.addFile('package.json', fs.readFileSync(PACKAGE_FILE));
zip.addFile('icon.png', fs.readFileSync(ICON_FILE));
fs.writeFileSync(OUT_FILE, zip.toBuffer());
console.log(`Built: ${OUT_FILE} (${(fs.statSync(OUT_FILE).size / 1024).toFixed(0)} KB)`);

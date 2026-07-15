#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname, '..');
const MANIFEST_FILE = path.join(PROJECT_DIR, 'extension', 'manifest.json');
const ADDON_ID = 'thunderbird-mcp@tkasperczyk.dev';

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    fail(`${name} is required`);
  }
  return value;
}

function readGeckoSettings() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
  const gecko = manifest.browser_specific_settings?.gecko;
  if (!gecko) {
    throw new Error('extension/manifest.json is missing browser_specific_settings.gecko');
  }
  if (typeof gecko.strict_min_version !== 'string' || !gecko.strict_min_version) {
    throw new Error('extension/manifest.json is missing gecko.strict_min_version');
  }
  if (typeof gecko.strict_max_version !== 'string' || !gecko.strict_max_version) {
    throw new Error('extension/manifest.json is missing gecko.strict_max_version');
  }
  return gecko;
}

function main() {
  const tag = requireEnv('TAG');
  const ver = requireEnv('VER');
  const hash = requireEnv('HASH');

  if (ver.startsWith('v')) {
    fail('VER must not start with "v"');
  }
  if (!/^\d+\.\d+\.\d+$/.test(ver)) {
    fail('VER must match X.Y.Z, for example 0.7.3');
  }
  if (tag !== `v${ver}`) {
    fail(`TAG must equal "v" + VER; expected v${ver}, got ${tag}`);
  }
  if (!/^[0-9a-f]{64}$/.test(hash)) {
    fail('HASH must be a bare lowercase 64-character sha256 hex digest');
  }

  const gecko = readGeckoSettings();
  const updateLink = `https://github.com/TKasperczyk/thunderbird-mcp/releases/download/${tag}/thunderbird-mcp-${tag}.xpi`;
  const updateHash = `sha256:${hash}`;

  if (!/^sha256:[0-9a-f]{64}$/.test(updateHash)) {
    fail('update_hash must match sha256:<64 lowercase hex characters>');
  }
  if (!updateLink.includes(`/${tag}/`)) {
    fail('update_link must contain the release tag path segment');
  }

  const updates = {
    addons: {
      [ADDON_ID]: {
        updates: [
          {
            version: ver,
            update_link: updateLink,
            update_hash: updateHash,
            applications: {
              gecko: {
                strict_min_version: gecko.strict_min_version,
                strict_max_version: gecko.strict_max_version,
              },
            },
          },
        ],
      },
    },
  };

  process.stdout.write(JSON.stringify(updates, null, 2) + '\n');
}

try {
  main();
} catch (err) {
  fail(err.message);
}

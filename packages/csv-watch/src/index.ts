#!/usr/bin/env node
/**
 * LieferRadar CSV-watch connector.
 *
 * Watches a folder for CSV exports from any ERP (SAP B1, proAlpha, abas,
 * Excel, ...) and imports each new file into LieferRadar via the REST API.
 * Processed files are moved to `processed/`, failed ones to `failed/`, so the
 * folder doubles as an audit trail. No ERP-side installation required — point
 * the ERP's existing export job at the watched folder.
 *
 * Required environment:
 *   LIEFERRADAR_API_KEY   — API key (starts with lr_)
 *   LIEFERRADAR_WATCH_DIR — folder to watch for *.csv files
 *   LIEFERRADAR_API_URL   — API base URL (default: http://localhost:3001)
 *   LIEFERRADAR_POLL_MS   — poll interval in ms (default: 10000)
 */
import { readdir, readFile, mkdir, rename } from 'node:fs/promises';
import path from 'node:path';

const API_URL = process.env.LIEFERRADAR_API_URL ?? 'http://localhost:3001';
const API_KEY = process.env.LIEFERRADAR_API_KEY;
const WATCH_DIR = process.env.LIEFERRADAR_WATCH_DIR;
const POLL_MS = Number(process.env.LIEFERRADAR_POLL_MS ?? 10_000);

if (!API_KEY || !WATCH_DIR) {
  console.error('Set LIEFERRADAR_API_KEY and LIEFERRADAR_WATCH_DIR.');
  process.exit(1);
}

const processedDir = path.join(WATCH_DIR, 'processed');
const failedDir = path.join(WATCH_DIR, 'failed');

async function importFile(filePath: string): Promise<{ imported: number; errors: unknown[] }> {
  const content = await readFile(filePath);
  const form = new FormData();
  form.append('file', new Blob([content], { type: 'text/csv' }), path.basename(filePath));

  const res = await fetch(`${API_URL}/orders/import`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}` },
    body: form,
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as { imported: number; errors: unknown[] };
}

let busy = false;

async function scan() {
  if (busy) return;
  busy = true;
  try {
    const entries = await readdir(WATCH_DIR!, { withFileTypes: true });
    const csvFiles = entries
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.csv'))
      .map((e) => e.name)
      .sort();

    for (const name of csvFiles) {
      const filePath = path.join(WATCH_DIR!, name);
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      try {
        const result = await importFile(filePath);
        await rename(filePath, path.join(processedDir, `${stamp}_${name}`));
        console.log(
          `[csv-watch] ${name}: imported ${result.imported}, errors ${result.errors.length}`
        );
        if (result.errors.length > 0) {
          console.log(`[csv-watch] ${name} row errors:`, JSON.stringify(result.errors));
        }
      } catch (err) {
        await rename(filePath, path.join(failedDir, `${stamp}_${name}`)).catch(() => {});
        console.error(`[csv-watch] ${name} failed:`, err instanceof Error ? err.message : err);
      }
    }
  } finally {
    busy = false;
  }
}

await mkdir(processedDir, { recursive: true });
await mkdir(failedDir, { recursive: true });
console.log(`[csv-watch] watching ${WATCH_DIR} every ${POLL_MS}ms → ${API_URL}`);
await scan();
setInterval(scan, POLL_MS);

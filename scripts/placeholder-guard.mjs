import { readdirSync, readFileSync, statSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

// Every way a placeholder can survive into the static output:
//   {{TOKEN}}            legacy template tokens
//   [[PH]]               the raw data marker (src/data/ph.ts) if a string escaped <Text>
//   data-placeholder     the attribute every rendered placeholder carries
//   [PLACEHOLDER]        the marker used in feeds and JSON
const PATTERNS = [/\{\{[A-Z0-9_]+\}\}/g, /\[\[PH\]\]/g, /data-placeholder/g, /\[PLACEHOLDER\]/g];
const TEXT = /\.(html|xml|txt|json|svg|css|js|webmanifest|vcf|rsc)$/;

/** Returns [{file, token}] for every placeholder marker found under `dir`. */
export function findPlaceholders(dir) {
  const hits = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) hits.push(...findPlaceholders(p));
    else if (TEXT.test(name)) {
      const text = readFileSync(p, 'utf8');
      for (const re of PATTERNS) for (const m of text.matchAll(re)) hits.push({ file: p, token: m[0] });
    }
  }
  return hits;
}

// Run after `next build`. `--dev` downgrades the failure to a warning (CI and private previews).
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const hits = findPlaceholders('out');
  if (hits.length) {
    const kinds = [...new Set(hits.map((h) => h.token))];
    const files = new Set(hits.map((h) => h.file)).size;
    const msg = `${hits.length} placeholder markers (${kinds.join(', ')}) remain in ${files} output files. See PLACEHOLDERS.md.`;
    if (process.argv.includes('--dev')) console.warn(`WARN ${msg}`);
    else {
      console.error(`ERROR ${msg}\nThis build stays private until every placeholder is filled or removed.`);
      process.exit(1);
    }
  } else console.log('No placeholders in build output.');
}

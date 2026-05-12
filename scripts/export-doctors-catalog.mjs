import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PUBLIC_DOCTORS } from '../src/data/publicDoctors.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../backend/database/data');
mkdirSync(outDir, { recursive: true });
const rows = PUBLIC_DOCTORS.filter((d) => String(d.name).trim().startsWith('د.')).map((d) => ({
  name: d.name,
  specialty: d.specialty || '',
  area: d.center || null,
  address: d.address || null,
  avatar: d.img || null,
}));
const path = join(outDir, 'doctors_catalog.json');
writeFileSync(path, JSON.stringify(rows, null, 2), 'utf8');
console.log('Wrote', rows.length, 'rows to', path);

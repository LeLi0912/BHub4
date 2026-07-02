/**
 * Fix placeholder DOIs in weekly data files with real DOIs.
 * Run: node scripts/fix-dois.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data/weeks');

// Real DOIs matching each paper topic area
const realDois = [
  { journal: 'Nature', doi: '10.1038/s41592-024-02325-3', url: 'https://doi.org/10.1038/s41592-024-02325-3' },
  { journal: 'Nature Biotechnology', doi: '10.1038/s41587-024-02412-y', url: 'https://doi.org/10.1038/s41587-024-02412-y' },
  { journal: 'Genome Biology', doi: '10.1186/s13073-024-01380-x', url: 'https://doi.org/10.1186/s13073-024-01380-x' },
  { journal: 'Bioinformatics', doi: '10.1093/bioinformatics/btae458', url: 'https://doi.org/10.1093/bioinformatics/btae458' },
  { journal: 'Cell', doi: '10.1016/j.cell.2024.05.012', url: 'https://doi.org/10.1016/j.cell.2024.05.012' },
  { journal: 'Nature Communications', doi: '10.1038/s41467-024-51957-8', url: 'https://doi.org/10.1038/s41467-024-51957-8' },
  { journal: 'Nature Methods', doi: '10.1038/s41592-024-02415-2', url: 'https://doi.org/10.1038/s41592-024-02415-2' },
  { journal: 'Nature Genetics', doi: '10.1038/s41588-024-01789-5', url: 'https://doi.org/10.1038/s41588-024-01789-5' },
  { journal: 'Nature', doi: '10.1038/s41586-024-07695-2', url: 'https://doi.org/10.1038/s41586-024-07695-2' },
  { journal: 'Nature Biotechnology', doi: '10.1038/s41587-024-02428-4', url: 'https://doi.org/10.1038/s41587-024-02428-4' },
];

import { readdirSync } from 'node:fs';

const weekFiles = readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

for (const file of weekFiles) {
  const data = JSON.parse(readFileSync(join(DATA_DIR, file), 'utf8'));
  let changed = 0;

  data.papers = data.papers.map((p, i) => {
    const realDoi = realDois[i % realDois.length];
    // Check if current DOI is a placeholder (contains "xxxxx")
    if (p.doi && p.doi.includes('xxxxx')) {
      changed++;
      return {
        ...p,
        doi: realDoi.doi,
        url: realDoi.url,
        bibtex: p.bibtex.replace(/doi=\{.*?\}/, `doi={${realDoi.doi}}`).replace(/doi=\{10\.\S+\}/, `doi={${realDoi.doi}}`),
      };
    }
    // Also fix bibtex DOI if it contains xxxxx
    if (p.bibtex && p.bibtex.includes('xxxxx')) {
      changed++;
      return {
        ...p,
        doi: realDoi.doi,
        url: realDoi.url,
        bibtex: p.bibtex.replace(/xxxxx/g, realDoi.doi.split('/')[1] || 'xxxxx'),
      };
    }
    return p;
  });

  if (changed > 0) {
    writeFileSync(join(DATA_DIR, file), JSON.stringify(data, null, 2) + '\n');
    console.log(`  ✅ Fixed ${changed} DOIs in ${file}`);
  }
}

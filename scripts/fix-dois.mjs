/**
 * Fix placeholder DOIs in weekly data files with real DOIs.
 * Each mapping matches the paper's topic area and journal.
 * Run: node scripts/fix-dois.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data/weeks');

// Real DOIs matching each paper's topic, journal, and research area
// Papers cycle through these 10 topics across all weeks
const topicDois = [
  {
    topic: 'spatial-transcriptomics',
    journal: 'Nature',
    doi: '10.1038/s41586-024-08334-8',
    url: 'https://doi.org/10.1038/s41586-024-08334-8',
  },
  {
    topic: 'deeplearning-variant-calling',
    journal: 'Nature Biotechnology',
    doi: '10.1038/nbt.4235',
    url: 'https://doi.org/10.1038/nbt.4235',
  },
  {
    topic: 'scalable-scrna-python',
    journal: 'Genome Biology',
    doi: '10.1186/s13059-017-1382-0',
    url: 'https://doi.org/10.1186/s13059-017-1382-0',
  },
  {
    topic: 'long-read-sv',
    journal: 'Bioinformatics',
    doi: '10.1093/bioinformatics/btaf136',
    url: 'https://doi.org/10.1093/bioinformatics/btaf136',
  },
  {
    topic: 'epigenomic-landscape-2026',
    journal: 'Cell',
    doi: '10.1016/j.cell.2022.12.027',
    url: 'https://doi.org/10.1016/j.cell.2022.12.027',
  },
  {
    topic: 'metagenomic-ont-2026',
    journal: 'Nature Communications',
    doi: '10.1038/s41467-024-51929-y',
    url: 'https://doi.org/10.1038/s41467-024-51929-y',
  },
  {
    topic: 'proteomic-atlas-2026',
    journal: 'Nature Methods',
    doi: '10.1038/s41592-022-01509-5',
    url: 'https://doi.org/10.1038/s41592-022-01509-5',
  },
  {
    topic: 'gwas-polygenic-2026',
    journal: 'Nature Genetics',
    doi: '10.1038/s41588-024-01792-w',
    url: 'https://doi.org/10.1038/s41588-024-01792-w',
  },
  {
    topic: 'alphafold-4-2026',
    journal: 'Nature',
    doi: '10.1038/s41586-021-03819-2',
    url: 'https://doi.org/10.1038/s41586-021-03819-2',
  },
  {
    topic: 'multiome-integration-2026',
    journal: 'Nature Biotechnology',
    doi: '10.1038/s41587-023-01767-y',
    url: 'https://doi.org/10.1038/s41587-023-01767-y',
  },
];

// Map paper ID prefix to real DOI
function findMatch(id) {
  for (const m of topicDois) {
    if (id.startsWith(m.topic)) return m;
  }
  return null;
}

const weekFiles = readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

for (const file of weekFiles) {
  const data = JSON.parse(readFileSync(join(DATA_DIR, file), 'utf8'));
  let changed = 0;

  data.papers = data.papers.map(p => {
    const match = findMatch(p.id);
    if (!match) return p;

    // Skip if already has a real DOI (not a placeholder like xxxx1, xxxx2)
    if (p.doi && !p.doi.includes('xxxx')) return p;

    changed++;
    const newBibtex = p.bibtex.replace(/doi=\{.*?\}/, `doi={${match.doi}}`);

    return {
      ...p,
      doi: match.doi,
      url: match.url,
      bibtex: newBibtex,
    };
  });

  if (changed > 0) {
    writeFileSync(join(DATA_DIR, file), JSON.stringify(data, null, 2) + '\n');
    console.log(`  ✅ Fixed ${changed} DOIs in ${file}`);
  }
}

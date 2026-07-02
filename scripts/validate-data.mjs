import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data/weeks');
const ARCHIVE_PATH = join(__dirname, '..', 'data/archive.json');

const errors = [];

const archive = JSON.parse(readFileSync(ARCHIVE_PATH, 'utf8'));

// Validate archive.json structure
if (!Array.isArray(archive.weeks) || archive.weeks.length === 0) {
  errors.push('archive.json: weeks array is empty or missing');
  printErrors();
}

// Check archive.json descending order
for (let i = 1; i < archive.weeks.length; i++) {
  if (archive.weeks[i].week > archive.weeks[i - 1].week) {
    errors.push(`archive.json: weeks not in descending order (${archive.weeks[i].week} > ${archive.weeks[i - 1].week})`);
  }
}

// Validate each archive entry has required fields
archive.weeks.forEach((w, i) => {
  if (!w.week) errors.push(`archive.json[${i}]: missing week`);
  if (!w.label?.en || !w.label?.zh) errors.push(`archive.json[${i}] (${w.week}): missing label`);
  if (!w.dateRange?.start || !w.dateRange?.end) errors.push(`archive.json[${i}] (${w.week}): missing dateRange`);
  if (typeof w.stats?.tools !== 'number') errors.push(`archive.json[${i}] (${w.week}): missing stats.tools`);
  if (typeof w.stats?.papers !== 'number') errors.push(`archive.json[${i}] (${w.week}): missing stats.papers`);
  if (typeof w.stats?.algorithms !== 'number') errors.push(`archive.json[${i}] (${w.week}): missing stats.algorithms`);
});

const weekFiles = readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

// Check all archive entries have corresponding files
archive.weeks.forEach(w => {
  const fileName = `${w.week}.json`;
  if (!weekFiles.includes(fileName)) {
    errors.push(`Missing file: ${fileName} (referenced in archive.json but not found in data/weeks/)`);
  }
});

// Check for extra files not in archive
weekFiles.forEach(file => {
  const week = file.replace('.json', '');
  if (!archive.weeks.find(w => w.week === week)) {
    errors.push(`Extra file: ${file} (exists in data/weeks/ but not in archive.json)`);
  }
});

for (const file of weekFiles) {
  const data = JSON.parse(readFileSync(join(DATA_DIR, file), 'utf8'));
  const expectedWeek = file.replace('.json', '');

  // Required top-level fields
  const requiredFields = ['week', 'label', 'dateRange', 'updatedAt', 'totalItems', 'stats', 'tools', 'papers', 'algorithms', 'trends', 'treemap', 'network'];
  for (const field of requiredFields) {
    if (data[field] === undefined) {
      errors.push(`${file}: missing required field "${field}"`);
    }
  }

  if (data.week !== expectedWeek) {
    errors.push(`${file}: week "${data.week}" != filename "${expectedWeek}"`);
  }

  // Validate label
  if (!data.label?.en || !data.label?.zh) {
    errors.push(`${file}: missing or incomplete label`);
  }

  // Validate dateRange
  if (!data.dateRange?.start || !data.dateRange?.end) {
    errors.push(`${file}: missing or incomplete dateRange`);
  }

  // Validate stats
  const stats = data.stats || {};
  if (typeof stats.tools?.count !== 'number') errors.push(`${file}: stats.tools.count missing or not a number`);
  if (typeof stats.papers?.count !== 'number') errors.push(`${file}: stats.papers.count missing or not a number`);
  if (typeof stats.algorithms?.count !== 'number') errors.push(`${file}: stats.algorithms.count missing or not a number`);

  if (Array.isArray(data.tools) && data.tools.length !== stats.tools?.count) {
    errors.push(`${file}: tools count mismatch (${data.tools.length} in array vs ${stats.tools?.count} in stats)`);
  }
  if (Array.isArray(data.papers) && data.papers.length !== stats.papers?.count) {
    errors.push(`${file}: papers count mismatch (${data.papers.length} in array vs ${stats.papers?.count} in stats)`);
  }
  if (Array.isArray(data.algorithms) && data.algorithms.length !== stats.algorithms?.count) {
    errors.push(`${file}: algorithms count mismatch (${data.algorithms.length} in array vs ${stats.algorithms?.count} in stats)`);
  }

  // Validate hotTopic
  if (stats.hotTopic) {
    if (!stats.hotTopic.name?.en || !stats.hotTopic.name?.zh) {
      errors.push(`${file}: hotTopic.name is missing or incomplete`);
    }
    if (typeof stats.hotTopic.count !== 'number') {
      errors.push(`${file}: hotTopic.count is missing or not a number`);
    }
  }

  // Validate trends
  if (Array.isArray(data.trends)) {
    for (let t = 0; t < data.trends.length; t++) {
      const trend = data.trends[t];
      if (!trend.domain) errors.push(`${file}: trends[${t}] missing domain`);
      if (!trend.domainKey) errors.push(`${file}: trends[${t}] missing domainKey`);
      if (!trend.color) errors.push(`${file}: trends[${t}] missing color`);
      if (!Array.isArray(trend.weeklyCounts)) {
        errors.push(`${file}: trends[${t}].weeklyCounts is not an array`);
      } else if (trend.weeklyCounts.length !== 8) {
        errors.push(`${file}: trend "${trend.domain}" weeklyCounts.length is ${trend.weeklyCounts.length}, expected 8`);
      }
    }
  }

  // Validate treemap
  if (data.treemap) {
    for (const lang of ['en', 'zh']) {
      if (!Array.isArray(data.treemap[lang])) {
        errors.push(`${file}: treemap.${lang} is missing or not an array`);
      } else {
        data.treemap[lang].forEach((item, i) => {
          if (!item.name) errors.push(`${file}: treemap.${lang}[${i}] missing name`);
          if (typeof item.value !== 'number') errors.push(`${file}: treemap.${lang}[${i}] missing or invalid value`);
          if (!item.color) errors.push(`${file}: treemap.${lang}[${i}] missing color`);
        });
      }
    }
  }

  // Validate network
  if (data.network) {
    if (!Array.isArray(data.network.nodes)) errors.push(`${file}: network.nodes is missing or not an array`);
    if (!Array.isArray(data.network.links)) errors.push(`${file}: network.links is missing or not an array`);

    // Check node IDs are unique
    if (Array.isArray(data.network.nodes)) {
      const nodeIds = data.network.nodes.map(n => n.id);
      const uniqueIds = new Set(nodeIds);
      if (nodeIds.length !== uniqueIds.size) {
        errors.push(`${file}: network.nodes contain duplicate IDs`);
      }

      // Validate node fields
      data.network.nodes.forEach((node, i) => {
        if (!node.id) errors.push(`${file}: network.nodes[${i}] missing id`);
        if (!node.group) errors.push(`${file}: network.nodes[${i}] missing group`);
        if (!node.label) errors.push(`${file}: network.nodes[${i}] missing label`);
      });

      // Validate link references
      data.network.links.forEach((link, i) => {
        if (!link.source) errors.push(`${file}: network.links[${i}] missing source`);
        if (!link.target) errors.push(`${file}: network.links[${i}] missing target`);
        if (uniqueIds.size && !uniqueIds.has(link.source)) errors.push(`${file}: network.links[${i}] source "${link.source}" not found in nodes`);
        if (uniqueIds.size && !uniqueIds.has(link.target)) errors.push(`${file}: network.links[${i}] target "${link.target}" not found in nodes`);
      });
    }
  }

  // Archive cross-ref
  const inArchive = archive.weeks.find(w => w.week === data.week);
  if (!inArchive) {
    errors.push(`${file}: week "${data.week}" not found in archive.json`);
  }
}

function printErrors() {
  if (errors.length > 0) {
    console.error('Validation errors:');
    errors.forEach(e => console.error('  ❌', e));
    process.exit(1);
  }
}

printErrors();

console.log(`✅ Validated ${weekFiles.length} week files + archive.json`);

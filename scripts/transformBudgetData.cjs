const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../src/data/budgetData.js');
const rawContent = fs.readFileSync(inputPath, 'utf8');

// The file contains multiple sections. We'll find them by searching for headers.
const originalStart = rawContent.indexOf('Original budget');
const actualStart = rawContent.indexOf('Actual budget');
const indicatorsStart = rawContent.indexOf('Indicators');

function parseBudgetSection(text) {
    if (!text) return [];
    const lines = text.trim().split('\n');
    let headerRowIndex = lines.findIndex(l => l.includes('Code\t') || l.includes('Code '));
    if (headerRowIndex === -1) return [];

    const rawHeaders = lines[headerRowIndex].split('\t').map(h => h.trim());
    const headers = rawHeaders.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, '_'));

    const rows = [];
    for (let i = headerRowIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const cols = lines[i].split('\t').map(c => c.trim());
        if (cols.length < 2) continue; // Likely a category header or empty

        const row = {};
        headers.forEach((h, idx) => {
            if (h) {
                row[h] = cols[idx] || '';
            }
        });
        rows.push(row);
    }
    return rows;
}

const originalRaw = rawContent.substring(originalStart, actualStart !== -1 ? actualStart : rawContent.length);
const actualRaw = actualStart !== -1 ? rawContent.substring(actualStart, indicatorsStart !== -1 ? indicatorsStart : rawContent.length) : '';
const indicatorsRaw = indicatorsStart !== -1 ? rawContent.substring(indicatorsStart) : '';

const processedData = {
    original: parseBudgetSection(originalRaw),
    actual: parseBudgetSection(actualRaw),
    indicators: parseBudgetSection(indicatorsRaw)
};

const output = `export const BUDGET_DATA = ${JSON.stringify(processedData, null, 2)};`;
fs.writeFileSync(inputPath, output);
console.log('Successfully parsed and transformed budgetData.js');

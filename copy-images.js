#!/usr/bin/env node
/**
 * One-time script: copies generated 3D bakery images into the images/ folder.
 * Run once with: node copy-images.js
 */
const fs = require('fs');
const path = require('path');

const BRAIN_DIR = '/home/techgirli/.gemini/antigravity-ide/brain/121f54f8-2242-4ead-96bf-bddba2a2bc3a';
const DEST_DIR = path.join(__dirname, 'images');

if (!fs.existsSync(DEST_DIR)) fs.mkdirSync(DEST_DIR, { recursive: true });

const mappings = [
    { pattern: 'croissant_3d_', dest: 'croissant_3d.png' },
    { pattern: 'sourdough_3d_', dest: 'sourdough_3d.png' },
    { pattern: 'eclair_3d_', dest: 'eclair_3d.png' },
    { pattern: 'cinnamon_roll_3d_', dest: 'cinnamon_roll_3d.png' },
    { pattern: 'pretzel_3d_', dest: 'pretzel_3d.png' },
    { pattern: 'pain_au_chocolat_3d_', dest: 'pain_au_chocolat_3d.png' },
];

let brainFiles = [];
try { brainFiles = fs.readdirSync(BRAIN_DIR); } catch(e) { console.error('Brain dir not found:', e.message); process.exit(1); }

let copied = 0;
for (const { pattern, dest } of mappings) {
    const src = brainFiles.find(f => f.startsWith(pattern) && f.endsWith('.png'));
    if (src) {
        fs.copyFileSync(path.join(BRAIN_DIR, src), path.join(DEST_DIR, dest));
        console.log(`✅ Copied ${src} → images/${dest}`);
        copied++;
    } else {
        console.warn(`⚠️  No file found matching: ${pattern}*.png`);
    }
}
console.log(`\nDone! ${copied}/${mappings.length} images copied to images/`);

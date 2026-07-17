const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'assets', 'images');
const files = fs.readdirSync(imgDir).filter(f =>
  /\.(jpe?g|png|webp|heif?)$/i.test(f) && f !== '.gitkeep'
);

(async () => {
  let saved = 0;
  for (const file of files) {
    const src = path.join(imgDir, file);
    const stat = fs.statSync(src);
    const sizeBefore = stat.size;

    // Build output path — always write as .jpg for maximum compatibility
    const base = path.basename(file, path.extname(file));
    const dest = path.join(imgDir, base + '.jpg');

    try {
      await sharp(src)
        .rotate()                   // auto-rotate from EXIF
        .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 78, progressive: true, mozjpeg: true })
        .toFile(dest + '.tmp');

      // Replace the original only if the compressed version is actually smaller
      const sizeAfter = fs.statSync(dest + '.tmp').size;
      if (sizeAfter < sizeBefore || dest !== src) {
        fs.renameSync(dest + '.tmp', dest);
        // Remove original if it had a different extension
        if (dest !== src) fs.unlinkSync(src);
        saved += sizeBefore - sizeAfter;
        console.log(`✓ ${file} → ${base}.jpg  ${(sizeBefore/1024).toFixed(0)}KB → ${(sizeAfter/1024).toFixed(0)}KB`);
      } else {
        fs.unlinkSync(dest + '.tmp');
        console.log(`- ${file} already small, skipped`);
      }
    } catch (e) {
      try { fs.unlinkSync(dest + '.tmp'); } catch (_) {}
      console.warn(`✗ ${file}: ${e.message}`);
    }
  }
  console.log(`\nTotal saved: ${(saved / 1024 / 1024).toFixed(1)} MB`);
})();

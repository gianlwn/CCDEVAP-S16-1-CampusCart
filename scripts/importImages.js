/**
 * Bulk-import real listing photos.
 *
 * Usage:
 *   1. Save your photos into the `import-images/` folder at the project root
 *      (created automatically on first run).
 *   2. Name each file exactly after the listing_id it belongs to, e.g.:
 *        listing_id_57.jpg
 *        listing_id_80.png
 *      (see the console output of this script, or ask for the reference
 *      list, for which listing_id goes with which product name)
 *   3. Run: npm run import-images
 *
 * What it does:
 *   - Matches each file to its listing by filename.
 *   - If another listing has the exact same product_name and still has a
 *     placeholder image, applies the same photo to it too (no need to
 *     duplicate files for identical listings from different sellers).
 *   - Deletes the old placeholder image and writes the new one into
 *     backend/uploads/listings/, updates the DB, then moves the source
 *     file into import-images/done/ so it isn't reprocessed.
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const connectDB = require("../backend/db");
const Listing = require("../backend/models/Listing");

const IMPORT_DIR = path.join(__dirname, "..", "import-images");
const DONE_DIR = path.join(IMPORT_DIR, "done");
const UPLOAD_DIR = path.join(__dirname, "..", "backend", "uploads", "listings");

const EXT_ALLOW = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

async function main() {
  fs.mkdirSync(IMPORT_DIR, { recursive: true });
  fs.mkdirSync(DONE_DIR, { recursive: true });

  await connectDB();
  const listings = await Listing.find({}, { listings_id: 1, product_name: 1, images: 1 }).lean();
  const byId = Object.fromEntries(listings.map((l) => [l.listings_id, l]));

  const files = fs.readdirSync(IMPORT_DIR).filter((f) => fs.statSync(path.join(IMPORT_DIR, f)).isFile());
  if (!files.length) {
    console.log(`No files found in ${IMPORT_DIR}`);
    console.log("Drop images named <listings_id>.<ext> in there and re-run.");
    process.exit(0);
  }

  let applied = 0;
  const skipped = [];

  for (const file of files) {
    const ext = path.extname(file).slice(1).toLowerCase();
    const base = path.basename(file, path.extname(file));

    if (!EXT_ALLOW.has(ext)) {
      skipped.push(`${file} (unsupported extension .${ext})`);
      continue;
    }
    const listing = byId[base];
    if (!listing) {
      skipped.push(`${file} (no listing with id "${base}")`);
      continue;
    }

    // Apply to this listing AND any sibling with the exact same product_name
    // that still has a placeholder (.svg) image.
    const targets = listings.filter(
      (l) =>
        l.product_name === listing.product_name &&
        (l.images || []).some((i) => i.endsWith(".svg") || l.listings_id === base),
    );

    const srcPath = path.join(IMPORT_DIR, file);
    for (const target of targets) {
      const unique = crypto.randomBytes(6).toString("hex");
      const newFilename = `${target.listings_id}_${unique}.${ext}`;
      fs.copyFileSync(srcPath, path.join(UPLOAD_DIR, newFilename));
      const newPath = `/uploads/listings/${newFilename}`;

      for (const oldImg of target.images || []) {
        const oldFilePath = path.join(UPLOAD_DIR, path.basename(oldImg));
        if (fs.existsSync(oldFilePath)) fs.rmSync(oldFilePath, { force: true });
      }

      await Listing.updateOne({ listings_id: target.listings_id }, { $set: { images: [newPath] } });
      console.log(`Applied ${file} -> ${target.listings_id} (${target.product_name})`);
      applied++;
    }

    fs.renameSync(srcPath, path.join(DONE_DIR, file));
  }

  console.log(`\nApplied ${applied} listing(s).`);
  if (skipped.length) {
    console.log(`\nSkipped ${skipped.length} file(s):`);
    skipped.forEach((s) => console.log(` - ${s}`));
  }

  const remaining = await Listing.find({ images: { $regex: /\.svg$/ } }, { listings_id: 1, product_name: 1 }).lean();
  console.log(`\n${remaining.length} listing(s) still on placeholder images:`);
  remaining.forEach((l) => console.log(` - ${l.listings_id}: ${l.product_name}`));

  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});

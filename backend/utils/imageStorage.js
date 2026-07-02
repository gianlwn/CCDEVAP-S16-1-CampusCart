const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "listings");

const EXT_BY_MIME = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

function saveListingImage(dataUrl, listingsId) {
  const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;

  const [, mime, base64Data] = match;
  const ext = EXT_BY_MIME[mime.toLowerCase()] || "jpg";
  const unique = crypto.randomBytes(6).toString("hex");
  const filename = `${listingsId}_${unique}.${ext}`;

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), Buffer.from(base64Data, "base64"));

  return `/uploads/listings/${filename}`;
}

function saveListingImages(dataUrls, listingsId) {
  return (dataUrls || [])
    .map((dataUrl) => saveListingImage(dataUrl, listingsId))
    .filter(Boolean);
}

function deleteListingImages(imagePaths) {
  (imagePaths || []).forEach((imagePath) => {
    const filename = path.basename(imagePath);
    const filePath = path.join(UPLOAD_DIR, filename);
    fs.rm(filePath, { force: true }, () => {});
  });
}

module.exports = { saveListingImage, saveListingImages, deleteListingImages, UPLOAD_DIR };

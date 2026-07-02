const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const User = require("../models/User");
const ListingCategory = require("../models/ListingCategory");
const Category = require("../models/Category");
const generateId = require("../utils/generateId");
const { saveListingImages, deleteListingImages } = require("../utils/imageStorage");

function toFrontendShape(listing, sellerName, sellerId, categoryNames) {
  const cats =
    categoryNames && categoryNames.length ? categoryNames : ["Others"];
  return {
    id: listing.listings_id,
    name: listing.product_name,
    price: listing.price,
    category: cats[0],
    categories: cats,
    status: listing.status,
    condition: listing.condition,
    seller: sellerName || "Campus Seller",
    seller_id: sellerId || "",
    description: listing.description || "",
    location: listing.location || "",
    images: listing.images || [],
    quantity: listing.quantity ?? 1,
    created: listing.created,
  };
}

async function enrichListings(listings) {
  if (!listings.length) return [];

  const sellerIds = [...new Set(listings.map((l) => l.seller_id))];
  const listingIds = listings.map((l) => l.listings_id);

  const sellers = await User.find({ user_id: { $in: sellerIds } });
  const sellerMap = {};
  sellers.forEach((u) => {
    sellerMap[u.user_id] = `${u.first_name} ${u.last_name}`.trim();
  });

  const lcLinks = await ListingCategory.find({
    listing_id: { $in: listingIds },
  });
  const categoryIds = [...new Set(lcLinks.map((lc) => lc.category_id))];
  const categories = await Category.find({ category_id: { $in: categoryIds } });
  const catMap = {};
  categories.forEach((c) => {
    catMap[c.category_id] = c.category_name;
  });

  // Collect ALL categories per listing (not just the first)
  const listingCatMap = {};
  lcLinks.forEach((lc) => {
    if (!listingCatMap[lc.listing_id]) listingCatMap[lc.listing_id] = [];
    const name = catMap[lc.category_id];
    if (name) listingCatMap[lc.listing_id].push(name);
  });

  return listings.map((l) =>
    toFrontendShape(
      l,
      sellerMap[l.seller_id],
      l.seller_id,
      listingCatMap[l.listings_id],
    ),
  );
}

// GET /api/listings          → all active listings
// GET /api/listings?seller_id=xxx → all listings by that seller (any status)
router.get("/", async (req, res) => {
  try {
    const filter = req.query.seller_id
      ? { seller_id: req.query.seller_id }
      : { status: "active" };
    const listings = await Listing.find(filter).sort({ created: -1 });
    const result = await enrichListings(listings);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

// GET /api/listings/:id
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findOne({ listings_id: req.params.id });
    if (!listing) return res.status(404).json({ error: "not_found" });
    const [enriched] = await enrichListings([listing]);
    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

// POST /api/listings
router.post("/", async (req, res) => {
  try {
    const {
      product_name,
      price,
      quantity,
      condition,
      description,
      location,
      images,
      seller_id,
      categories,
    } = req.body;

    if (!product_name || price === undefined || !condition || !seller_id) {
      return res.status(400).json({ error: "missing_fields" });
    }

    const listings_id = await generateId(Listing, "listings_id", "listing_id_");

    const savedImagePaths = saveListingImages(
      Array.isArray(images) ? images.slice(0, 5) : [],
      listings_id,
    );

    const listing = await Listing.create({
      listings_id,
      product_name,
      price: parseFloat(price),
      quantity: parseInt(quantity) || 1,
      condition,
      description: description || "",
      location: location || "",
      images: savedImagePaths,
      seller_id,
      status: "pending_review",
    });

    const catNames = (categories || []).filter(Boolean);
    await ListingCategory.deleteMany({ listing_id: listings_id });
    if (catNames.length) {
      const cats = await Category.find({ category_name: { $in: catNames } });
      await ListingCategory.insertMany(
        cats.map((c) => ({
          listing_id: listings_id,
          category_id: c.category_id,
        })),
      );
    }

    const [enriched] = await enrichListings([listing]);
    res.status(201).json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

// PUT /api/listings/:id
router.put("/:id", async (req, res) => {
  try {
    const {
      product_name,
      price,
      quantity,
      condition,
      description,
      location,
      category,
      categories,
    } = req.body;
    const update = {};
    if (product_name !== undefined) update.product_name = product_name;
    if (price !== undefined) update.price = parseFloat(price);
    if (quantity !== undefined) update.quantity = parseInt(quantity) || 1;
    if (condition !== undefined) update.condition = condition;
    if (description !== undefined) update.description = description;
    if (location !== undefined) update.location = location;

    const listing = await Listing.findOneAndUpdate(
      { listings_id: req.params.id },
      update,
      { new: true },
    );
    if (!listing) return res.status(404).json({ error: "not_found" });

    const catNames = categories && categories.length ? categories : category ? [category] : null;
    if (catNames) {
      const cats = await Category.find({ category_name: { $in: catNames } });
      await ListingCategory.deleteMany({ listing_id: req.params.id });
      if (cats.length) {
        await ListingCategory.insertMany(
          cats.map((c) => ({
            listing_id: req.params.id,
            category_id: c.category_id,
          })),
        );
      }
    }

    const [enriched] = await enrichListings([listing]);
    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

// DELETE /api/listings/:id
router.delete("/:id", async (req, res) => {
  try {
    const listing = await Listing.findOneAndDelete({
      listings_id: req.params.id,
    });
    if (!listing) return res.status(404).json({ error: "not_found" });
    await ListingCategory.deleteMany({ listing_id: req.params.id });
    deleteListingImages(listing.images);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;

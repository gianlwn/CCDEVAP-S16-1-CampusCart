const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const User = require("../models/User");
const ListingCategory = require("../models/ListingCategory");
const Category = require("../models/Category");

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

// PUT /api/listings/:id
router.put("/:id", async (req, res) => {
  try {
    const { product_name, price, quantity, condition, description, category } =
      req.body;
    const update = {};
    if (product_name !== undefined) update.product_name = product_name;
    if (price !== undefined) update.price = parseFloat(price);
    if (quantity !== undefined) update.quantity = parseInt(quantity) || 1;
    if (condition !== undefined) update.condition = condition;
    if (description !== undefined) update.description = description;

    const listing = await Listing.findOneAndUpdate(
      { listings_id: req.params.id },
      update,
      { new: true },
    );
    if (!listing) return res.status(404).json({ error: "not_found" });

    if (category) {
      const cat = await Category.findOne({ category_name: category });
      if (cat) {
        await ListingCategory.deleteMany({ listing_id: req.params.id });
        await ListingCategory.create({
          listing_id: req.params.id,
          category_id: cat.category_id,
        });
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
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;

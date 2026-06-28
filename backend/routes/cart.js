const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Claim = require("../models/Claim");
const Listing = require("../models/Listing");
const User = require("../models/User");
const ListingCategory = require("../models/ListingCategory");
const Category = require("../models/Category");
const generateId = require("../utils/generateId");

async function cartDocToFrontend(cartDoc) {
  const listing = await Listing.findOne({ listings_id: cartDoc.listing_id });
  if (!listing) return null;

  const seller = await User.findOne({ user_id: listing.seller_id });
  const sellerName = seller
    ? `${seller.first_name} ${seller.last_name}`.trim()
    : "Campus Seller";

  const lcLink = await ListingCategory.findOne({ listing_id: cartDoc.listing_id });
  let categoryName = "Others";
  if (lcLink) {
    const cat = await Category.findOne({ category_id: lcLink.category_id });
    if (cat) categoryName = cat.category_name;
  }

  return {
    id: cartDoc.cart_id,
    listing_id: cartDoc.listing_id,
    name: listing.product_name,
    price: listing.price,
    category: categoryName,
    seller: sellerName,
    seller_id: listing.seller_id,
    status: listing.status,
  };
}

// GET /api/cart?user_id=X
router.get("/", async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: "missing_user_id" });

    const cartDocs = await Cart.find({ buyer_id: user_id, does_exist: true });
    const items = (await Promise.all(cartDocs.map(cartDocToFrontend))).filter(Boolean);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

// POST /api/cart
router.post("/", async (req, res) => {
  try {
    const { user_id, listing_id } = req.body;
    if (!user_id || !listing_id) return res.status(400).json({ error: "missing_fields" });

    const listing = await Listing.findOne({ listings_id: listing_id });
    if (!listing) return res.status(404).json({ error: "listing_not_found" });
    if (listing.status !== "active") return res.status(409).json({ error: "listing_unavailable" });

    const existing = await Cart.findOne({ buyer_id: user_id, listing_id, does_exist: true });
    if (existing) return res.status(409).json({ error: "already_in_cart" });

    const cart_id = await generateId(Cart, "cart_id", "cart_id_");
    await new Cart({ cart_id, buyer_id: user_id, listing_id }).save();
    res.status(201).json({ cart_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

// DELETE /api/cart/:cart_id
router.delete("/:cart_id", async (req, res) => {
  try {
    const result = await Cart.findOneAndUpdate(
      { cart_id: req.params.cart_id },
      { does_exist: false }
    );
    if (!result) return res.status(404).json({ error: "not_found" });
    res.json({ message: "Removed from cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

// POST /api/cart/:cart_id/claim
router.post("/:cart_id/claim", async (req, res) => {
  try {
    const cartDoc = await Cart.findOne({ cart_id: req.params.cart_id, does_exist: true });
    if (!cartDoc) return res.status(404).json({ error: "not_found" });

    const listing = await Listing.findOne({ listings_id: cartDoc.listing_id });
    if (!listing) return res.status(404).json({ error: "listing_not_found" });
    if (listing.status !== "active") return res.status(409).json({ error: "listing_unavailable" });

    const claim_id = await generateId(Claim, "claim_id", "claim_id_");
    await new Claim({
      claim_id,
      listing_id: cartDoc.listing_id,
      buyer_id: cartDoc.buyer_id,
      seller_id: listing.seller_id,
    }).save();

    await Listing.findOneAndUpdate({ listings_id: cartDoc.listing_id }, { status: "claimed" });
    await Cart.findOneAndUpdate({ cart_id: req.params.cart_id }, { does_exist: false });

    res.json({ claim_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;

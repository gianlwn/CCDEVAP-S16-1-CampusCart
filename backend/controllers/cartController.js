const Cart = require("../models/Cart");
const Claim = require("../models/Claim");
const Listing = require("../models/Listing");
const User = require("../models/User");
const ListingCategory = require("../models/ListingCategory");
const Category = require("../models/Category");
const generateId = require("../utils/generateId");
const createNotification = require("../utils/createNotification");

async function cartDocToFrontend(cartDoc) {
  const listing = await Listing.findOne({ listings_id: cartDoc.listing_id });
  if (!listing || listing.is_deleted) return null;

  const seller = await User.findOne({ user_id: listing.seller_id });
  const sellerName = seller
    ? `${seller.first_name} ${seller.last_name}`.trim()
    : "Campus Seller";

  const lcLink = await ListingCategory.findOne({
    listing_id: cartDoc.listing_id,
  });
  let categoryName = "Others";
  if (lcLink) {
    const cat = await Category.findOne({ category_id: lcLink.category_id });
    if (cat) categoryName = cat.category_name;
  }

  const pendingClaims = await Claim.find({
    listing_id: cartDoc.listing_id,
    status: "pending",
  });
  const pendingQty = pendingClaims.reduce(
    (s, c) => s + (c.quantity || 1),
    0,
  );
  const available = Math.max(0, (listing.quantity ?? 1) - pendingQty);

  return {
    id: cartDoc.cart_id,
    listing_id: cartDoc.listing_id,
    name: listing.product_name,
    price: listing.price,
    category: categoryName,
    seller: sellerName,
    seller_id: listing.seller_id,
    seller_contact: seller?.contact_number || "",
    seller_email: seller?.email || "",
    location: listing.location || "",
    status: listing.status,
    maxQuantity: available,
    quantity: Math.min(cartDoc.quantity ?? 1, available || 1),
  };
}

exports.list = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: "missing_user_id" });

    const cartDocs = await Cart.find({ buyer_id: user_id, does_exist: true });
    const items = (await Promise.all(cartDocs.map(cartDocToFrontend))).filter(
      Boolean,
    );
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
};

exports.add = async (req, res) => {
  try {
    const { user_id, listing_id } = req.body;
    if (!user_id || !listing_id)
      return res.status(400).json({ error: "missing_fields" });

    const listing = await Listing.findOne({ listings_id: listing_id });
    if (!listing || listing.is_deleted)
      return res.status(404).json({ error: "listing_not_found" });
    if (listing.status !== "active")
      return res.status(409).json({ error: "listing_unavailable" });

    const existing = await Cart.findOne({
      buyer_id: user_id,
      listing_id,
      does_exist: true,
    });
    if (existing) return res.status(409).json({ error: "already_in_cart" });

    const cart_id = await generateId(Cart, "cart_id", "cart_id_");
    await new Cart({ cart_id, buyer_id: user_id, listing_id }).save();
    res.status(201).json({ cart_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await Cart.findOneAndUpdate(
      { cart_id: req.params.cart_id },
      { does_exist: false },
    );
    if (!result) return res.status(404).json({ error: "not_found" });
    res.json({ message: "Removed from cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const parsedQty = parseInt(req.body.quantity);
    if (!parsedQty || parsedQty < 1) {
      return res.status(400).json({ error: "invalid_quantity" });
    }

    const cartDoc = await Cart.findOne({
      cart_id: req.params.cart_id,
      does_exist: true,
    });
    if (!cartDoc) return res.status(404).json({ error: "not_found" });

    const listing = await Listing.findOne({ listings_id: cartDoc.listing_id });
    if (!listing || listing.is_deleted)
      return res.status(404).json({ error: "listing_not_found" });

    const pendingClaims = await Claim.find({
      listing_id: cartDoc.listing_id,
      status: "pending",
    });
    const pendingQty = pendingClaims.reduce(
      (s, c) => s + (c.quantity || 1),
      0,
    );
    const available = Math.max(0, (listing.quantity ?? 1) - pendingQty);

    if (parsedQty > available) {
      return res
        .status(400)
        .json({ error: "invalid_quantity", max: available });
    }

    cartDoc.quantity = parsedQty;
    await cartDoc.save();
    res.json({ success: true, quantity: cartDoc.quantity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
};

exports.claim = async (req, res) => {
  try {
    const cartDoc = await Cart.findOne({
      cart_id: req.params.cart_id,
      does_exist: true,
    });
    if (!cartDoc) return res.status(404).json({ error: "not_found" });

    const listing = await Listing.findOne({ listings_id: cartDoc.listing_id });
    if (!listing || listing.is_deleted)
      return res.status(404).json({ error: "listing_not_found" });
    if (listing.status !== "active")
      return res.status(409).json({ error: "listing_unavailable" });

    const pendingClaims = await Claim.find({
      listing_id: cartDoc.listing_id,
      status: "pending",
    });
    const pendingQty = pendingClaims.reduce(
      (s, c) => s + (c.quantity || 1),
      0,
    );
    const available = listing.quantity - pendingQty;

    const requestedQty = parseInt(req.body.quantity) || 1;
    if (requestedQty < 1 || requestedQty > available) {
      return res
        .status(400)
        .json({ error: "invalid_quantity", max: available });
    }

    const claim_id = await generateId(Claim, "claim_id", "claim_id_");
    await new Claim({
      claim_id,
      listing_id: cartDoc.listing_id,
      buyer_id: cartDoc.buyer_id,
      seller_id: listing.seller_id,
      quantity: requestedQty,
    }).save();

    await Cart.findOneAndUpdate(
      { cart_id: req.params.cart_id },
      { does_exist: false },
    );

    try {
      const [buyer, seller] = await Promise.all([
        User.findOne({ user_id: cartDoc.buyer_id }, "first_name last_name"),
        User.findOne(
          { user_id: listing.seller_id },
          "first_name last_name email contact_number",
        ),
      ]);
      const buyerName = buyer
        ? `${buyer.first_name} ${buyer.last_name}`.trim()
        : "A buyer";
      const sellerName = seller
        ? `${seller.first_name} ${seller.last_name}`.trim()
        : "the seller";

      createNotification(
        listing.seller_id,
        "claim_received",
        `${buyerName} claimed your item "${listing.product_name}"`,
        claim_id,
      ).catch(() => {});

      const contactLines = [`Contact: ${sellerName}`];
      if (seller?.contact_number) contactLines.push(`📞 ${seller.contact_number}`);
      if (seller?.email) contactLines.push(`✉️ ${seller.email}`);
      createNotification(
        cartDoc.buyer_id,
        "claim_submitted",
        `You claimed "${listing.product_name}"!<br>📍 ${listing.location || "location not set"}<br>${contactLines.join("<br>")}`,
        claim_id,
      ).catch(() => {});
    } catch (_) {}

    res.json({ claim_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
};

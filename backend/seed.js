/**
 * Demo data seeder — adds extra users, listings, claims, ratings and reports
 * covering moderation scenarios (reports, warnings, suspensions, bans).
 * Idempotent: re-running skips users/categories that already exist by
 * unique key (email / category_name), but will create fresh listings,
 * claims, ratings and reports each run.
 *
 * Usage: npm run seed
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("./db");
const generateId = require("./utils/generateId");
const createNotification = require("./utils/createNotification");

const User = require("./models/User");
const Listing = require("./models/Listing");
const Category = require("./models/Category");
const ListingCategory = require("./models/ListingCategory");
const Claim = require("./models/Claim");
const Rating = require("./models/Rating");
const Report = require("./models/Report");

const DEMO_PASSWORD = "Demo@1234";
const SEED_IMAGES = [
  "listing_seed_1_9c13ffe8e607.jpg",
  "listing_seed_2_8d1eb829832c.jpg",
  "listing_seed_3_11e8b4382fb0.jpg",
  "listing_seed_4_cb864c017a66.jpg",
  "listing_seed_5_5218c6032ffd.jpg",
  "listing_seed_6_c01365291b7c.jpg",
  "listing_seed_7_e0b586825541.jpg",
  "listing_seed_8_5f4624569ee3.jpg",
];

async function upsertUser({ email, first_name, last_name, course_code = "BSCS" }) {
  const existing = await User.findOne({ email });
  if (existing) return existing;
  const user_id = await generateId(User, "user_id", "user_id_");
  const password_hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  return User.create({
    user_id,
    email,
    password_hash,
    first_name,
    last_name,
    course_code,
    school: "Demo University",
    role: "student",
  });
}

async function ensureCategory(name) {
  let cat = await Category.findOne({ category_name: name });
  if (!cat) {
    const category_id = await generateId(Category, "category_id", "category_id_");
    cat = await Category.create({ category_id, category_name: name });
  }
  return cat;
}

let imgIndex = 0;
function nextImage() {
  const img = SEED_IMAGES[imgIndex % SEED_IMAGES.length];
  imgIndex++;
  return img;
}

async function createListing({ product_name, price, condition, seller_id, category, status, quantity = 1 }) {
  const listings_id = await generateId(Listing, "listings_id", "listing_id_");
  const listing = await Listing.create({
    listings_id,
    product_name,
    price,
    condition,
    seller_id,
    status,
    quantity,
    location: "Demo Campus",
    description: `Demo listing: ${product_name}`,
    images: [nextImage()],
  });
  const cat = await ensureCategory(category);
  await ListingCategory.create({ listing_id: listings_id, category_id: cat.category_id });
  return listing;
}

async function createClaim({ listing_id, buyer_id, seller_id, status, buyer_completed, seller_completed }) {
  const claim_id = await generateId(Claim, "claim_id", "claim_id_");
  return Claim.create({
    claim_id,
    listing_id,
    buyer_id,
    seller_id,
    status,
    buyer_completed,
    seller_completed,
  });
}

async function createRating({ listing_id, rated_user_id, rater_id, rating, review }) {
  const rating_id = await generateId(Rating, "rating_id", "rating_id_");
  return Rating.create({ rating_id, listing_id, rated_user_id, rater_id, rating, review });
}

async function createReport({ reporter_id, reported_listing_id, reported_user_id, reason, resolve }) {
  const report_id = await generateId(Report, "report_id", "report_id_");
  const report = await Report.create({
    report_id,
    reporter_id,
    reported_listing_id: reported_listing_id || null,
    reported_user_id: reported_user_id || null,
    reason,
    status: resolve ? "resolved" : "pending",
    reviewed_by: resolve ? "admin_seed" : null,
    action_taken: resolve ? resolve.label : null,
    resolved_at: resolve ? new Date() : null,
  });

  if (resolve && reported_user_id) {
    if (resolve.action === "suspend") {
      await User.findOneAndUpdate({ user_id: reported_user_id }, { is_suspended: true });
    } else if (resolve.action === "ban") {
      await User.findOneAndUpdate({ user_id: reported_user_id }, { is_banned: true });
    } else if (resolve.action === "warning") {
      await User.findOneAndUpdate({ user_id: reported_user_id }, { $inc: { warning_count: 1 } });
    }
    await createNotification(
      reported_user_id,
      resolve.action === "warning" ? "warning" : resolve.action === "suspend" ? "suspension" : "ban",
      resolve.label,
      report_id,
    ).catch(() => {});
  }

  return report;
}

async function main() {
  await connectDB();
  console.log("Connected. Seeding demo data...");

  // --- Users ---
  const mika = await upsertUser({ email: "mika.reyes@demo.edu.ph", first_name: "Mika", last_name: "Reyes" });
  const jae = await upsertUser({ email: "jae.santos@demo.edu.ph", first_name: "Jae", last_name: "Santos" });

  const carlo = await upsertUser({ email: "carlo.dizon@demo.edu.ph", first_name: "Carlo", last_name: "Dizon" });
  const trisha = await upsertUser({ email: "trisha.ong@demo.edu.ph", first_name: "Trisha", last_name: "Ong" });

  const denise = await upsertUser({ email: "denise.uy@demo.edu.ph", first_name: "Denise", last_name: "Uy" });
  const paolo = await upsertUser({ email: "paolo.cruz@demo.edu.ph", first_name: "Paolo", last_name: "Cruz" });

  const miguel = await upsertUser({ email: "miguel.torres@demo.edu.ph", first_name: "Miguel", last_name: "Torres" });
  const angela = await upsertUser({ email: "angela.reyes@demo.edu.ph", first_name: "Angela", last_name: "Reyes" });

  const bea = await upsertUser({ email: "bea.lopez@demo.edu.ph", first_name: "Bea", last_name: "Lopez" });
  const kevin = await upsertUser({ email: "kevin.tan@demo.edu.ph", first_name: "Kevin", last_name: "Tan" });

  const nico = await upsertUser({ email: "nico.alcantara@demo.edu.ph", first_name: "Nico", last_name: "Alcantara" });
  const samantha = await upsertUser({ email: "samantha.diaz@demo.edu.ph", first_name: "Samantha", last_name: "Diaz" });

  const ella = await upsertUser({ email: "ella.ramos@demo.edu.ph", first_name: "Ella", last_name: "Ramos" });
  const buyer3warn = await upsertUser({ email: "ronald.mendoza@demo.edu.ph", first_name: "Ronald", last_name: "Mendoza" });

  const victor = await upsertUser({ email: "victor.cruz@demo.edu.ph", first_name: "Victor", last_name: "Cruz" });

  const grace = await upsertUser({ email: "grace.villanueva@demo.edu.ph", first_name: "Grace", last_name: "Villanueva" });
  const ramon = await upsertUser({ email: "ramon.bautista@demo.edu.ph", first_name: "Ramon", last_name: "Bautista" });

  const julia = await upsertUser({ email: "julia.santos@demo.edu.ph", first_name: "Julia", last_name: "Santos" });
  const leo = await upsertUser({ email: "leo.garcia@demo.edu.ph", first_name: "Leo", last_name: "Garcia" });

  console.log("Users ready.");

  // --- Case 1: buyer, claimed, 5 stars ---
  const l1 = await createListing({
    product_name: "Scientific Calculator FX-991",
    price: 650,
    condition: "Good",
    seller_id: mika.user_id,
    category: "Electronics",
    status: "active",
  });
  await createClaim({
    listing_id: l1.listings_id,
    buyer_id: jae.user_id,
    seller_id: mika.user_id,
    status: "completed",
    buyer_completed: true,
    seller_completed: true,
  });
  await createRating({
    listing_id: l1.listings_id,
    rated_user_id: mika.user_id,
    rater_id: jae.user_id,
    rating: 5,
    review: "Great seller, item exactly as described!",
  });

  // --- Case 2: buyer, claimed, scam, report, suspend ---
  const l2 = await createListing({
    product_name: "iPhone 12 (Like New)",
    price: 15000,
    condition: "Used",
    seller_id: carlo.user_id,
    category: "Electronics",
    status: "active",
  });
  await createClaim({
    listing_id: l2.listings_id,
    buyer_id: trisha.user_id,
    seller_id: carlo.user_id,
    status: "completed",
    buyer_completed: true,
    seller_completed: true,
  });
  await createReport({
    reporter_id: trisha.user_id,
    reported_listing_id: l2.listings_id,
    reported_user_id: carlo.user_id,
    reason: "Item never matched the photos, seller scammed me",
    resolve: { action: "suspend", label: "User suspended: confirmed scam listing" },
  });

  // --- Case 3: buyer, claimed, scam, report, ban ---
  const l3 = await createListing({
    product_name: "MacBook Air M1 (Sealed)",
    price: 38000,
    condition: "New",
    seller_id: denise.user_id,
    category: "Electronics",
    status: "active",
  });
  await createClaim({
    listing_id: l3.listings_id,
    buyer_id: paolo.user_id,
    seller_id: denise.user_id,
    status: "completed",
    buyer_completed: true,
    seller_completed: true,
  });
  await createReport({
    reporter_id: paolo.user_id,
    reported_listing_id: l3.listings_id,
    reported_user_id: denise.user_id,
    reason: "Paid but received an empty box, obvious scam",
    resolve: { action: "ban", label: "User banned: severe scam, repeat risk" },
  });

  // --- Case 4: buyer, claimed, 1-star bad review (not a scam) ---
  const l4 = await createListing({
    product_name: "Study Desk Lamp",
    price: 350,
    condition: "Used",
    seller_id: miguel.user_id,
    category: "Furniture",
    status: "active",
  });
  await createClaim({
    listing_id: l4.listings_id,
    buyer_id: angela.user_id,
    seller_id: miguel.user_id,
    status: "completed",
    buyer_completed: true,
    seller_completed: true,
  });
  await createRating({
    listing_id: l4.listings_id,
    rated_user_id: miguel.user_id,
    rater_id: angela.user_id,
    rating: 1,
    review: "Item was much more worn than described, disappointing.",
  });

  // --- Case 5: buyer, claimed, report still pending (admin queue demo) ---
  const l5 = await createListing({
    product_name: "Organic Chemistry Textbook",
    price: 900,
    condition: "Good",
    seller_id: bea.user_id,
    category: "Books",
    status: "active",
  });
  await createClaim({
    listing_id: l5.listings_id,
    buyer_id: kevin.user_id,
    seller_id: bea.user_id,
    status: "completed",
    buyer_completed: true,
    seller_completed: true,
  });
  await createReport({
    reporter_id: kevin.user_id,
    reported_listing_id: l5.listings_id,
    reported_user_id: bea.user_id,
    reason: "Seller asked me to pay outside the app, seems suspicious",
  });

  // --- Case 6: report resolved via warning (not suspend/ban) ---
  const l6 = await createListing({
    product_name: "Wireless Mouse",
    price: 250,
    condition: "New",
    seller_id: nico.user_id,
    category: "Electronics",
    status: "active",
  });
  await createClaim({
    listing_id: l6.listings_id,
    buyer_id: samantha.user_id,
    seller_id: nico.user_id,
    status: "completed",
    buyer_completed: true,
    seller_completed: true,
  });
  await createReport({
    reporter_id: samantha.user_id,
    reported_user_id: nico.user_id,
    reason: "Rude and unprofessional communication during handoff",
    resolve: { action: "warning", label: "Warning issued: unprofessional conduct" },
  });

  // --- Case 7: user auto-suspended after reaching 3 warnings ---
  await User.findOneAndUpdate(
    { user_id: ella.user_id },
    { warning_count: 0, is_suspended: false },
  );
  for (const reason of [
    "Late handoff without notice",
    "Misleading item condition",
    "Ignored buyer messages for days",
  ]) {
    await createReport({
      reporter_id: buyer3warn.user_id,
      reported_user_id: ella.user_id,
      reason,
      resolve: { action: "warning", label: `Warning issued: ${reason}` },
    });
  }
  await User.findOneAndUpdate({ user_id: ella.user_id }, { is_suspended: true });
  await createNotification(
    ella.user_id,
    "suspension",
    "Your account has been automatically suspended after receiving 3 warnings.",
    null,
  ).catch(() => {});

  // --- Case 8: direct admin ban, no report on file ---
  await User.findOneAndUpdate({ user_id: victor.user_id }, { is_banned: true });
  await createListing({
    product_name: "Gaming Chair (Damaged Listing)",
    price: 4000,
    condition: "Used",
    seller_id: victor.user_id,
    category: "Furniture",
    status: "rejected",
  });
  await createListing({
    product_name: "Bootleg Charger Bundle",
    price: 500,
    condition: "New",
    seller_id: victor.user_id,
    category: "Electronics",
    status: "pending_review",
  });

  // --- Case 9: cancelled claim ---
  const l9 = await createListing({
    product_name: "Acoustic Guitar",
    price: 2500,
    condition: "Good",
    seller_id: grace.user_id,
    category: "Others",
    status: "active",
  });
  await createClaim({
    listing_id: l9.listings_id,
    buyer_id: ramon.user_id,
    seller_id: grace.user_id,
    status: "cancelled",
    buyer_completed: false,
    seller_completed: false,
  });

  // --- Case 10: clean control, active + pending listings, no issues ---
  await createListing({
    product_name: "Drafting Kit",
    price: 700,
    condition: "New",
    seller_id: julia.user_id,
    category: "Others",
    status: "active",
  });
  await createListing({
    product_name: "Mini Fridge",
    price: 3200,
    condition: "Good",
    seller_id: leo.user_id,
    category: "Furniture",
    status: "pending_review",
  });

  console.log("\nSeed complete.\n");
  console.log("Demo login password for all seeded users:", DEMO_PASSWORD);
  console.log("\nScenario summary:");
  console.log("1. 5-star:            jae.santos@demo.edu.ph bought from mika.reyes@demo.edu.ph");
  console.log("2. Scam -> suspend:   trisha.ong@demo.edu.ph reported carlo.dizon@demo.edu.ph (now suspended)");
  console.log("3. Scam -> ban:       paolo.cruz@demo.edu.ph reported denise.uy@demo.edu.ph (now banned)");
  console.log("4. Bad rating (1*):   angela.reyes@demo.edu.ph rated miguel.torres@demo.edu.ph");
  console.log("5. Pending report:    kevin.tan@demo.edu.ph reported bea.lopez@demo.edu.ph (unresolved)");
  console.log("6. Report -> warning: samantha.diaz@demo.edu.ph reported nico.alcantara@demo.edu.ph");
  console.log("7. Auto-suspend @3:   ella.ramos@demo.edu.ph (3 warnings, auto-suspended)");
  console.log("8. Direct ban:        victor.cruz@demo.edu.ph (banned, has rejected/pending listings)");
  console.log("9. Cancelled claim:   ramon.bautista@demo.edu.ph / grace.villanueva@demo.edu.ph");
  console.log("10. Clean control:    julia.santos@demo.edu.ph / leo.garcia@demo.edu.ph (no issues)");

  await mongoose.disconnect();
  console.log("\nDisconnected.");
}

main().catch(async (err) => {
  console.error("Seed failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});

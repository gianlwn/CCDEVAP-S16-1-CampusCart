/**
 * Simple unit tests for backend/controllers/listingsController.js
 *
 * All database models and file/notification utilities are mocked, so no
 * real database or filesystem is needed to run these. Each of the 6
 * exported controller functions gets: one success case, one
 * validation/permission error case, and one "database threw" case.
 *
 * Run with: npm test
 */

jest.mock("../backend/models/Listing");
jest.mock("../backend/models/User");
jest.mock("../backend/models/ListingCategory");
jest.mock("../backend/models/Category");
jest.mock("../backend/models/Claim");
jest.mock("../backend/models/Cart");
jest.mock("../backend/utils/generateId");
jest.mock("../backend/utils/imageStorage");
jest.mock("../backend/utils/createNotification");

const Listing = require("../backend/models/Listing");
const User = require("../backend/models/User");
const ListingCategory = require("../backend/models/ListingCategory");
const Category = require("../backend/models/Category");
const Claim = require("../backend/models/Claim");
const Cart = require("../backend/models/Cart");
const generateId = require("../backend/utils/generateId");
const { saveListingImage, saveListingImages, deleteListingImages } = require("../backend/utils/imageStorage");
const createNotification = require("../backend/utils/createNotification");

const listingsController = require("../backend/controllers/listingsController");

// Fake Express req/res objects, since we're calling the controller directly.
function mockReq(overrides = {}) {
  return { user: { user_id: "user_1", role: "student" }, params: {}, query: {}, body: {}, ...overrides };
}
function mockRes() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn() };
}

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});

  // Default "nothing extra happens" behavior for every model/util used by
  // the enrichment step. Individual tests override what they care about.
  User.find.mockResolvedValue([]);
  User.findOne.mockResolvedValue(null);
  ListingCategory.find.mockResolvedValue([]);
  ListingCategory.deleteMany.mockResolvedValue({});
  ListingCategory.insertMany.mockResolvedValue([]);
  Category.find.mockResolvedValue([]);
  Claim.find.mockResolvedValue([]);
  Cart.updateMany.mockResolvedValue({});
  createNotification.mockResolvedValue(undefined);
  generateId.mockResolvedValue("listing_id_1");
  saveListingImages.mockReturnValue([]);
  saveListingImage.mockReturnValue("/uploads/listings/new.jpg");
  deleteListingImages.mockReturnValue(undefined);
});

afterEach(() => {
  console.error.mockRestore();
});

describe("list", () => {
  test("returns active listings for a normal shopper, enriched with seller/category/availability", async () => {
    const listings = [{ listings_id: "l1", seller_id: "s1", quantity: 5, status: "active" }];
    Listing.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(listings) });
    // Called twice: once to check for banned/suspended sellers, once to build the seller info shown to shoppers.
    User.find
      .mockResolvedValueOnce([{ user_id: "s1", is_banned: false, is_suspended: false }])
      .mockResolvedValueOnce([{ user_id: "s1", first_name: "Jane", last_name: "Doe", profile_picture: "jane.jpg" }]);
    ListingCategory.find.mockResolvedValue([{ listing_id: "l1", category_id: "c1" }]);
    Category.find.mockResolvedValue([{ category_id: "c1", category_name: "Books" }]);
    Claim.find.mockResolvedValue([{ listing_id: "l1", status: "pending", quantity: 2 }]);

    const res = mockRes();
    await listingsController.list(mockReq(), res);

    expect(Listing.find).toHaveBeenCalledWith({ status: "active", is_deleted: { $ne: true } });
    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({ id: "l1", seller: "Jane Doe", category: "Books", available: 3 }),
    ]);
  });

  test("blocks a non-admin from requesting another status", async () => {
    const req = mockReq({ query: { status: "pending_review" } });
    const res = mockRes();

    await listingsController.list(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "forbidden" });
  });

  test("returns a 500 if the database throws", async () => {
    Listing.find.mockImplementation(() => {
      throw new Error("db down");
    });
    const res = mockRes();

    await listingsController.list(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("getOne", () => {
  test("returns the listing when it exists", async () => {
    Listing.findOne.mockResolvedValue({ listings_id: "l1", seller_id: "user_1", quantity: 1, is_deleted: false });

    const req = mockReq({ params: { id: "l1" } });
    const res = mockRes();
    await listingsController.getOne(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: "l1" }));
  });

  test("returns 404 when the listing doesn't exist", async () => {
    Listing.findOne.mockResolvedValue(null);

    const req = mockReq({ params: { id: "missing" } });
    const res = mockRes();
    await listingsController.getOne(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "not_found" });
  });

  test("returns a 500 if the database throws", async () => {
    Listing.findOne.mockRejectedValue(new Error("db down"));

    const req = mockReq({ params: { id: "l1" } });
    const res = mockRes();
    await listingsController.getOne(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("create", () => {
  const validBody = { product_name: "Textbook", price: "150", condition: "Good" };

  test("creates a listing, links its categories, and saves its images", async () => {
    saveListingImages.mockReturnValue(["/uploads/listings/img1.jpg"]);
    Listing.create.mockResolvedValue({
      listings_id: "listing_id_1",
      product_name: "Textbook",
      price: 150,
      seller_id: "user_1",
      images: ["/uploads/listings/img1.jpg"],
    });
    Category.find.mockResolvedValue([{ category_id: "c1", category_name: "Books" }]);
    ListingCategory.find.mockResolvedValue([{ listing_id: "listing_id_1", category_id: "c1" }]);

    const req = mockReq({
      body: { ...validBody, categories: ["Books"], images: ["data:image/png;base64,AAAA"] },
    });
    const res = mockRes();
    await listingsController.create(req, res);

    expect(Listing.create).toHaveBeenCalledWith(expect.objectContaining({ product_name: "Textbook", price: 150 }));
    expect(ListingCategory.insertMany).toHaveBeenCalledWith([{ listing_id: "listing_id_1", category_id: "c1" }]);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ category: "Books" }));
  });

  test("rejects a request missing required fields", async () => {
    const req = mockReq({ body: { price: "10" } }); // no product_name, no condition
    const res = mockRes();
    await listingsController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "missing_fields" });
    expect(Listing.create).not.toHaveBeenCalled();
  });

  test("returns a 500 if the database throws", async () => {
    Listing.create.mockRejectedValue(new Error("db down"));

    const req = mockReq({ body: validBody });
    const res = mockRes();
    await listingsController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("update", () => {
  const existing = {
    listings_id: "l1",
    seller_id: "user_1",
    status: "active",
    is_deleted: false,
    images: ["/uploads/listings/old.jpg"],
  };

  test("updates a listing the requester owns, including its price, images, and categories", async () => {
    Listing.findOne.mockResolvedValue(existing);
    Listing.findOneAndUpdate.mockResolvedValue({
      ...existing,
      product_name: "New Name",
      price: 200,
      condition: "New",
    });
    Category.find.mockResolvedValue([{ category_id: "c2", category_name: "Electronics" }]);

    const req = mockReq({
      params: { id: "l1" },
      body: {
        product_name: "New Name",
        price: "200",
        condition: "New",
        images: ["data:image/png;base64,BBBB"],
        categories: ["Electronics"],
      },
    });
    const res = mockRes();
    await listingsController.update(req, res);

    expect(saveListingImage).toHaveBeenCalledWith("data:image/png;base64,BBBB", "l1");
    expect(deleteListingImages).toHaveBeenCalledWith(["/uploads/listings/old.jpg"]);
    expect(ListingCategory.insertMany).toHaveBeenCalledWith([{ listing_id: "l1", category_id: "c2" }]);
    expect(Listing.findOneAndUpdate).toHaveBeenCalledWith(
      { listings_id: "l1" },
      expect.objectContaining({ product_name: "New Name", price: 200, condition: "New", status: "pending_review" }),
      { new: true },
    );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: "New Name" }));
  });

  test("forbids editing someone else's listing", async () => {
    Listing.findOne.mockResolvedValue({ ...existing, seller_id: "someone_else" });

    const req = mockReq({ params: { id: "l1" }, body: { product_name: "New Name" } });
    const res = mockRes();
    await listingsController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(Listing.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test("returns a 500 if the database throws", async () => {
    Listing.findOne.mockRejectedValue(new Error("db down"));

    const req = mockReq({ params: { id: "l1" }, body: { product_name: "New Name" } });
    const res = mockRes();
    await listingsController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("updateStatus", () => {
  test("approves a listing and notifies the seller", async () => {
    const listing = { listings_id: "l1", seller_id: "seller_1", product_name: "Chair" };
    Listing.findOneAndUpdate.mockResolvedValue(listing);

    const req = mockReq({ params: { id: "l1" }, body: { status: "active" } });
    const res = mockRes();
    await listingsController.updateStatus(req, res);

    expect(createNotification).toHaveBeenCalledWith("seller_1", "listing_approved", expect.any(String), "l1");
    expect(res.json).toHaveBeenCalledWith({ success: true, listing });
  });

  test("rejects an invalid status value", async () => {
    const req = mockReq({ params: { id: "l1" }, body: { status: "not_a_real_status" } });
    const res = mockRes();
    await listingsController.updateStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(Listing.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test("returns a 500 if the database throws", async () => {
    Listing.findOneAndUpdate.mockRejectedValue(new Error("db down"));

    const req = mockReq({ params: { id: "l1" }, body: { status: "active" } });
    const res = mockRes();
    await listingsController.updateStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("remove", () => {
  const existing = { listings_id: "l1", seller_id: "user_1", is_deleted: false };

  test("soft-deletes a listing the requester owns", async () => {
    Listing.findOne.mockResolvedValue(existing);
    Listing.findOneAndUpdate.mockResolvedValue({ ...existing, is_deleted: true });

    const req = mockReq({ params: { id: "l1" } });
    const res = mockRes();
    await listingsController.remove(req, res);

    expect(Listing.findOneAndUpdate).toHaveBeenCalledWith({ listings_id: "l1" }, { is_deleted: true }, { new: true });
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  test("forbids deleting someone else's listing", async () => {
    Listing.findOne.mockResolvedValue({ ...existing, seller_id: "someone_else" });

    const req = mockReq({ params: { id: "l1" } });
    const res = mockRes();
    await listingsController.remove(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(Listing.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test("returns a 500 if the database throws", async () => {
    Listing.findOne.mockRejectedValue(new Error("db down"));

    const req = mockReq({ params: { id: "l1" } });
    const res = mockRes();
    await listingsController.remove(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

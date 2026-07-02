const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ is_removed: false }).sort({
      category_name: 1,
    });
    res.json(
      categories.map((c) => ({
        category_id: c.category_id,
        category_name: c.category_name,
      })),
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;

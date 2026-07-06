const Category = require("../models/Category");
const generateId = require("../utils/generateId");

exports.list = async (req, res) => {
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
};

exports.create = async (req, res) => {
  try {
    const category_name = (req.body.category_name || "").trim();
    if (!category_name)
      return res.status(400).json({ error: "missing_name" });

    const existing = await Category.findOne({
      category_name: new RegExp(`^${category_name}$`, "i"),
      is_removed: false,
    });
    if (existing) return res.status(409).json({ error: "duplicate_name" });

    const category_id = await generateId(Category, "category_id", "cat_id_");
    const category = await Category.create({ category_id, category_name });
    res.status(201).json({
      category_id: category.category_id,
      category_name: category.category_name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
};

exports.update = async (req, res) => {
  try {
    const category_name = (req.body.category_name || "").trim();
    if (!category_name)
      return res.status(400).json({ error: "missing_name" });

    const existing = await Category.findOne({
      category_name: new RegExp(`^${category_name}$`, "i"),
      is_removed: false,
      category_id: { $ne: req.params.category_id },
    });
    if (existing) return res.status(409).json({ error: "duplicate_name" });

    const updated = await Category.findOneAndUpdate(
      { category_id: req.params.category_id },
      { category_name },
      { new: true },
    );
    if (!updated) return res.status(404).json({ error: "not_found" });
    res.json({
      category_id: updated.category_id,
      category_name: updated.category_name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const updated = await Category.findOneAndUpdate(
      { category_id: req.params.category_id },
      { is_removed: true },
      { new: true },
    );
    if (!updated) return res.status(404).json({ error: "not_found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
};

const Website = require("../models/Website");


// ADD WEBSITE
exports.addWebsite = async (req, res) => {

  try {

    const { name, url, category, icon } = req.body;

    const website = new Website({
      name,
      url,
      category,
      icon,
      userId: req.user.id
    });

    await website.save();

    res.json(website);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};


// GET ALL WEBSITES
exports.getWebsites = async (req, res) => {

  try {

    const websites = await Website.find({ userId: req.user.id });

    res.json(websites);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};


// UPDATE WEBSITE
exports.updateWebsite = async (req, res) => {

  try {

    const website = await Website.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" }
    );

    res.json(website);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};


// DELETE WEBSITE
exports.deleteWebsite = async (req, res) => {

  try {

    await Website.findByIdAndDelete(req.params.id);

    res.json({ message: "Website deleted" });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};


// DELETE ALL WEBSITES IN A CATEGORY
exports.deleteCategoryWebsites = async (req, res) => {

  try {

    const categoryName = decodeURIComponent(req.params.categoryName || "");

    if (!categoryName) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const query =
      categoryName === "General"
        ? {
            userId: req.user.id,
            $or: [
              { category: "General" },
              { category: { $exists: false } },
              { category: null },
              { category: "" }
            ]
          }
        : {
            userId: req.user.id,
            category: categoryName
          };

    const result = await Website.deleteMany(query);

    res.json({
      message: "Category websites deleted",
      deletedCount: result.deletedCount
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};
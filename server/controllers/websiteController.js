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
      { new: true }
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
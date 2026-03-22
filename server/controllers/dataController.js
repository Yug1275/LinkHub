const Website = require("../models/Website");
const Settings = require("../models/Settings");
const Note = require("../models/Note");

exports.exportData = async (req, res) => {
  try {
    const userId = req.user.id;

    const websites = await Website.find({ userId });
    const settings = await Settings.findOne({ userId });
    const notes = await Note.find({ userId });

    res.json({
      version: "1.0",
      exportedAt: new Date().toISOString(),
      websites: websites.map(w => ({
        name: w.name,
        url: w.url,
        icon: w.icon,
        category: w.category,
        position: w.position,
      })),
      settings: settings ? {
        theme: settings.theme,
        backgroundType: settings.backgroundType,
        backgroundValue: settings.backgroundValue,
        blur: settings.blur,
        opacity: settings.opacity,
        iconStyle: settings.iconStyle,
        enabledWidgets: settings.enabledWidgets,
        focusCategories: settings.focusCategories,
      } : null,
      notes: notes.map(n => ({
        title: n.title,
        content: n.content,
        color: n.color,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.importData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { websites, settings, notes } = req.body;

    // Import websites
    if (websites && Array.isArray(websites)) {
      await Website.deleteMany({ userId });
      const websiteDocs = websites.map((w, i) => ({
        ...w,
        userId,
        position: w.position ?? i,
      }));
      await Website.insertMany(websiteDocs);
    }

    // Import settings
    if (settings) {
      await Settings.findOneAndUpdate(
        { userId },
        { ...settings, userId },
          { upsert: true, returnDocument: "after" }
      );
    }

    // Import notes
    if (notes && Array.isArray(notes)) {
      await Note.deleteMany({ userId });
      const noteDocs = notes.map(n => ({ ...n, userId }));
      await Note.insertMany(noteDocs);
    }

    res.json({ message: "Dashboard imported successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

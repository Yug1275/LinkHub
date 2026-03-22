const Settings = require("../models/Settings");

exports.getSettings = async (req, res) => {

  let settings = await Settings.findOne({
    userId: req.user.id
  });

  if (!settings) {
    settings = await Settings.create({
      userId: req.user.id
    });
  }

  res.json(settings);
};

exports.updateSettings = async (req, res) => {

  const settings = await Settings.findOneAndUpdate(
    { userId: req.user.id },
    req.body,
    { returnDocument: "after", upsert: true }
  );

  res.json(settings);
};
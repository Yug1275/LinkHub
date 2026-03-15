const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  theme: {
    type: String,
    default: "light"
  },

  backgroundType: {
    type: String,
    enum: ["solid", "gradient", "image"],
    default: "gradient"
  },

  backgroundValue: {
    type: String,
    default: ""
  },

  blur: {
    type: Number,
    default: 0
  },

  opacity: {
    type: Number,
    default: 100
  },

  iconStyle: {
    type: String,
    enum: ["square", "rounded", "circle", "glass"],
    default: "rounded"
  },

  focusCategories: {
    type: [String],
    default: []
  },

  enabledWidgets: {
    type: [String],
    default: ["clock"]
  }

});

module.exports = mongoose.model("Settings", SettingsSchema);
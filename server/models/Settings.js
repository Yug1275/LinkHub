const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  theme: {
    type: String,
    default: "light"
  },

  background: String

});

module.exports = mongoose.model("Settings", settingsSchema);
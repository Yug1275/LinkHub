const mongoose = require("mongoose");

const websiteSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  name: String,

  url: String,

  icon: String,

  category: String,

  position: Number

});

module.exports = mongoose.model("Website", websiteSchema);
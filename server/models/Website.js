const mongoose = require("mongoose");

const websiteSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: {
    type: String,
    required: true
  },

  url: {
    type: String,
    required: true
  },

  icon: {
    type: String,
    default: ""
  },

  category: {
    type: String,
    default: "General"
  },

  position: {
    type: Number,
    default: 0
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("Website", websiteSchema);
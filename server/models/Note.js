const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      default: "",
    },

    content: {
      type: String,
      default: "",
    },

    color: {
      type: String,
      default: "#fef08a", // yellow
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);

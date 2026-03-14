const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  name: String

});

module.exports = mongoose.model("Category", categorySchema);
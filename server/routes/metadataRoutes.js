const express = require("express");

const router = express.Router();

const { getMetadata } = require("../controllers/metadataController");

router.post("/", getMetadata);

module.exports = router;
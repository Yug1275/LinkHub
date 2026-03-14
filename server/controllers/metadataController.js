const axios = require("axios");
const cheerio = require("cheerio");

exports.getMetadata = async (req, res) => {

    try {

        const { url } = req.body;

        const response = await axios.get(url);

        const $ = cheerio.load(response.data);

        let title = $("title").text();

        // Clean long titles
        if (title.includes("·")) {
            title = title.split("·")[0];
        }

        if (title.includes("|")) {
            title = title.split("|")[0];
        }

        if (title.includes("-")) {
            title = title.split("-")[0];
        }

        title = title.trim();

        const domain = new URL(url).hostname.replace("www.", "");

        const favicon =
            $('link[rel="icon"]').attr("href") ||
            `https://www.google.com/s2/favicons?domain=${domain}`;

        res.json({
            title,
            favicon
        });

    } catch (error) {

        res.status(500).json({ error: "Metadata fetch failed" });

    }

};
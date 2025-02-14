const path = require('path')

module.exports = {
    // goddamn it why so complicated
    mode: "development",
    entry: {
        "content_scripts/main.js": "./src/content_scripts/main.js",
        "background/card_maker.js": "./src/background/card_maker.js",
        "popup/popup.html": "./src/popup/popup.html"
    },

    output: {
        filename: "[name]",
        path: path.resolve(__dirname, "built"),

        // Tell webpack to only show newly generated files
        clean: true
    }
}

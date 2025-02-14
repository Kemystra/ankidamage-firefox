const { default: FileManagerPlugin } = require('filemanager-webpack-plugin')
const path = require('path')

// Copy the file, without alteration
// Planning to do so later, for now it's unnecessary complexity
const FILE_MANAGER_OPTIONS = {
    events: {
        onEnd: {
            copy: [
                { source: "./src/popup/index.html", destination: "./built/popup/index.html" },
                { source: "./src/popup/style.css", destination: "./built/popup/style.css" }
            ]
        }
    }
}

module.exports = {
    // goddamn it why so complicated
    mode: "development",
    entry: {
        "content_scripts/main.js": "./src/content_scripts/main.js",
        "background/card_maker.js": "./src/background/card_maker.js",
        "popup/main.js": "./src/popup/main.js"
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
        ]
    },

    output: {
        filename: "[name]",
        path: path.resolve(__dirname, "built"),

        // Tell webpack to only show newly generated files
        clean: true
    },

    plugins: [new FileManagerPlugin(FILE_MANAGER_OPTIONS)]
}

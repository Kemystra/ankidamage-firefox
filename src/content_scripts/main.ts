import $ from 'jquery';
import { Kanji, KunyomiData } from '../kanji_obj_types';

// Adding the hasRun property to the Window object
// using declaration merging
declare global {
    interface Window {
        _hasRun?: boolean;
    }
}

(() => {
    // Each time the user opens a popup, this script will be injected into the page
    // If it's opened multiple times, then there will be multiple instances of this script
    // The rest of them will be stopped since window.hasRun has been set to true by the first instance
    if (window._hasRun) {
        return;
    }

    window._hasRun = true;
    browser.runtime.onMessage.addListener(message => {
        if (message.command === "scrapeSite") {
            let message = scrapeKanjiInfo();
            browser.runtime.sendMessage(message);
        }
    })
})();


// Best string manipulation project 2022
function scrapeKanjiInfo() {
    // Setting up default values here
    // A bit dirty but it's the only place where I have to do this
    let kanji: Kanji = {
        character: { elem_type: "IMG", src: "" },
        name: "", radicals: "", mnemonics: "",
        kunyomiData: { "": "" }, onyomi: "", onyomiMnemonics: ""
    };

    // There's always only one content in the span: either text or <img>
    let kanji_span_content = $(".kanji_character").eq(0).contents().eq(0);

    // From https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
    const ELEMENT_NODE = 1;
    if (kanji_span_content.prop("nodeType") === ELEMENT_NODE) {
        kanji.character = {
            elem_type: "IMG",
            src: "https://www.kanjidamage.com" + kanji_span_content.attr("src")
        };
    }
    else {
        kanji.character = { elem_type: "TEXT", value: kanji_span_content.text() };
    }

    console.log(kanji.character);

    kanji.name = $(".translation").eq(0).text();
    kanji.radicals = $(".col-md-8").eq(1).text()
        .replace(/\s/g, " ")
        .replace(kanji.character, "")
        .replace(kanji.name, "")
        .replace(" +", " + ")
        .trim();

    let kunyomiTable, onyomiTable;

    // Search through the main table, and look for the necessary sections
    let defTables = $(".col-md-12").eq(0).children();
    for (let i = 0; i < defTables.length; i++) {
        if (defTables.eq(i).prop("nodeName") !== "H2") {
            continue;
        }

        switch (defTables.eq(i).text()) {
            case "Onyomi":
                onyomiTable = defTables.eq(i + 1).find("td");
                break;

            case "Kunyomi":
                kunyomiTable = defTables.eq(i + 1).find("td");
                break;

            case "Mnemonic":
                kanji.mnemonics = defTables.eq(i + 1).text().trim();
                break;

            default:
                continue;
        }
    }

    if (onyomiTable) {
        kanji.onyomi = onyomiTable.eq(0).text().trim();
        kanji.onyomiMnemonics = onyomiTable.eq(1).text().trim();
    }

    kanji.kunyomiData = {};
    let kunyomis: Array<string> = [];
    let kunyomiUsages: Array<string> = [];

    if (kunyomiTable) {
        // RegEx FTW!!1!
        // Technically, you MAY be able to use a normal for loop
        // and avoid the use of if-else inside
        // but damn, the code works for 3 years
        // ain't touching that
        kunyomiTable.each((index, element) => {
            let kunyomiElem = $(element).text();
            if (index % 2) {
                kunyomiUsages.push(kunyomiElem
                    .replace(/[★☆]/g, "")
                    .replace(/[\n\r]+/g, "")
                    .trim()
                );
            }
            else {
                kunyomis.push(kunyomiElem
                    .replace(/[\n\r]+/g, "")
                    .replace(")", ") ")
                    .trim()
                );
            }
        });
    }

    kunyomis.forEach((val, i) => {
        kanji.kunyomiData[val] = kunyomiUsages[i];
    });

    return kanji;
}

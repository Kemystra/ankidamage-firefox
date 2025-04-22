import $ from 'jquery';
import { Kanji, CharacterData, Tag, Kunyomi } from '../kanji_obj_types';

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
        switch (message.command) {
            case "scrapeSite":
                let respond = scrapeKanjiInfo();
                browser.runtime.sendMessage(respond);
                break;

            case "backgroundScriptError":
                alert(message.error);
                break;

            default:
                console.log(`Message received: ${message.command}`)
        }
    })
})();


// Best string manipulation project 2022
function scrapeKanjiInfo() {
    // Setting up default values here
    // A bit dirty but it's the only place where I have to do this
    let kanji: Kanji = {
        character: { elem_type: "IMG", src: "" },
        name: "", tags: [], radicals: [], mnemonics: "",
        kunyomis: [], onyomi: "", onyomiMnemonics: ""
    };

    // There's always only one content in the span: either text or <img>
    let kanji_span_content = $(".kanji_character").eq(0).contents().eq(0);
    kanji.character = parseRawCharacters(kanji_span_content);

    kanji.name = $(".translation").eq(0).text();

    let kanjiTagRawContent = $(".col-md-4.text-righted").eq(0).contents().eq(5).contents();
    kanji.tags = loopThroughAllTags(kanjiTagRawContent, 0)[0];

    let characterAndRadicalsElements = $(".col-md-8").eq(1).contents();
    // The first three elements are not part of the radicals
    let i = 3;
    while (i < characterAndRadicalsElements.length) {
        let radicalCharacter = parseRawCharacters(
            characterAndRadicalsElements.eq(i).contents().eq(0)
        );
        let radicalName = characterAndRadicalsElements
            .eq(++i)
            .text()
            .replace(/\(|\)/g, "")
            .trim();

        let radicalTags: Array<Tag> = [];
        let newIndex = 0;
        if (isElementTag(characterAndRadicalsElements.eq(++i))) {
            [radicalTags, newIndex] = loopThroughAllTags(characterAndRadicalsElements, i);
            i = newIndex;
        }

        kanji.radicals.push({
            character: radicalCharacter,
            name: radicalName,
            tags: radicalTags
        });

        // Skip the text node of the plus sign (" + ")
        i++;
    }

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


    kunyomiTable = $(".definition").eq(2).find("tbody").eq(0);
    kanji.kunyomis = kunyomiTable ? parseKunyomiData(kunyomiTable) : [];

    return kanji;
}

function parseKunyomiData(kunyomiTableBody: JQuery<Node>): Array<Kunyomi> {
    let result: Array<Kunyomi> = [];
    let kunyomiTableBodyChildren = kunyomiTableBody.children();

    // Inside the <tbody>
    // We have multiple <tr> tags corresponding to each kunyomis
    for (let i = 0; i < kunyomiTableBodyChildren.length; i++) {

        // The <tr> tag
        const kunyomiElement = kunyomiTableBodyChildren.eq(i);
        console.log(kunyomiElement)

        // Inside each <tr> tag, we got 2 <td> tags
        // First <td> tag have the hiragana reading and the particles
        // Second <td> tag have the rest of the information

        let kunyomiReading = $(kunyomiElement)
        .find("td").eq(0).text()
        .replace(")", ") ")
        .replace(/[\r\n]+/, "")
        .trim();

        let kunyomiAdditionalData = $(kunyomiElement).find("td").eq(1)

        let kunyomiMeaning = kunyomiAdditionalData
        .contents().eq(0).text()
        .replace(/[\r\n]+/, "")
        .trim();

        // Search from first element in the content
        let [tags, _] = loopThroughAllTags(kunyomiAdditionalData.contents(), 0)

        result.push({
            reading: kunyomiReading,
            meaning: kunyomiMeaning,
            tags: tags
        })
    }

    return result;
}

// -- Tags parsing section --
function loopThroughAllTags(rawContents: JQuery<Node>, startIndex: number): [Array<Tag>, number] {
    let i = startIndex;
    let tags: Array<Tag> = [];

    let isFirstTagFound = false;

    // Search for the first tag
    for (; i < rawContents.length; i++) {
        if (isElementTag(rawContents.eq(i))) {
            isFirstTagFound = true;
        }
    }

    // If the index goes out of bounds, no tags are found
    if (isFirstTagFound)
        return [[], i];

    // Add tags until no more is found
    while (isElementTag(rawContents.eq(i))) {
        tags.push(
            parseTag(rawContents.eq(i) as JQuery<HTMLAnchorElement>)
        );
        i++;
    }

    return [tags, i];
}

function isElementTag(element: JQuery<Node>): boolean {
    return element.hasClass("label") && element.hasClass("label-info");
}

function parseTag(tagElement: JQuery<HTMLAnchorElement>): Tag {
    return {
        name: tagElement.text(),
    }
}
// -- End of tags parsing section --

// Parse the character nodes and return the appropriate Character object
function parseRawCharacters(characterNode: JQuery<Node>): CharacterData {
    // From https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
    if (characterNode.prop("nodeType") === Node.ELEMENT_NODE) {
        return {
            elem_type: "IMG",
            src: "https://www.kanjidamage.com" + characterNode.attr("src")
        };
    }
    else {
        return { elem_type: "TEXT", value: characterNode.text() };
    }
}

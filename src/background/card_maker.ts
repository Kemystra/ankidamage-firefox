import { Kanji, Kunyomis, CharacterData, Radical, Tag } from "../kanji_obj_types";
import { AnkiConnectCaller } from "./anki_connect";

const WRONG_CHARACTER_DATA = "INVALID_DATA";
const KANJIDAMAGE_DOMAIN = "https://www.kanjidamage.com";

const ankiConnectClient = new AnkiConnectCaller();

browser.runtime.onMessage.addListener(message => {
    sendToAnki(message).then().catch(debug);
});

// Anki cards only accept plain text or HTML inside each of its fields.
// The styling of the card in Anki determines the way these fields are shown.
// Here we interpret the raw data that we got after scraping
// into plain text or HTML.

async function sendToAnki(data: Kanji) {
    let cardData = {
        note: {
            deckName: "KANJIDAMAGE",
            modelName: "KanjiDamage",
            fields: {
                kanji: await interpretCharacterData(data.character),
                kanji_name: data.name,
                radicals: await interpretRadicalsData(data.radicals),
                mnemonics: data.mnemonics,
                onyomi: data.onyomi,
                onyomi_mnemonics: data.onyomiMnemonics,
                kunyomis: kunyomiListMaker(data.kunyomiData),
            },
            tags: [],
        }
    };

    ankiConnectClient
        .guiAddCards(cardData)
        .catch(debug);
}

async function interpretRadicalsData(radicals: Array<Radical>) : Promise<string> {
    let characterNamePair: Array<string> = [];
    for (const radical of radicals) {
        let characterAsString = await interpretCharacterData(radical.character);

        // Convert it to "[char] ([name])"
        characterNamePair.push(`${characterAsString} (${radical.name}) ${interpretTags(radical.tags)}`)
    }

    return characterNamePair.join(" + ")
}

// The character might not exist in the Unicode specification,
// so the website shows it using images.
// We input it into Anki as <img> tags
async function interpretCharacterData(charData: CharacterData) : Promise<string> {
    switch(charData.elem_type) {
        case "TEXT":
            return charData.value;
        case "IMG":
            let filename = await uploadPicture(charData);
            return `<img src="${filename}"`;
    }
}

function interpretTags(tags: Array<Tag>) : string {
    let stringifiedTags = "";
    for (const tag of tags) {
        stringifiedTags += `<a href="${tag.href}">${tag.name}</a>`;
    }

    return stringifiedTags;
}

async function uploadPicture(imageData: CharacterData) : Promise<string> {
    if (imageData.elem_type == "TEXT")
        throw new Error(WRONG_CHARACTER_DATA);
    try {
        let pictureData = {
            filename: "kanjidamage-" + imageData.src.split('/').pop(),
            url: imageData.src
        };

        let filename = await ankiConnectClient.storeMediaFile(pictureData);
        return filename;
    } catch(e) {
        throw e;
    }
}

function kunyomiListMaker(obj: Kunyomis) {
    let result = `<ul id="kunyomi-list">`
    let entryArray = Object.entries(obj);
    for (const [key, val] of entryArray) {
        result += `
            <li class="kunyomi-item">
                <p>${key}</p>
                <p>${val}</p>
            </li>
        `;
    }
    result += "</ul>";

    return result;
}

function debug(text: string) {
    let injectJS = `
    const node = document.createElement('p');
    node.textContent = "${text}";
    document.body.appendChild(node);
    `;

    browser.tabs.create({ url: "/pages/mypage.html" }).then(tab => {
        browser.tabs.executeScript({
            code: injectJS
        });
    });
}

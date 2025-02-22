import { Kanji, KunyomiData, CharacterData } from "../kanji_obj_types";
import { YankiConnect } from "yanki-connect";


const WRONG_CHARACTER_DATA = "INVALID_DATA";

const yankiConnectClient = new YankiConnect();

browser.runtime.onMessage.addListener(message => {
    sendToAnki(message);
});

function sendToAnki(data: Kanji) {
    let cardData = {
        note: {
            deckName: "KANJIDAMAGE",
            modelName: "KanjiDamage",
            fields: {
                kanji: processCharacterData(data.character),
                kanji_name: data.name,
                radicals: "",
                mnemonics: data.mnemonics,
                onyomi: data.onyomi,
                onyomi_mnemonics: data.onyomiMnemonics,
                kunyomis: kunyomiListMaker(data.kunyomiData),
            },
            tags: [],
        }
    };

    yankiConnectClient.graphical
        .guiAddCards(cardData)
        .catch(debug);
}

async function uploadPicture(imageData: CharacterData) : Promise<string> {
    if (imageData.elem_type == "TEXT")
        throw new Error(WRONG_CHARACTER_DATA);
    try {
        let pictureData = {
            filename: "kanjidamage-" + imageData.src.split('/').pop(),
            url: imageData.src
        };

        let response = await yankiConnectClient.media.storeMediaFile(pictureData);
        return response;
    } catch(e) {
        throw e;
    }
}

function processCharacterData(charData: CharacterData) : string {
    switch(charData.elem_type) {
        case "TEXT":
            return charData.value;
        case "IMG":
            let filename = uploadPicture(charData);
            return `<img src="${filename}"`;
    }
}

function kunyomiListMaker(obj: KunyomiData) {
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

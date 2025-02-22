import { Kanji, KunyomiData, CharacterData } from "../kanji_obj_types";
import { YankiConnect } from "yanki-connect";


const WRONG_CHARACTER_DATA = "INVALID_DATA";

const yankiConnectClient = new YankiConnect();

browser.runtime.onMessage.addListener(message => {
    sendToAnki(message);
});

async function uploadPicture(imageData: CharacterData) : Promise<Response> {
    if (imageData.elem_type == "TEXT")
        throw new Error(WRONG_CHARACTER_DATA);
    try {
    } catch(e) {
        throw e;
    }
}

function sendToAnki(data: Kanji) {
    // Process kanji field
    // If it's an image, generate the appropriate JSON
    // else just put in the value
    let kanji_field_content = "";
    let kanji_pic = {};
    if (data.character.elem_type === "TEXT") {
        kanji_field_content = data.character.value;
    }
    else if (data.character.elem_type === "IMG") {
        kanji_pic = {
            url: data.character.src,
            // Use the original filename from the source URL
            // Since it's always at the last part of the URL,
            // we can just use pop()
            filename: "kanjidamage-" + data.character.src.split('/').pop(),
            fields: [
                "character"
            ]
        }
    }

    console.log(kanji_pic);
    console.log(Object.keys(kanji_pic).length === 0 ? [] : [ kanji_pic ]);

    let cardData = {
        note: {
            deckName: "KANJIDAMAGE",
            modelName: "KanjiDamage",
            fields: {
                kanji: kanji_field_content,
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

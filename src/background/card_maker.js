browser.runtime.onMessage.addListener(message => {
    sendToAnki(message);
});

function sendToAnki(data) {
    // Process kanji field
    // If it's an image, generate the appropriate JSON
    // else just put in the value
    let kanji_field_content = "";
    let kanji_pic = {};
    if (data.kanji.elem_type === "TEXT") {
        kanji_field_content = data.kanji.value;
    }
    else if (data.kanji.elem_type === "IMG") {
        kanji_pic = {
            url: data.kanji.src,
            // Use the original filename from the source URL
            // Since it's always at the last part of the URL,
            // we can just use pop()
            filename: data.kanji.src.split('/').pop(),
            fields: [
                "kanji"
            ]
        }
    }

    console.log(kanji_pic);
    console.log(Object.keys(kanji_pic).length === 0 ? [] : [ kanji_pic ]);

    let requestBody = {
        action: "guiAddCards",
        version: 6,
        params: {
            note: {
                deckName: "KANJIDAMAGE",
                modelName: "KanjiDamage",
                fields: {
                    kanji: kanji_field_content,
                    mnemonics: data.mnemonics,
                    onyomi: data.onyomi,
                    kunyomis: kunyomiListMaker(data.kunyomiData),
                    radicals: data.radicals,
                    keyword: data.keyword,
                    "onyomi-sentence": data.onyomiSentence,
                },
                tags: [],
                // If kanji_pic is empty, put empty array
                picture: Object.keys(kanji_pic).length === 0 ? [] : [ kanji_pic ]
            }
        }
    };

    let request = new Request("http://127.0.0.1:8765/", { method: 'POST', body: JSON.stringify(requestBody) });
    fetch(request).catch(debug);
}

function kunyomiListMaker(obj) {
    let result = `<ul id="kunyomi-list">`
    let entryArray = Object.entries(obj);
    for (const [key, val] of entryArray) {
        result += `
            <li class="kunyomi-item">
                <p class="kunyomi-part kunyomi text">${key}</p>
		<p class="kunyomi text">${val}</p>
            </li>
        `;
    }
    result += "</ul>";

    return result;
}

function debug(text) {
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

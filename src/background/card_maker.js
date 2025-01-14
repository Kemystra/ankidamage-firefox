browser.runtime.onMessage.addListener(message => {
    sendToAnki(message);
});

function sendToAnki(data) {
    let requestBody = {
        action: "guiAddCards",
        version: 6,
        params: {
            note: {
                deckName: "KANJIDAMAGE",
                modelName: "KanjiDamage",
                fields: {
                    kanji: data.kanji,
                    mnemonics: data.mnemonics,
                    onyomi: data.onyomi,
                    kunyomis: kunyomiListMaker(data.kunyomiData),
                    radicals: data.radicals,
                    keyword: data.keyword,
                    "onyomi-sentence": data.onyomiSentence,
                },
                tags: [],
                picture: []
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

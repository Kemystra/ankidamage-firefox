type Media = {
    filename: string;
    url: string;
}

type Card = {
    note: {
        deckName: string;
        modelName: string;
        fields: {
            kanji: string;
            kanji_name: string;
            radicals: string;
            mnemonics: string;
            onyomi: string;
            onyomi_mnemonics: string;
            kunyomis: string;
        },
        tags: [],
    }
}

class AnkiConnectCaller {
    url: string;

    constructor() {
        this.url = "http://localhost:8765"
    }

    async _callApi(data: Object, action: string) : Promise<string> {
        let request_body = {
            action: action,
            version: 6,
            params: data
        };

        try {
            let response = await fetch(this.url, { method: "POST", body: JSON.stringify(request_body) });
            let response_text = await response.json();
            if (response_text.error !== null)
                throw Error(response_text.error);
            else
                return Promise.resolve(response_text.result);
        } catch (error) {
            return Promise.reject(error);
        }
        
    }

    async storeMediaFile(media: Media) : Promise<string> {
        return this._callApi(media, "storeMediaFile");
    }

    async graphicalAddCard(card: Card) : Promise<string> {
        return this._callApi(card, "guiAddCards");
    }
};

export { Media, Card, AnkiConnectCaller };

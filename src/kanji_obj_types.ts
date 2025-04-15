type Kanji = {
    character: CharacterData;
    name: string;
    tags: Array<Tag>;
    radicals: Array<Radical>;
    mnemonics: string;
    onyomi: string;
    onyomiMnemonics: string;
    kunyomiData: Kunyomis;
}

// Not sure if this is the best way to make interface aliases
interface Kunyomis extends Record<string, string> { }

type Radical = {
    character: CharacterData;
    name: string;
    tags: Array<Tag>;
}

type CharacterData =
    { elem_type: "IMG"; src: string; } |
    { elem_type: "TEXT"; value: string; }

type Tag = {
    name: string;
}

export { Kanji, Kunyomis, Radical, CharacterData, Tag };

type Kanji = {
    character: CharacterData;
    name: string;
    radicals: Radicals;
    mnemonics: string;
    onyomi: string;
    onyomiMnemonics: string;
    kunyomiData: Kunyomis;
}

// Not sure if this is the best way to make interface aliases
interface Kunyomis extends Record<string, string> { }

interface Radicals extends Record<string, CharacterData> { }

type CharacterData =
    { elem_type: "IMG"; src: string; } |
    { elem_type: "TEXT"; value: string; }

export { Kanji, Kunyomis, Radicals, CharacterData };

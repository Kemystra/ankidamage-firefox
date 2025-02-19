type Kanji = {
    character?: CharacterData;
    name?: string;
    radicals?: string;
    mnemonics?: string;
    onyomi?: string;
    onyomiMnemonics?: string;
    kunyomiData?: KunyomiData;
}

// Not sure if this is the best way to make interface aliases
interface KunyomiData extends Record<string, string> { }

type CharacterData =
    { elem_type: "IMG"; src: string; } |
    { elem_type: "TEXT"; value: string; }

export { Kanji, KunyomiData, CharacterData };

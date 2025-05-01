type Kanji = {
    character: CharacterData;
    name: string;
    tags: Array<Tag>;
    radicals: Array<Radical>;
    mnemonics: string;
    onyomi: string;
    onyomiMnemonics: string;
    kunyomis: Array<Kunyomi>;
    jukugos: Array<Jukugo>;
}

// Not sure if this is the best way to make interface aliases
type Kunyomi = {
    reading: string;
    meaning: string;
    tags: Array<Tag>;
}

type Jukugo = {
    word: string;
    furigana: string;
    meaning: string;
    tags: Array<Tag>;
}

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

export { Kanji, Kunyomi, Radical, CharacterData, Tag, Jukugo };

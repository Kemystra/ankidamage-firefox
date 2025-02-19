interface Kanji {
    character?: string;
    name?: string;
    radicals?: string;
    mnemonics?: string;
    onyomi?: string;
    onyomiMnemonics?: string;
    kunyomiData?: KunyomiData;
}

// Not sure if this is the best way to make interface aliases
interface KunyomiData extends Record<string, string> {}

export { Kanji, KunyomiData };

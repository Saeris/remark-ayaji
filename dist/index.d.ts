import { Root } from "mdast";

//#region src/index.d.ts
declare const tokenMap: {
  readonly 接頭詞: "prefix";
  readonly 代名詞: "pronoun";
  readonly 連体詞: "adnominal";
  readonly 名詞: "noun";
  readonly 形容動詞: "adjectival-noun";
  readonly 形容詞: "adjective";
  readonly 助詞: "particle";
  readonly 接続詞: "conjunction";
  readonly 感動詞: "interjection";
  readonly 副詞: "adverb";
  readonly 動詞: "verb";
  readonly 助動詞: "auxiliary-verb";
  readonly 記号: null;
};
type PoS = Exclude<(typeof tokenMap)[keyof typeof tokenMap], null>;
interface Options {
  furigana?: boolean;
  include?: PoS[];
  exclude?: PoS[];
}
declare const remarkAyaji: (globalOptions?: Options) => (tree: Root) => void;
//#endregion
export { Options, PoS, remarkAyaji as default, remarkAyaji };
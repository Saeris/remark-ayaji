import { join } from "node:path";
import { toHiragana, isKanji } from "wanakana";
import { tokenizerNode } from "@saeris/kuromoji";
import type { Root } from "mdast";
import { visit } from "unist-util-visit";
import JSON5 from "json5";

const tokenMap = {
  接頭詞: `prefix`,
  代名詞: `pronoun`,
  連体詞: `adnominal`,
  名詞: `noun`,
  形容動詞: `adjectival-noun`,
  形容詞: `adjective`,
  助詞: `particle`,
  接続詞: `conjunction`,
  感動詞: `interjection`,
  副詞: `adverb`,
  動詞: `verb`,
  助動詞: `auxiliary-verb`,
  記号: null // punctuation
} as const;

export type PoS = Exclude<(typeof tokenMap)[keyof typeof tokenMap], null>;

export interface Options {
  furigana?: boolean;
  include?: PoS[];
  exclude?: PoS[];
}

const containsKanji = (input: string): boolean => Boolean(input.split(``).find(isKanji));

const tokenizer = await tokenizerNode(join(process.cwd(), `./dict`));

const highlight = (value: string, options?: Options) => {
  const settings: Options = Object.assign(
    {
      furigana: false,
      include: Object.values(tokenMap).filter((v) => v !== null),
      exclude: []
    },
    options
  );
  const tokens = tokenizer.tokenize(value);
  const annotated = tokens.reduce<Array<[token: string, pos: string, furigana: string | null]>>(
    (arr, { pos, surface_form, reading }) => {
      arr.push([
        surface_form.toString(),
        // merge prefix with the next token if it exists
        pos,
        containsKanji(surface_form.toString()) ? toHiragana(reading) : null
      ]);
      return arr;
    },
    []
  );
  const markup = annotated.map(([token, pos, furigana], i, arr) => {
    const word = settings.furigana && furigana ? `{${token}|${furigana}}` : token;
    const included = Boolean(settings.include?.length && settings.include.includes(tokenMap[pos]));
    const excluded = Boolean(settings.exclude?.length && settings.exclude.includes(tokenMap[pos]));

    // handle prefixes
    if (included && !excluded && pos === `接頭詞` && i + 1 <= arr.length) {
      return {
        data: {
          hName: `span`,
          hProperties: { class: tokenMap[arr[i + 1][1]] }
        },
        children: [
          {
            type: `text`,
            value: word
          }
        ]
      };
    } else if (included && !excluded && pos !== `接頭詞` && pos !== `記号`) {
      return {
        data: {
          hName: `span`,
          hProperties: { class: tokenMap[pos] }
        },
        children: [
          {
            type: `text`,
            value: word
          }
        ]
      };
    }
    return {
      type: `text`,
      value: word
    };
  });
  return {
    type: `paragraph`,
    children: markup
  };
};

const safeParse = (meta: string | null | undefined): Record<string, unknown> => {
  if (typeof meta !== `string`) return {};
  try {
    return JSON5.parse(`{ ${meta} }`);
  } catch (err: unknown) {
    console.log(`Invalid options: "${meta}" provided to Ayaji block.`, err);
    return {};
  }
};

export const remarkAyaji =
  (globalOptions?: Options) =>
  (tree: Root): void => {
    visit(tree, `code`, (node, index, parent) => {
      if (node.lang === `jp` && parent && typeof index === `number`) {
        const options = Object.assign(globalOptions ?? {}, safeParse(node.meta));
        parent.children.splice(
          index,
          1,
          // @ts-expect-error
          ...node.value.split(/(?:\r?\n)+/).map((paragraph) => highlight(paragraph, options))
        );
      }
    });
  };

export default remarkAyaji;

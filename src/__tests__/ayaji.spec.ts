import { join } from "node:path";
import { remark } from "remark";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { type Options, remarkAyaji } from "../index";

const transform = async (markdown: string, options?: Omit<Options, `dict`>): Promise<string> => {
  const dict = join(process.cwd(), `./dict`);
  const result = await remark()
    .use(remarkParse)
    .use(remarkAyaji, {
      dict,
      ...options
    })
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown);
  return result.toString();
};

describe(`remark-ayaji`, () => {
  it(`works`, async () => {
    const actual = await transform(`\`\`\`jp\n日本語\n\`\`\``);
    const expected = `<p><span class="noun">日本語</span></p>`;

    expect(actual).toStrictEqual(expected);
  });

  it(`prefixes should be classified as the word they are attached to`, async () => {
    const actual = await transform(`\`\`\`jp\nご高\n\`\`\``);
    const expected = `<p><span class="noun">ご</span><span class="noun">高</span></p>`;

    expect(actual).toStrictEqual(expected);
  });

  describe(`supports global settings`, () => {
    it(`furigana`, async () => {
      const actual = await transform(`\`\`\`jp\n日本語\n\`\`\``, { furigana: true });
      const expected = `<p><span class="noun">{日本語|にほんご}</span></p>`;

      expect(actual).toStrictEqual(expected);
    });

    it(`include`, async () => {
      const actual = await transform(`\`\`\`jp\n日本語が分かります\n\`\`\``, { include: [`noun`] });
      const expected = `<p><span class="noun">日本語</span>が分かります</p>`;

      expect(actual).toStrictEqual(expected);
    });

    it(`exclude`, async () => {
      const actual = await transform(`\`\`\`jp\n日本語が分かります\n\`\`\``, { exclude: [`noun`, `auxiliary-verb`] });
      const expected = `<p>日本語<span class="particle">が</span><span class="verb">分かり</span>ます</p>`;

      expect(actual).toStrictEqual(expected);
    });
  });

  describe(`supports local settings`, () => {
    it(`overrides global settings`, async () => {
      const actual = await transform(`\`\`\`jp furigana: false\n日本語\n\`\`\``, { furigana: true });
      const expected = `<p><span class="noun">日本語</span></p>`;

      expect(actual).toStrictEqual(expected);
    });

    it(`logs a message when an invalid local config is supplied`, async () => {
      const consoleMock = vi.spyOn(console, `log`).mockImplementation(() => undefined);
      const actual = await transform(`\`\`\`jp foo\n日本語\n\`\`\``);
      const expected = `<p><span class="noun">日本語</span></p>`;

      expect(actual).toStrictEqual(expected);
      expect(consoleMock).toHaveBeenCalledOnce();
      expect(consoleMock).toHaveBeenCalledWith(expect.stringContaining(`Invalid options:`), expect.any(Error));
    });

    it(`furigana`, async () => {
      const actual = await transform(`\`\`\`jp furigana: true\n日本語\n\`\`\``);
      const expected = `<p><span class="noun">{日本語|にほんご}</span></p>`;

      expect(actual).toStrictEqual(expected);
    });

    it(`include`, async () => {
      const actual = await transform(`\`\`\`jp include: ["noun"]\n日本語が分かります\n\`\`\``);
      const expected = `<p><span class="noun">日本語</span>が分かります</p>`;

      expect(actual).toStrictEqual(expected);
    });

    it(`exclude`, async () => {
      const actual = await transform(`\`\`\`jp exclude: ["noun", "auxiliary-verb"]\n日本語が分かります\n\`\`\``);
      const expected = `<p>日本語<span class="particle">が</span><span class="verb">分かり</span>ます</p>`;

      expect(actual).toStrictEqual(expected);
    });
  });
});

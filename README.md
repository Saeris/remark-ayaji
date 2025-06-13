# 🌈 remark-ayaji [![Build Status][ci-badge]][ci] [![npm][npm-badge]][npm]

_**[絢][絢][字][字]** 「あや・じ」: colorful letters_

A [remark][remark] plugin to add "syntax-highlighting" for Japanese grammar as a code fence language. It uses [kuromoji][kuromoji] to tokenize Japanese text into it's component parts of speech.

## 📦 Installation

> [!Note]
>
> This library is distributed only as an ESM module.

```bash
npm install @saeris/remark-ayaji
```

or

```bash
yarn add @saeris/remark-ayaji
```

## 🔧 Usage

Using this library will depend on your particular application or framework. Below is a bare-bones example to test it in Node.

**Node:**

```ts
import remark from "remark";
import remarkParse from "remark-parse";
import remarkAyaji from "@saeris/remark-ayaji";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

const result = remark()
  .use(remarkParse)
  .use(remarkAyaji /* options */)
  .use(remarkRehype)
  .use(rehypeStringify)
  .processSync(markdown);

console.log(result.tostring());
```

**CSS:**

This library also distributes an optional CSS file to get you started with syntax highlighting. Consuming it will largely depend on your particular application's conventions. In frameworks such as Nextjs or Astro, importing the file in your root layout should be all you need.

```ts
import "@saeris/remark-ayaji/theme.css";
```

## 🖋️ Syntax

Highlighting works in a similar manner to syntax highlighters for code, using code fences with a `jp` language annotation:

````markdown
```jp
日本語が分かります。
```
````

This will compile to the following HTML:

```html
<p><span class="noun">日本語</span><span class="particle">が</span><span class="verb">分かり</span><span class="auxiliary-verb"ます</span>。</p>
```

## 🎛️ Options

```ts
type PoS =
  | "prefix"
  | "pronoun"
  | "adnominal"
  | "noun"
  | "adjectival-noun"
  | "adjective"
  | "particle"
  | "conjunction"
  | "interjection"
  | "adverb"
  | "verb"
  | "auxiliary-verb";

interface Options {
  furigana?: boolean;
  include?: PoS[];
  exclude?: PoS[];
}
```

This plugin can be configured both globally via an options object supplied alongside where the plugin is imported and used, or locally via the code fence meta after the language attribute in a comma-separated, JSON-like syntax. Examples can be found below.

### options.furigana

Adds furigana to words containing kanji in the Denden Furigana markdown syntax: `{日本語|にほんご}`. By combining this plugin with [remark-denden-ruby][remark-denden-ruby], this will produce [`<ruby>`][mdn-ruby] text annotations to further aid in readability.

**global config:**

```javascript
.use(remarkAyaji, { furigana: true })
.use(remarkRuby) // plugin order is important!
```

**local config:**

````markdown
```jp furigana: true
日本語
```
````

**result:**

```html
<p>
  <span class="noun"
    ><ruby>日本語<rp>(</rp><rt>にほんご</rt><rp>)</rp></ruby></span
  >
</p>
```

> [!Warning]
>
> Because of the nature of morphological analysis, which is the means by which [kuromoji][kuromoji] handles tokenization, the best match for the reading of any particular kanji or word containing kanji will be based on the most common usage of that kanji. This means that certain words, most often proper nouns like names, will have a false-positive reading match.

### options.include

An array of parts of speech to include in highlighting.

**global config:**

```javascript
.use(remarkAyaji, { include: ["noun"] })
.use(remarkRuby) // plugin order is important!
```

**local config:**

````markdown
```jp include: ["noun"]
日本語が分かります。
```
````

**result:**

```html
<p><span class="noun">日本語</span>が分かります。</p>
```

### options.exclude

An array of parts of speech to exclude in highlighting. This will take precidence over any parts of speech specified in `include` regardless of whether it is enabled globally or locally.

**global config:**

```javascript
.use(remarkAyaji, { exclude: ["noun", "auxiliary-verb"] })
.use(remarkRuby) // plugin order is important!
```

**local config:**

````markdown
```jp exclude: ["noun", "auxiliary-verb"]
日本語が分かります。
```
````

**result:**

```html
<p>日本語<span class="particle">が</span><span class="verb">分かり</span>ます。</p>
```

## 🥂 License

Released under the [MIT][license] © [Drake Costa][personal-website]

<!-- Definitions -->

[絢]: https://jisho.org/search/%E7%B5%A2%20%23kanji
[字]: https://jisho.org/search/%E5%AD%97%20%23kanji
[ci]: https://github.com/saeris/remark-ayaji/actions/workflows/ci.yml
[ci-badge]: https://github.com/Saeris/eslint-config/actions/workflows/test.yml/badge.svg
[npm]: https://www.npmjs.org/package/@saeris/remark-ayaji
[npm-badge]: https://img.shields.io/npm/v/@saeris/remark-ayaji.svg?style=flat
[remark]: https://github.com/remarkjs/remark
[kuromoji]: https://github.com/saeris/kuromoji
[remark-denden-ruby]: https://github.com/fabon-f/remark-denden-ruby
[mdn-ruby]: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ruby
[license]: https://github.com/saeris/remark-ayaji/blob/master/LICENSE.md
[personal-website]: https://saeris.gg

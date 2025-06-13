import { join } from "node:path";
import { isKanji, toHiragana } from "wanakana";
import { tokenizerNode } from "@saeris/kuromoji";
import { visit } from "unist-util-visit";
import JSON5 from "json5";

//#region src/index.ts
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
	記号: null
};
const containsKanji = (input) => Boolean(input.split(``).find(isKanji));
const tokenizer = await tokenizerNode(join(process.cwd(), `./dict`));
const highlight = (value, options) => {
	const settings = Object.assign({
		furigana: true,
		include: Object.values(tokenMap).filter((v) => v !== null),
		exclude: []
	}, options);
	const tokens = tokenizer.tokenize(value);
	const annotated = tokens.reduce((arr, { pos, surface_form, reading }) => {
		arr.push([
			surface_form.toString(),
			pos,
			containsKanji(surface_form.toString()) ? toHiragana(reading) : null
		]);
		return arr;
	}, []);
	const markup = annotated.map(([token, pos, furigana], i, arr) => {
		const word = settings.furigana && furigana ? `{${token}|${furigana}}` : token;
		const included = Boolean(settings.include?.length && settings.include.includes(tokenMap[pos]));
		const excluded = Boolean(settings.exclude?.length && settings.exclude.includes(tokenMap[pos]));
		if (included && !excluded && pos === `接頭詞` && i + 1 <= arr.length) return {
			data: {
				hName: `span`,
				hProperties: { class: tokenMap[arr[i + 1][1]] }
			},
			children: [{
				type: `text`,
				value: word
			}]
		};
		else if (included && !excluded && pos !== `接頭詞` && pos !== `記号`) return {
			data: {
				hName: `span`,
				hProperties: { class: tokenMap[pos] }
			},
			children: [{
				type: `text`,
				value: word
			}]
		};
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
const safeParse = (meta) => {
	if (typeof meta !== `string`) return {};
	try {
		return JSON5.parse(`{ ${meta} }`);
	} catch (err) {
		console.log(`Invalid options: "${meta}" provided to Ayaji block.`, err);
		return {};
	}
};
const remarkAyaji = (globalOptions) => (tree) => {
	visit(tree, `code`, (node, index, parent) => {
		if (node.lang === `jp` && parent && typeof index === `number`) {
			const options = Object.assign(globalOptions ?? {}, safeParse(node.meta));
			parent.children.splice(index, 1, ...node.value.split(/(?:\r?\n)+/).map((paragraph) => highlight(paragraph, options)));
		}
	});
};
var src_default = remarkAyaji;

//#endregion
export { src_default as default, remarkAyaji };
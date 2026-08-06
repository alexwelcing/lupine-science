import { JSDOM } from 'jsdom';
import MarkdownIt from 'markdown-it';
import footnote from 'markdown-it-footnote';
import { katex as katexPlugin } from '@mdit/plugin-katex';

const ALLOWED_RAW_HTML = new Map([
  ['a', new Set(['download', 'href'])],
  ['div', new Set(['class'])],
  ['em', new Set()],
  ['figcaption', new Set(['id'])],
  ['figure', new Set(['aria-labelledby', 'class'])],
  ['p', new Set(['class'])],
  ['source', new Set(['src', 'type'])],
  ['span', new Set(['class'])],
  ['strong', new Set()],
  ['video', new Set(['aria-label', 'controls', 'playsinline', 'poster'])],
]);
const URL_ATTRIBUTES = new Set(['href', 'poster', 'src']);

// typographer: real quotes and apostrophes in prose (code blocks untouched)
const md = new MarkdownIt({ html: true, typographer: true })
  .use(footnote)
  .use(katexPlugin, { throwOnError: false, trust: false });

function isAllowedUrl(value) {
  const normalized = value.trim().toLowerCase();
  return (normalized.startsWith('/') && !normalized.startsWith('//'))
    || normalized.startsWith('./')
    || normalized.startsWith('../')
    || normalized.startsWith('#')
    || normalized.startsWith('https://');
}

function validateHtmlFragment(fragment) {
  const root = JSDOM.fragment(fragment);
  for (const element of root.querySelectorAll('*')) {
    const tag = element.localName;
    const allowedAttributes = ALLOWED_RAW_HTML.get(tag);
    if (!allowedAttributes) {
      throw new Error(`Unsafe raw HTML element in article Markdown: <${tag}>`);
    }
    for (const attribute of element.attributes) {
      const name = attribute.name.toLowerCase();
      if (!allowedAttributes.has(name)) {
        throw new Error(`Unsafe raw HTML attribute in article Markdown: ${name}`);
      }
      if (URL_ATTRIBUTES.has(name) && !isAllowedUrl(attribute.value)) {
        throw new Error(`Unsafe raw HTML URL in article Markdown: ${name}`);
      }
    }
  }
}

function validateRawHtml(tokens) {
  for (const token of tokens) {
    if (token.type === 'html_block' || token.type === 'html_inline') {
      validateHtmlFragment(token.content);
    }
    if (token.children) validateRawHtml(token.children);
  }
}

export function renderArticleMarkdown(source) {
  validateRawHtml(md.parse(source, {}));
  return md.render(source);
}

import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectAnnotations, parseFontRows, parsePdfInfo, sparseTextPages } from '../scripts/check-pdf.mjs';
import { PDFDocument, PDFName, PDFString } from 'pdf-lib';

const FONT_OUTPUT = `name                                 type              encoding         emb sub uni object ID
------------------------------------ ----------------- ---------------- --- --- --- ---------
AAAAAA+Newsreader16pt-Regular        Type 3            Custom           yes yes yes     58  0
BAAAAA+Unembedded                    TrueType           WinAnsi          no  no  no      59  0
`;

test('parsePdfInfo extracts Poppler fields', () => {
  assert.deepEqual(parsePdfInfo('Pages: 71\nTagged: no\nPage size: 612 x 792 pts (letter)\n'), {
    Pages: '71',
    Tagged: 'no',
    'Page size': '612 x 792 pts (letter)',
  });
});

test('parseFontRows retains embedding and Unicode flags', () => {
  assert.deepEqual(parseFontRows(FONT_OUTPUT), [
    {
      name: 'AAAAAA+Newsreader16pt-Regular',
      description: 'Type 3            Custom',
      embedded: 'yes',
      subset: 'yes',
      unicode: 'yes',
    },
    {
      name: 'BAAAAA+Unembedded',
      description: 'TrueType           WinAnsi',
      embedded: 'no',
      subset: 'no',
      unicode: 'no',
    },
  ]);
});

test('sparseTextPages finds blank and page-number-only pages', () => {
  assert.deepEqual(sparseTextPages('article text\f  2  \f\fmore text\f'), [2, 3]);
});

test('inspectAnnotations reports localhost and unresolved named links', async () => {
  const document = await PDFDocument.create();
  const page = document.addPage();
  const uriAction = document.context.obj({ S: 'URI', URI: PDFString.of('http://127.0.0.1:3000/article') });
  const uriAnnotation = document.context.obj({ Type: 'Annot', Subtype: 'Link', Rect: [0, 0, 10, 10], A: uriAction });
  const namedAnnotation = document.context.obj({ Type: 'Annot', Subtype: 'Link', Rect: [10, 0, 20, 10], Dest: PDFName.of('fn1') });
  page.node.set(PDFName.of('Annots'), document.context.obj([uriAnnotation, namedAnnotation]));

  const result = await inspectAnnotations(await document.save());
  assert.equal(result.namedLinks, 1);
  assert.equal(result.unresolvedNamedLinks, 1);
  assert.deepEqual(result.annotationUris, [{ page: 1, uri: 'http://127.0.0.1:3000/article' }]);
});

import fs from 'node:fs';

import { PDFDocument } from 'pdf-lib';

export async function readProofPackMetadata(pdfPath) {
  const pdf = fs.readFileSync(pdfPath);
  let document;
  try {
    document = await PDFDocument.load(pdf, { updateMetadata: false });
  } catch (error) {
    throw new Error(`Proof Pack is not a valid PDF: ${pdfPath}`, { cause: error });
  }

  const pageCount = document.getPageCount();
  if (!pageCount) throw new Error(`Proof Pack has no pages: ${pdfPath}`);

  const updatedAt = document.getModificationDate() || document.getCreationDate();
  if (!updatedAt) throw new Error(`Proof Pack has no embedded update date: ${pdfPath}`);

  const size = pdf.byteLength >= 1024 * 1024
    ? `${(pdf.byteLength / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.round(pdf.byteLength / 1024)} KB`;

  return {
    pageCount,
    size,
    updatedDate: updatedAt.toISOString().slice(0, 10),
  };
}

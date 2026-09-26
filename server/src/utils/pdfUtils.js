import fs from 'fs';
import { PDFDocument } from 'pdf-lib';

export async function getRealPdfPageCount(filePath) {
  try {
    const fileBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
    return pdfDoc.getPageCount();
  } catch (error) {
    throw new Error(`Failed to parse PDF document: ${error.message}`);
  }
}

export function safeUnlink(filePath) {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[Cleanup] Successfully removed temp file: ${filePath}`);
    }
  } catch (err) {
    console.error(`[Cleanup Warning] Could not remove file ${filePath}:`, err.message);
  }
}

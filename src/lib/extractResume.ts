import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure CDN worker src with fallback
if (typeof window !== 'undefined') {
  try {
    pdfjs.GlobalWorkerOptions.workerSrc =
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '5.1.91'}/pdf.worker.min.mjs`;
  } catch {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }
}

export type SupportedResumeType = 'pdf' | 'docx' | 'txt' | 'md';

export function detectResumeType(file: File): SupportedResumeType | null {
  const name = file.name.toLowerCase();
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  if (
    file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    return 'docx';
  }
  if (file.type.startsWith('text/') || name.endsWith('.txt') || name.endsWith('.md')) {
    return name.endsWith('.md') ? 'md' : 'txt';
  }
  return null;
}

function extractRawTextFromPdfBinary(uint8: Uint8Array): string {
  let str = '';
  const len = uint8.length;
  for (let i = 0; i < len; i += 1) {
    const charCode = uint8[i];
    if ((charCode >= 32 && charCode <= 126) || charCode === 10 || charCode === 13 || charCode === 9) {
      str += String.fromCharCode(charCode);
    } else {
      str += ' ';
    }
  }

  const textMatches: string[] = [];
  const btRegex = /\(([^\(\)\\]{2,100})\)/g;
  let match: RegExpExecArray | null;
  while ((match = btRegex.exec(str)) !== null) {
    const cleaned = match[1].trim();
    if (cleaned.length > 2 && /^[a-zA-Z0-9\s.,;:@#%&/()\-+]+$/.test(cleaned)) {
      textMatches.push(cleaned);
    }
  }

  return textMatches.join(' ').replace(/\s+/g, ' ').trim();
}

async function extractPdf(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(buffer);

  let pdf: pdfjs.PDFDocumentProxy | null = null;

  try {
    const loadingTask = pdfjs.getDocument({
      data: uint8,
      useSystemFonts: true,
    });
    pdf = await loadingTask.promise;
  } catch (e1) {
    console.warn('PDF.js primary worker attempt failed, trying unpkg CDN...', e1);
    try {
      pdfjs.GlobalWorkerOptions.workerSrc =
        `https://unpkg.com/pdfjs-dist@${pdfjs.version || '5.1.91'}/build/pdf.worker.min.mjs`;
      const loadingTask = pdfjs.getDocument({ data: uint8, useSystemFonts: true });
      pdf = await loadingTask.promise;
    } catch (e2) {
      console.warn('PDF.js CDN worker attempt failed, trying local worker...', e2);
      try {
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        const loadingTask = pdfjs.getDocument({ data: uint8, useSystemFonts: true });
        pdf = await loadingTask.promise;
      } catch (e3) {
        console.warn('All PDF.js worker attempts failed, trying binary stream parser...', e3);
      }
    }
  }

  if (pdf) {
    try {
      const pages: string[] = [];
      for (let i = 1; i <= pdf.numPages; i += 1) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items
          .map((item) => ('str' in item ? String(item.str) : ''))
          .filter(Boolean);
        pages.push(strings.join(' '));
      }
      const extracted = pages.join('\n\n').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
      if (extracted.length >= 20) return extracted;
    } catch (ePage) {
      console.warn('Error reading pages from PDF document object:', ePage);
    }
  }

  // Fallback: binary raw text stream parser
  const rawText = extractRawTextFromPdfBinary(uint8);
  if (rawText.length >= 20) return rawText;

  throw new Error(
    'Failed to read PDF text. The document might be an image-only/scanned PDF or protected. You can paste the text manually.'
  );
}

async function extractDocx(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return (result.value || '').replace(/\n{3,}/g, '\n\n').trim();
}

async function extractText(file: File): Promise<string> {
  return (await file.text()).trim();
}

export async function extractResumeText(file: File): Promise<{
  text: string;
  type: SupportedResumeType;
  fileName: string;
}> {
  const type = detectResumeType(file);
  if (!type) {
    throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT.');
  }

  let text = '';
  try {
    if (type === 'pdf') text = await extractPdf(file);
    else if (type === 'docx') text = await extractDocx(file);
    else text = await extractText(file);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown extraction error';
    throw new Error(msg);
  }

  if (!text || text.length < 20) {
    throw new Error(
      'Could not extract text from this file. If it is a scanned image, please paste text manually or try a DOCX/TXT file.'
    );
  }

  return { text, type, fileName: file.name };
}

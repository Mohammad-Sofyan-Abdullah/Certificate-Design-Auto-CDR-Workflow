import { jsPDF } from 'jspdf';
import { dateToWords } from './dateToWords';
import { BASE_IMAGE_HEIGHT, BASE_IMAGE_WIDTH, FIELD_POSITIONS, FieldSpan } from './fieldPositions';
import { Grade } from './grades';

export interface CertificateData {
  srNo: string;
  admission: string;
  name: string;
  fatherName: string;
  guardianName: string;
  dob: string; // yyyy-mm-dd (from <input type="date">)
  dateOfAdmission: string; // yyyy-mm-dd
  classAdmitted: Grade;
  classAtLeaving: Grade;
  dateOfLeaving: string; // yyyy-mm-dd
  reasonOfLeaving: string;
  gender: 'He' | 'She';
}

const FONT_FAMILY = '"Times New Roman", Times, serif';
const FONT_WEIGHT = 'bold';
const MIN_FONT_PX = 14;
const LINE_LIFT_RATIO = 0.19; // lifts baseline above the printed line
const LEFT_PADDING_FRACTION = 0.028; // left margin for left-aligned values, as a fraction of image width

function parseDateInput(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatDMY(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
}

export function deriveDisplayFields(data: CertificateData) {
  const dobDate = parseDateInput(data.dob);
  const dateOfAdmissionDate = parseDateInput(data.dateOfAdmission);
  const dateOfLeavingDate = parseDateInput(data.dateOfLeaving);
  const today = new Date();

  return {
    dobFigureText: dobDate ? formatDMY(dobDate) : '',
    dobWordsText: dobDate ? dateToWords(dobDate) : '',
    dateOfAdmissionText: dateOfAdmissionDate ? formatDMY(dateOfAdmissionDate) : '',
    classAdmittedText: data.classAdmitted,
    classAtLeavingText: data.classAtLeaving ? `Promoted to ${data.classAtLeaving}` : '',
    dateOfLeavingText: dateOfLeavingDate ? formatDMY(dateOfLeavingDate) : '',
    remarksText: `${data.gender} is an obedient child.`,
    dateOfIssueText: formatDMY(today),
  };
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startFontPx: number,
): number {
  let fontPx = startFontPx;
  ctx.font = `${FONT_WEIGHT} ${fontPx}px ${FONT_FAMILY}`;
  while (ctx.measureText(text).width > maxWidth && fontPx > MIN_FONT_PX) {
    fontPx -= 1;
    ctx.font = `${FONT_WEIGHT} ${fontPx}px ${FONT_FAMILY}`;
  }
  return fontPx;
}

function drawSingleLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  span: FieldSpan,
  fontFraction: number,
  align: 'left' | 'center',
  imageWidth: number,
  imageHeight: number,
) {
  if (!text) return;
  const fullWidth = (span.x1 - span.x0) * imageWidth;
  const paddingPx = align === 'center' ? 0 : LEFT_PADDING_FRACTION * imageWidth;
  const maxWidth = fullWidth - paddingPx;
  const baseFontPx = fontFraction * imageHeight;
  const fontPx = fitFontSize(ctx, text, maxWidth, baseFontPx);
  ctx.font = `${FONT_WEIGHT} ${fontPx}px ${FONT_FAMILY}`;
  const yPos = span.y * imageHeight - fontPx * LINE_LIFT_RATIO;

  if (align === 'center') {
    const textWidth = ctx.measureText(text).width;
    const startX = span.x0 * imageWidth + (fullWidth - textWidth) / 2;
    ctx.fillText(text, startX, yPos);
  } else {
    ctx.fillText(text, span.x0 * imageWidth + paddingPx, yPos);
  }
}

function drawTwoSpanText(
  ctx: CanvasRenderingContext2D,
  text: string,
  spans: FieldSpan[],
  fontFraction: number,
  imageWidth: number,
  imageHeight: number,
) {
  if (!text) return;
  const [span0, span1] = spans;
  const paddingPx = LEFT_PADDING_FRACTION * imageWidth;
  const maxWidth0 = (span0.x1 - span0.x0) * imageWidth - paddingPx;
  const maxWidth1 = (span1.x1 - span1.x0) * imageWidth - paddingPx;
  let fontPx = fontFraction * imageHeight;

  let line0 = text;
  let line1 = '';

  for (let attempt = 0; attempt < 40; attempt++) {
    ctx.font = `${FONT_WEIGHT} ${fontPx}px ${FONT_FAMILY}`;

    if (ctx.measureText(text).width <= maxWidth0) {
      line0 = text;
      line1 = '';
      break;
    }

    const words = text.split(' ');
    let built = '';
    let splitIndex = words.length;
    for (let i = 0; i < words.length; i++) {
      const candidate = built ? `${built} ${words[i]}` : words[i];
      if (ctx.measureText(candidate).width > maxWidth0) {
        splitIndex = i;
        break;
      }
      built = candidate;
    }
    line0 = built;
    line1 = words.slice(splitIndex).join(' ');

    if (ctx.measureText(line1).width <= maxWidth1 || fontPx <= MIN_FONT_PX) {
      break;
    }
    fontPx -= 1;
  }

  ctx.font = `${FONT_WEIGHT} ${fontPx}px ${FONT_FAMILY}`;
  ctx.fillText(line0, span0.x0 * imageWidth + paddingPx, span0.y * imageHeight - fontPx * LINE_LIFT_RATIO);
  if (line1) {
    ctx.fillText(line1, span1.x0 * imageWidth + paddingPx, span1.y * imageHeight - fontPx * LINE_LIFT_RATIO);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function renderCertificate(data: CertificateData): Promise<HTMLCanvasElement> {
  const baseImage = await loadImage('/certificate-base.png');

  const canvas = document.createElement('canvas');
  canvas.width = BASE_IMAGE_WIDTH;
  canvas.height = BASE_IMAGE_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(baseImage, 0, 0, BASE_IMAGE_WIDTH, BASE_IMAGE_HEIGHT);
  ctx.fillStyle = '#000000';
  ctx.textBaseline = 'alphabetic';

  const derived = deriveDisplayFields(data);

  const values: Record<string, string> = {
    srNo: data.srNo,
    admission: data.admission,
    name: data.name,
    fatherName: data.fatherName,
    guardianName: data.guardianName,
    dobFigure: derived.dobFigureText,
    dobWords: derived.dobWordsText,
    dateOfAdmission: derived.dateOfAdmissionText,
    classAdmitted: derived.classAdmittedText,
    classAtLeaving: derived.classAtLeavingText,
    dateOfLeaving: derived.dateOfLeavingText,
    reasonOfLeaving: data.reasonOfLeaving,
    remarks: derived.remarksText,
    dateOfIssue: derived.dateOfIssueText,
  };

  for (const [key, position] of Object.entries(FIELD_POSITIONS)) {
    const text = values[key] ?? '';
    if (position.spans) {
      drawTwoSpanText(ctx, text, position.spans, position.fontSizeFraction, BASE_IMAGE_WIDTH, BASE_IMAGE_HEIGHT);
    } else if (position.span) {
      drawSingleLine(
        ctx,
        text,
        position.span,
        position.fontSizeFraction,
        position.align ?? 'left',
        BASE_IMAGE_WIDTH,
        BASE_IMAGE_HEIGHT,
      );
    }
  }

  return canvas;
}

export function canvasToPdfBlob(canvas: HTMLCanvasElement): Blob {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageData = canvas.toDataURL('image/png', 1.0);
  pdf.addImage(imageData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
  return pdf.output('blob');
}

export function buildFileName(data: CertificateData): string {
  const safeName = (data.name || 'certificate').trim().replace(/\s+/g, '_').replace(/[^\w-]/g, '');
  const srNoPart = data.srNo ? `${data.srNo.trim().replace(/\s+/g, '_')}_` : '';
  return `${srNoPart}${safeName}_Leaving_Certificate.pdf`;
}

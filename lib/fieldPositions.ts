// Native resolution of the base template image.
export const BASE_IMAGE_WIDTH = 2478;
export const BASE_IMAGE_HEIGHT = 3491;

/**
 * All coordinates are fractions of the base image width/height so the
 * renderer works at any output resolution. (x0, x1) is the horizontal span
 * of the blank line the value should be written on; y is the fraction down
 * the image where that line sits. These were measured directly from the
 * template's pixel data (locating the horizontal underline strokes), not
 * eyeballed, so they should already line up closely.
 */
export interface FieldSpan {
  x0: number;
  x1: number;
  y: number;
}

export interface FieldPosition {
  /** Single-line field: one span to draw the value into. */
  span?: FieldSpan;
  /** Multi-line field (only Date of Birth in words needs this): drawn across two lines, wrapping as needed. */
  spans?: FieldSpan[];
  fontSizeFraction: number; // fraction of image height
  align?: 'left' | 'center';
}

const DEFAULT_FONT_FRACTION = 0.0155;

export const FIELD_POSITIONS: Record<string, FieldPosition> = {
  srNo: {
    span: { x0: 0.1501, x1: 0.3002, y: 0.2932 },
    fontSizeFraction: DEFAULT_FONT_FRACTION,
    align: 'center',
  },
  admission: {
    span: { x0: 0.7607, x1: 0.9108, y: 0.2932 },
    fontSizeFraction: DEFAULT_FONT_FRACTION,
    align: 'center',
  },
  name: {
    span: { x0: 0.1425, x1: 0.9108, y: 0.3456 },
    fontSizeFraction: DEFAULT_FONT_FRACTION,
  },
  fatherName: {
    span: { x0: 0.2006, x1: 0.9108, y: 0.3745 },
    fontSizeFraction: DEFAULT_FONT_FRACTION,
  },
  guardianName: {
    span: { x0: 0.2228, x1: 0.9108, y: 0.4027 },
    fontSizeFraction: DEFAULT_FONT_FRACTION,
  },
  dobFigure: {
    span: { x0: 0.2748, x1: 0.4471, y: 0.4911 },
    fontSizeFraction: DEFAULT_FONT_FRACTION,
  },
  dobWords: {
    spans: [
      { x0: 0.6421, x1: 0.9104, y: 0.4911 },
      { x0: 0.0876, x1: 0.3822, y: 0.5212 },
    ],
    fontSizeFraction: DEFAULT_FONT_FRACTION,
  },
  dateOfAdmission: {
    span: { x0: 0.2433, x1: 0.9108, y: 0.5518 },
    fontSizeFraction: DEFAULT_FONT_FRACTION,
  },
  classAdmitted: {
    span: { x0: 0.2902, x1: 0.9108, y: 0.5796 },
    fontSizeFraction: DEFAULT_FONT_FRACTION,
  },
  classAtLeaving: {
    span: { x0: 0.3188, x1: 0.9108, y: 0.6086 },
    fontSizeFraction: DEFAULT_FONT_FRACTION,
  },
  dateOfLeaving: {
    span: { x0: 0.2203, x1: 0.9096, y: 0.6386 },
    fontSizeFraction: DEFAULT_FONT_FRACTION,
  },
  reasonOfLeaving: {
    span: { x0: 0.2441, x1: 0.5831, y: 0.6687 },
    fontSizeFraction: DEFAULT_FONT_FRACTION,
  },
  remarks: {
    span: { x0: 0.1691, x1: 0.9108, y: 0.6956 },
    fontSizeFraction: DEFAULT_FONT_FRACTION,
  },
  dateOfIssue: {
    span: { x0: 0.0872, x1: 0.2349, y: 0.873 },
    fontSizeFraction: DEFAULT_FONT_FRACTION,
    align: 'center',
  },
};

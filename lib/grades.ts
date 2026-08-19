export const GRADES = [
  'PG',
  'Nur',
  'Prep',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
] as const;

export type Grade = (typeof GRADES)[number];

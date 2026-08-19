const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

const DAY_ORDINALS = [
  '', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth',
  'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth',
  'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth', 'Twentieth', 'Twenty-First',
  'Twenty-Second', 'Twenty-Third', 'Twenty-Fourth', 'Twenty-Fifth', 'Twenty-Sixth',
  'Twenty-Seventh', 'Twenty-Eighth', 'Twenty-Ninth', 'Thirtieth', 'Thirty-First',
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function twoDigitsToWords(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones === 0 ? TENS[tens] : `${TENS[tens]}-${ONES[ones]}`;
}

function threeDigitsToWords(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  if (hundreds === 0) return twoDigitsToWords(rest);
  const hundredsPart = `${ONES[hundreds]} Hundred`;
  if (rest === 0) return hundredsPart;
  return `${hundredsPart} and ${twoDigitsToWords(rest)}`;
}

export function numberToWords(num: number): string {
  if (num === 0) return 'Zero';

  const thousands = Math.floor(num / 1000);
  const remainder = num % 1000;

  if (thousands === 0) return threeDigitsToWords(remainder);

  const thousandsPart = `${threeDigitsToWords(thousands)} Thousand`;
  if (remainder === 0) return thousandsPart;

  const joiner = remainder < 100 ? ' and ' : ' ';
  return `${thousandsPart}${joiner}${threeDigitsToWords(remainder)}`;
}

/**
 * Converts a date to a worded form used on the certificate, e.g.
 * "Fifteenth of March Two Thousand and Fifteen".
 */
export function dateToWords(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  return `${DAY_ORDINALS[day]} of ${MONTH_NAMES[month]} ${numberToWords(year)}`;
}

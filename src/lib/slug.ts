const persianCharMap: Record<string, string> = {
  'ا': 'a',
  'آ': 'a',
  'أ': 'a',
  'إ': 'a',
  'ب': 'b',
  'پ': 'p',
  'ت': 't',
  'ث': 's',
  'ج': 'j',
  'چ': 'ch',
  'ح': 'h',
  'خ': 'kh',
  'د': 'd',
  'ذ': 'z',
  'ر': 'r',
  'ز': 'z',
  'ژ': 'zh',
  'س': 's',
  'ش': 'sh',
  'ص': 's',
  'ض': 'z',
  'ط': 't',
  'ظ': 'z',
  'ع': 'a',
  'غ': 'gh',
  'ف': 'f',
  'ق': 'gh',
  'ک': 'k',
  'ك': 'k',
  'گ': 'g',
  'ل': 'l',
  'م': 'm',
  'ن': 'n',
  'و': 'o',
  'ه': 'h',
  'ة': 'h',
  'ی': 'y',
  'ي': 'y',
  'ئ': 'y',
  'ء': '',
  'ٔ': '',
  '‌': '-',
  ' ': '-',
}

const persianDigits = '۰۱۲۳۴۵۶۷۸۹'
const arabicDigits = '٠١٢٣٤٥٦٧٨٩'

/** Persian/Arabic numerals → ASCII before slugging (e.g. ۴۲ → 42). */
export function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, char => String(persianDigits.indexOf(char)))
    .replace(/[٠-٩]/g, char => String(arabicDigits.indexOf(char)))
}

export function transliteratePersian(value: string) {
  return [...normalizeDigits(value)]
    .map(char => persianCharMap[char] ?? char)
    .join('')
}

export function slugify(value: string) {
  const transliterated = transliteratePersian(value)

  return transliterated
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Stable slug for attribute option lines (Persian label + fallback). */
export function slugifyAttributeValue(value: string, index: number) {
  const slug = slugify(value)
  return slug || `option-${index + 1}`
}

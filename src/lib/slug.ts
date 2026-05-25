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

export function transliteratePersian(value: string) {
  return [...value]
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

import { format, parseISO, startOfDay } from 'date-fns'
import { format as formatJalali } from 'date-fns-jalali'
import { faIR as faIRJalali } from 'date-fns-jalali/locale'

export function formatPersianDate(
  date: Date,
  pattern = 'd MMMM yyyy',
) {
  return formatJalali(date, pattern, { locale: faIRJalali })
}

export function isoDateToTimestamp(iso: string) {
  return startOfDay(parseISO(iso)).getTime()
}

export function timestampToIsoDate(timestamp: number) {
  return format(new Date(timestamp), 'yyyy-MM-dd')
}

export function toFormBirthday(birthday: string | null) {
  return birthday ?? ''
}

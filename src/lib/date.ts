import { format, parseISO, startOfDay } from 'date-fns'

export function isoDateToTimestamp(iso: string) {
  return startOfDay(parseISO(iso)).getTime()
}

export function timestampToIsoDate(timestamp: number) {
  return format(new Date(timestamp), 'yyyy-MM-dd')
}

export function toFormBirthday(birthday: string | null) {
  return birthday ?? ''
}

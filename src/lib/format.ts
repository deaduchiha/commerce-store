export function formatRials(amount: number) {
  return `${new Intl.NumberFormat('fa-IR').format(amount)} ریال`
}

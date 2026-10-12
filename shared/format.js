export function formatUsdc(amount) {
  if (amount == null || Number.isNaN(amount)) return '…'
  return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

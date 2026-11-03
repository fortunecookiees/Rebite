export function rupiah(value) {
  return 'Rp' + Number(value).toLocaleString('id-ID')
}

// pickup_deadline dari MySQL bentuknya "2026-11-03 20:30:00"
function toDate(value) {
  return new Date(value.replace(' ', 'T'))
}

// "20.30"
export function pickupTime(value) {
  return toDate(value).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

// "2 jam lagi" / "45 menit lagi"
export function timeLeft(value) {
  const minutes = Math.round((toDate(value) - new Date()) / 60000)
  if (minutes <= 0) return 'waktu habis'
  if (minutes < 60) return `${minutes} menit lagi`
  return `${Math.floor(minutes / 60)} jam lagi`
}

// Kurang dari 1 jam dianggap mendesak
export function isUrgent(value) {
  return toDate(value) - new Date() < 60 * 60000
}

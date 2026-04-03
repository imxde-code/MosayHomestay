export const MAX_GUESTS = 8
export const PUBLIC_GUEST_OPTIONS = [4, 6, MAX_GUESTS]

export function isGuestCountWithinLimit(value) {
  const numericValue = Number(value)

  return (
    Number.isInteger(numericValue) &&
    numericValue >= 1 &&
    numericValue <= MAX_GUESTS
  )
}

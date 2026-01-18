/**
 * Generates a Swish link for pre-filling the Swish app.
 * For personal numbers (07x), we use the swish://payment scheme.
 * For merchant numbers (123x), the universal link is also an option.
 *
 * @param swishNumber The recipient's Swish number (e.g., "1231234567" or "0701234567")
 * @param amount The total amount to pay
 * @param message The message/reference for the payment
 * @param callbackUrl Optional URL to redirect to after payment (requires HTTPS)
 * @returns A Swish deep link
 */
export function generateSwishLink(
  swishNumber: string,
  amount: number,
  message: string,
  callbackUrl?: string,
): string {
  // Remove any non-digit characters from the swish number
  const cleanNumber = swishNumber.replace(/\D/g, '')

  // For pre-filling private Swish numbers (07x), 'swish://payment' is the way to go.
  // The parameter for the recipient is 'address', not 'payee'.
  let url = `swish://payment?address=${cleanNumber}&amount=${amount}&message=${encodeURIComponent(message)}`

  // Swish app strictly requires HTTPS for callback URLs and will show "invalid url" 
  // if http://localhost is used. During local development, we omit it to avoid the error.
  if (callbackUrl && callbackUrl.startsWith('https://')) {
    url += `&callbackurl=${encodeURIComponent(callbackUrl)}`
  }

  return url
}

export const buildActivationSwishMessage = (shop: {
  _id: string
  slug: string
  name: string
}) => {
  return `QRB-AKT ${shop._id} ${shop.slug} ${shop.name}`
}

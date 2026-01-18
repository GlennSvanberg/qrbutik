/**
 * Generates a Swish deep link for personal accounts.
 * This format is used for "private" Swish payments where we don't use the Merchant API.
 *
 * @param swishNumber The recipient's Swish number (e.g., "1231234567")
 * @param amount The total amount to pay
 * @param message The message/reference for the payment
 * @returns A swish:// deep link URL
 */
export function generateSwishLink(
  swishNumber: string,
  amount: number,
  message: string,
): string {
  const data = {
    v: 1,
    pa: swishNumber,
    am: amount,
    msg: message,
    editable: false,
  }

  const jsonString = JSON.stringify(data)
  const encodedData = encodeURIComponent(jsonString)

  return `swish://payment?data=${encodedData}`
}

export const buildActivationSwishMessage = (shop: {
  _id: string
  slug: string
  name: string
}) => {
  return `QRB-AKT ${shop._id} ${shop.slug} ${shop.name}`
}

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
    v: 1, // version
    pa: swishNumber, // payee
    am: amount, // amount
    msg: message, // message
    editable: false, // amount/message should not be editable if possible
  };

  const jsonString = JSON.stringify(data);
  const encodedData = encodeURIComponent(jsonString);

  return `swish://payment?data=${encodedData}`;
}

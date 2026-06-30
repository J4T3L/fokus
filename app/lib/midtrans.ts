/**
 * Midtrans Payment Gateway utility helper.
 * Uses direct fetch requests to Midtrans REST API so no external client SDK is required.
 */
export async function createMidtransTransaction({
  orderId,
  amount,
  customerName,
  customerEmail,
}: {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
}) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    console.log("Midtrans Server Key is not configured. Falling back to payment simulator.");
    return { token: null, redirect_url: null };
  }

  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const url = isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

  const authString = Buffer.from(serverKey + ":").toString("base64");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          first_name: customerName,
          email: customerEmail,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Midtrans API error response:", data);
      throw new Error(data.error_messages?.[0] || "Failed to create Midtrans transaction");
    }

    return {
      token: data.token || null,
      redirect_url: data.redirect_url || null,
    };
  } catch (error) {
    console.error("Failed to create Midtrans transaction:", error);
    return { token: null, redirect_url: null, error };
  }
}

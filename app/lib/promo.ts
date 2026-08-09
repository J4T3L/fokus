export interface PromoCode {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number; // percentage (e.g. 10 for 10%) or fixed amount (e.g. 50000)
  maxDiscount?: number;
  minSpend?: number;
  description: string;
}

export const AVAILABLE_PROMO_CODES: Record<string, PromoCode> = {
  FOKUS10: {
    code: "FOKUS10",
    type: "PERCENTAGE",
    value: 10,
    maxDiscount: 100000,
    minSpend: 100000,
    description: "Diskon 10% (Maksimal Rp 100.000)",
  },
  PROMO50K: {
    code: "PROMO50K",
    type: "FIXED",
    value: 50000,
    minSpend: 250000,
    description: "Potongan Langsung Rp 50.000 (Min. Transaksi Rp 250.000)",
  },
  WELCOME20: {
    code: "WELCOME20",
    type: "PERCENTAGE",
    value: 20,
    maxDiscount: 150000,
    minSpend: 150000,
    description: "Diskon Selamat Datang 20% (Maksimal Rp 150.000)",
  },
  STUDIO15: {
    code: "STUDIO15",
    type: "PERCENTAGE",
    value: 15,
    maxDiscount: 120000,
    minSpend: 100000,
    description: "Diskon Spesial Studio 15%",
  },
};

export function validatePromoCode(code: string, totalAmount: number) {
  const cleanCode = code.trim().toUpperCase();

  if (!cleanCode) {
    return { valid: false, discountAmount: 0, message: "Kode promo tidak boleh kosong" };
  }

  const promo = AVAILABLE_PROMO_CODES[cleanCode];
  if (!promo) {
    return { valid: false, discountAmount: 0, message: "Kode promo tidak valid atau telah kadaluarsa" };
  }

  if (promo.minSpend && totalAmount < promo.minSpend) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Minimal transaksi untuk kode ini adalah Rp ${promo.minSpend.toLocaleString("id-ID")}`,
    };
  }

  let discount = 0;
  if (promo.type === "PERCENTAGE") {
    discount = Math.round((totalAmount * promo.value) / 100);
    if (promo.maxDiscount && discount > promo.maxDiscount) {
      discount = promo.maxDiscount;
    }
  } else if (promo.type === "FIXED") {
    discount = promo.value;
  }

  if (discount > totalAmount) {
    discount = totalAmount;
  }

  return {
    valid: true,
    discountAmount: discount,
    code: promo.code,
    description: promo.description,
    message: `Kode promo "${promo.code}" berhasil dipasang! Potongan: Rp ${discount.toLocaleString("id-ID")}`,
  };
}

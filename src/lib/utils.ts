import QRCode from "qrcode";

// Generates a standard BLACK-on-WHITE QR code (scannable by all readers including jsQR)
export async function generateQRCode(data: string): Promise<string> {
  try {
    const qr = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000", // pure black modules — required for scanner compatibility
        light: "#ffffff", // pure white background — required for scanner compatibility
      },
      errorCorrectionLevel: "H",
    });
    return qr;
  } catch (error) {
    console.error("QR generation error:", error);
    throw error;
  }
}

export function generateSKU(name: string, category: string): string {
  const n = name.substring(0, 3).toUpperCase().replace(/\s/g, "");
  const c = category.substring(0, 2).toUpperCase().replace(/\s/g, "");
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `${c}-${n}-${num}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}

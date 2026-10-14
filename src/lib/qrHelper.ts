import QRCode from "qrcode";

export async function generateQRDataUrl(text: string): Promise<string> {
  try {
    const url = await QRCode.toDataURL(text, {
      width: 256,
      margin: 1,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    });
    return url;
  } catch (err) {
    console.error("QR Generation error", err);
    return "";
  }
}

// Generate simple SVG Code-128 styled barcode representation for hospital wristbands and paper folders
export function generateBarcodeSvg(code: string): string {
  // Simple clean barcode line pattern based on char codes
  const bars: { width: number; space: number }[] = [];
  for (let i = 0; i < code.length; i++) {
    const charCode = code.charCodeAt(i);
    const w = (charCode % 3) + 1;
    const s = ((charCode * 3) % 3) + 1;
    bars.push({ width: w, space: s });
  }

  let x = 10;
  const rects = bars
    .map((b) => {
      const r = `<rect x="${x}" y="5" width="${b.width * 2}" height="40" fill="#0f172a" />`;
      x += b.width * 2 + b.space * 1.5;
      return r;
    })
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.max(x + 10, 200)} 60" class="w-full h-12">
      ${rects}
      <text x="${(x + 10) / 2}" y="55" font-size="10" font-family="monospace" text-anchor="middle" fill="#475569">${code}</text>
    </svg>
  `;
}

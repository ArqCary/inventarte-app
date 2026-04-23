import QRCode from "qrcode";

export async function generateQRCode(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    width: 300,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
}

export function getQRPayload(sku: string, baseUrl: string): string {
  return `${baseUrl}/inventory/scan/${sku}`;
}
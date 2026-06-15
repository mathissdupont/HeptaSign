import QRCode from "qrcode";

export async function generateQrPng(value: string) {
  return Buffer.from(await QRCode.toBuffer(value, { type: "png", margin: 1, width: 220 }));
}

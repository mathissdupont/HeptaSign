import fs from "fs/promises";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";
import { generateCode128Png } from "@/lib/barcode/barcode";
import { generateQrPng } from "@/lib/qr/qr";

type StampInput = {
  originalPdf: Buffer;
  documentCode: string;
  signerName: string;
  signerRole: string;
  signedAt: Date;
  verificationUrl: string;
};

const approvalText =
  "Bu belge Heptapus İmza Sistemi üzerinden onaylanmış ve doğrulanabilir hale getirilmiştir.";

async function readFont(name: string) {
  return fs.readFile(path.join(process.cwd(), "node_modules", "dejavu-fonts-ttf", "ttf", name));
}

async function readLogo() {
  const candidates = [
    path.join(process.cwd(), "public", "logo.png"),
    path.join(process.cwd(), "logo.png")
  ];

  for (const candidate of candidates) {
    try {
      return await fs.readFile(candidate);
    } catch {
      // Try the next location.
    }
  }

  return null;
}

function stampPageQr(args: {
  page: ReturnType<PDFDocument["getPages"]>[number];
  qrImage: Awaited<ReturnType<PDFDocument["embedPng"]>>;
  logoImage: Awaited<ReturnType<PDFDocument["embedPng"]>> | null;
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>;
}) {
  const { page, qrImage, logoImage, font } = args;
  const { width, height } = page.getSize();
  const qrSize = 58;
  const margin = 18;
  const x = width - qrSize - margin;
  const y = height - qrSize - margin;

  page.drawRectangle({
    x: x - 4,
    y: y - 18,
    width: qrSize + 8,
    height: qrSize + 22,
    color: rgb(1, 1, 1),
    opacity: 0.92
  });

  page.drawImage(qrImage, { x, y, width: qrSize, height: qrSize });
  if (logoImage) {
    const logoSize = 15;
    const logoX = x + qrSize / 2 - logoSize / 2;
    const logoY = y + qrSize / 2 - logoSize / 2;
    page.drawRectangle({
      x: logoX - 2,
      y: logoY - 2,
      width: logoSize + 4,
      height: logoSize + 4,
      color: rgb(1, 1, 1),
      opacity: 0.96
    });
    page.drawImage(logoImage, { x: logoX, y: logoY, width: logoSize, height: logoSize });
  }
  page.drawText("Doğrula", {
    x: x + 11,
    y: y - 11,
    font,
    size: 6.5,
    color: rgb(0.08, 0.28, 0.26)
  });
}

export async function stampSignedPdf(input: StampInput) {
  const pdf = await PDFDocument.load(input.originalPdf);
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(await readFont("DejaVuSans.ttf"));
  const bold = await pdf.embedFont(await readFont("DejaVuSans-Bold.ttf"));
  const qrImage = await pdf.embedPng(await generateQrPng(input.verificationUrl));
  const logoBytes = await readLogo();
  const logoImage = logoBytes ? await pdf.embedPng(logoBytes) : null;
  const barcodeImage = await pdf.embedPng(await generateCode128Png(input.documentCode));

  for (const existingPage of pdf.getPages()) {
    stampPageQr({ page: existingPage, qrImage, logoImage, font });
  }

  const page = pdf.addPage();
  const { width, height } = page.getSize();
  const margin = 48;
  const titleY = height - 72;
  const labelX = margin;
  const valueX = 170;

  page.drawText("HEPTAPUS İMZA SİSTEMİ", {
    x: margin,
    y: titleY,
    font: bold,
    size: 18,
    color: rgb(0.06, 0.28, 0.26)
  });

  page.drawText(approvalText, {
    x: margin,
    y: titleY - 32,
    font,
    size: 10.5,
    color: rgb(0.12, 0.16, 0.2)
  });

  const rows = [
    ["Document Code", input.documentCode],
    ["Signer", input.signerName],
    ["Role", input.signerRole],
    ["Signed At", input.signedAt.toISOString()],
    ["Verification URL", input.verificationUrl]
  ];

  let y = titleY - 84;
  for (const [label, value] of rows) {
    page.drawText(label, { x: labelX, y, font: bold, size: 10, color: rgb(0.2, 0.24, 0.29) });
    page.drawText(value, {
      x: valueX,
      y,
      font,
      size: 10,
      color: rgb(0.12, 0.16, 0.2),
      maxWidth: width - valueX - margin
    });
    y -= 24;
  }

  page.drawImage(qrImage, {
    x: margin,
    y: 96,
    width: 140,
    height: 140
  });
  if (logoImage) {
    page.drawRectangle({
      x: margin + 52,
      y: 148,
      width: 36,
      height: 36,
      color: rgb(1, 1, 1),
      opacity: 0.96
    });
    page.drawImage(logoImage, {
      x: margin + 56,
      y: 152,
      width: 28,
      height: 28
    });
  }

  page.drawImage(barcodeImage, {
    x: 220,
    y: 122,
    width: width - 268,
    height: 82
  });

  page.drawText("QR token ile veya belge kodu ile doğrulanabilir.", {
    x: margin,
    y: 62,
    font,
    size: 10,
    color: rgb(0.38, 0.44, 0.5)
  });

  return Buffer.from(await pdf.save());
}

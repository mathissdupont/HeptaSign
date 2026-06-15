import bwipjs from "bwip-js/node";

export async function generateCode128Png(value: string) {
  return bwipjs.toBuffer({
    bcid: "code128",
    text: value,
    scale: 2,
    height: 12,
    includetext: true,
    textxalign: "center"
  });
}

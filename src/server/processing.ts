import { openai } from "@/lib/openai";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import crypto from "crypto";
// @ts-expect-error - pdf-parse has no types or ESM export
import pdf from "pdf-parse";

// Mock Vision client if no credentials provided
export const visionClient = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? new ImageAnnotatorClient()
  : null;

export interface ExtractedTransaction {
  date: string;
  isin: string | null;
  symbol: string | null;
  type: "buy" | "sell";
  amount: number;
  currency: string;
  broker: string;
  assetType: "stock" | "etf" | "bond";
}

export async function processStatement(fileBuffer: Buffer, fileName: string): Promise<ExtractedTransaction[]> {
  if (!openai) {
    throw new Error("OpenAI API key missing");
  }

  let textContent = "";
  if (fileName.toLowerCase().endsWith(".pdf")) {
    const data = await pdf(fileBuffer);
    textContent = data.text;
  } else {
    textContent = "IMAGE_CONTENT_PENDING_OCR";
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a financial expert specializing in Belgian TOB.
        Extract all transactions from the following broker statement text.
        Return the data as a JSON array of objects.`
      },
      {
        role: "user",
        content: `Extract transactions from this text:\n\n${textContent}`
      },
    ],
    response_format: { type: "json_object" },
  });

  const rawData = JSON.parse(response.choices[0].message.content || '{"transactions": []}');
  return rawData.transactions;
}

export function calculateTOB(tx: ExtractedTransaction): { rate: number; tax: number } {
  let rate = 0.0035;
  let cap = 1600;

  if (tx.assetType === "etf") {
    rate = 0.0132;
    cap = 4000;
  } else if (tx.assetType === "bond") {
    rate = 0.0012;
    cap = 1300;
  }

  let tax = tx.amount * rate;
  if (tax > cap) tax = cap;

  return { rate, tax };
}

export function generateTransactionHash(tx: ExtractedTransaction): string {
  const data = `${tx.broker}-${tx.date}-${tx.isin}-${tx.type}-${tx.amount.toFixed(2)}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

import { db } from "@/db";
import { transactions, statements } from "@/db/schema";
import { processStatement, calculateTOB, generateTransactionHash } from "@/server/processing";
import { eq } from "drizzle-orm";

export async function handleFileUpload(userId: string, fileName: string, fileBuffer: Buffer) {
  // 1. Create statement record
  const [statement] = await db.insert(statements).values({
    userId,
    fileName,
    status: "processing",
  }).returning();

  try {
    // 2. Process with AI
    const extractedTxs = await processStatement(fileBuffer, fileName);

    // 3. Save transactions
    for (const tx of extractedTxs) {
      const { rate, tax } = calculateTOB(tx);
      const hash = generateTransactionHash(tx);

      // Simple deduplication check
      const existing = await db.query.transactions.findFirst({
        where: eq(transactions.hash, hash),
      });

      if (!existing) {
        await db.insert(transactions).values({
          userId,
          statementId: statement.id,
          date: new Date(tx.date),
          isin: tx.isin,
          symbol: tx.symbol,
          type: tx.type,
          amount: tx.amount.toString(),
          currency: tx.currency,
          tobTax: tax.toString(),
          tobRate: rate.toString(),
          hash,
        });
      }
    }

    // 4. Update statement status
    await db.update(statements)
      .set({ status: "completed" })
      .where(eq(statements.id, statement.id));

  } catch (error) {
    console.error("Failed to process statement:", error);
    await db.update(statements)
      .set({ status: "error" })
      .where(eq(statements.id, statement.id));
    throw error;
  }
}

import { db } from "@/db";
import { user, statements, transactions, declarations } from "@/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";

export async function wipeUserData(userId: string) {
  // 1. Delete associated transactions
  await db.delete(transactions).where(eq(transactions.userId, userId));

  // 2. Delete associated declarations
  await db.delete(declarations).where(eq(declarations.userId, userId));

  // 3. Delete statements and files
  const userStatements = await db.select().from(statements).where(eq(statements.userId, userId));
  for (const s of userStatements) {
    if (s.filePath && fs.existsSync(s.filePath)) {
      fs.unlinkSync(s.filePath);
    }
  }
  await db.delete(statements).where(eq(statements.userId, userId));

  // 4. Delete user (optional, depending on if they want to keep account)
  // await db.delete(user).where(eq(user.id, userId));
}

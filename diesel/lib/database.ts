import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import * as jwt from "jsonwebtoken";
import { users } from "./schema";
import { eq } from "drizzle-orm";

dotenv.config();

// for query purposes
const queryClient = postgres(process.env.PG_URL!);
export const db = drizzle(queryClient);

export function getToken(userId: number): string {
  return jwt.sign(
    {
      userId: userId,
    },
    process.env.JWT_SECRET!,
    { algorithm: "HS512" },
  );
}

export function getUserId(token: string): number | boolean {
  var unsigned;

  try {
    unsigned = jwt.verify(token, process.env.JWT_SECRET!, {
      algorithms: ["HS512"],
    }) as jwt.JwtPayload;
  } catch (err) {
    return false;
  }

  return Number(unsigned.userId);
}

export async function getUser(token: string): Promise<
  | {
      id: number;
      username: string;
      display_name: string | null;
      password: string;
      avatar: string | null;
      banner: string | null;
      bio: string | null;
    }
  | boolean
> {
  const userId = getUserId(token);

  if (userId === false) {
    return false;
  }

  const cand = await db
    .select()
    .from(users)
    .where(eq(users.id, userId as number));

  if (cand.length === 0) {
    return false;
  }

  return cand[0];
}

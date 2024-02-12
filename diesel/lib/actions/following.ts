"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db, getUser } from "~/database";
import { follows } from "~/schema";
import { eq, and } from "drizzle-orm";

export async function followAction(user: { id: number }) {
  "use server";

  const currentUser = await getUser(cookies().get("USER_TOKEN")!.value);

  if (currentUser === false || currentUser === true) {
    cookies().delete("USER_TOKEN");
    redirect("/login");
  }

  const isFollowing = await (async (currentUser: any) => {
    const a = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.origin_user_id, currentUser.id),
          eq(follows.target_user_id, user.id),
        ),
      );
    return a.length === 1;
  })(currentUser);

  if (isFollowing) {
    return false;
  }

  await db.insert(follows).values({
    origin_user_id: currentUser.id,
    target_user_id: user.id,
  });
}

export async function unfollowAction(user: { id: number }) {
  "use server";

  const currentUser = await getUser(cookies().get("USER_TOKEN")!.value);

  if (currentUser === false || currentUser === true) {
    cookies().delete("USER_TOKEN");
    redirect("/login");
  }

  const isFollowing = await (async (currentUser: any) => {
    const a = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.origin_user_id, currentUser.id),
          eq(follows.target_user_id, user.id),
        ),
      );
    return a.length === 1;
  })(currentUser);

  if (!isFollowing) {
    return false;
  }

  await db.insert(follows).values({
    origin_user_id: currentUser.id,
    target_user_id: user.id,
  });
}

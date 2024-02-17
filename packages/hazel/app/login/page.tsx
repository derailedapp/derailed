import { eq } from "drizzle-orm";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db, getToken } from "~/database";
import { users } from "~/schema";
import argon2 from "argon2";

import { registerForm } from "~/zschema";

export const metadata: Metadata = {
  title: "Login - Derailed",
  description: "Sign back into your Derailed account!",
};

export default async function Login() {
  if (cookies().get("USER_TOKEN") !== undefined) {
    redirect("/");
  }

  async function login(formData: FormData) {
    "use server";

    try {
      await registerForm.safeParseAsync({
        username: formData.get("username")?.toString(),
        password: formData.get("password")?.toString(),
      });
    } catch (err) {
      throw Error("bad data");
    }

    const usrs = await db
      .select()
      .from(users)
      .where(eq(users.username, formData.get("username")!.toString()));
    const user = usrs.pop();

    if (!user) {
      throw Error("invalid login credentials");
    }

    const valid = await argon2.verify(
      user.password,
      formData.get("password")!.toString(),
    );

    if (!valid) {
      throw Error("invalid login credentials");
    }

    cookies().set("USER_TOKEN", getToken(user.id), { httpOnly: true });
    redirect(`/@${user.username}`);
  }

  return (
    <main className="bg-gradient-to-br from-blurple to-[#0A1628] background-animate flex justify-center min-h-screen">
      <form
        action={login}
        className="flex flex-col text-center gap-5 p-10 m-auto justify-center justify-items-center bg-not-quite-black rounded-md"
      >
        <h1 className="text-transparent bg-clip-text bg-gradient-to-l from-blurple to-dark-blurple background-animate font-bold text-3xl pb-5">
          Welcome back to Derailed
        </h1>
        <section className="flex flex-col gap-1.5">
          <h2 className="text-left text-white/60 font-medium">USERNAME</h2>
          <input
            name="username"
            type="text"
            size={32}
            placeholder="SpaceRanger69"
            required
            className="bg-kinda-black rounded-md text-white/60 text-xl p-2.5 outline-none font-extralight"
            autoComplete="username"
          />
        </section>
        <section className="flex flex-col gap-1.5">
          <h2 className="text-left text-white/60 font-medium">PASSWORD</h2>
          <input
            name="password"
            type="password"
            size={32}
            placeholder="ILikeYourMom@69"
            required
            className="bg-kinda-black rounded-md text-white/60 text-xl p-2.5 outline-none font-extralight"
          />
        </section>
        <section className="flex flex-col gap-2.5">
          <button
            type="submit"
            className="mt-5 text-2xl font-light text-center text-white bg-blurple rounded-md m-auto py-3 w-full"
          >
            Login
          </button>
          <a
            href="/register"
            className="text-blurple text-left font-light max-w-sm text-sm"
          >
            Don&apos;t have an account?
          </a>
        </section>
      </form>
    </main>
  );
}

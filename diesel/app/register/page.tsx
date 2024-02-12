import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db, getToken } from "~/database";
import { userSettings, users } from "~/schema";
import argon2 from "argon2";

import { registerForm } from "~/zschema";

export const metadata: Metadata = {
  title: "Register - Derailed",
  description: "Create a new Derailed account!",
};

export default async function Register() {
  if (cookies().get("USER_TOKEN") !== undefined) {
    redirect("/");
  }

  async function register(formData: FormData) {
    "use server";

    try {
      await registerForm.safeParseAsync({
        username: formData.get("username")?.toString(),
        password: formData.get("password")?.toString(),
      });
    } catch (err) {
      throw Error("bad data");
    }

    const userId = createSnowflake();

    try {
      await db.transaction(async (tx) => {
        await tx.insert(users).values({
          id: userId,
          username: formData.get("username")!.toString(),
          password: await argon2.hash(formData.get("password")!.toString()),
        });
        await tx.insert(userSettings).values({
          user_id: userId,
          theme: "dark",
          status: 1,
        });
      });
    } catch (_) {
      throw Error("Username already taken");
    }

    cookies().set("USER_TOKEN", getToken(userId), { httpOnly: true });
    redirect(`/@${formData.get("username")!.toString()}`);
  }

  return (
    <main className="bg-gradient-to-br from-blurple to-[#0A1628] background-animate flex justify-center min-h-screen">
      <form
        action={register}
        className="flex flex-col text-center gap-5 p-10 m-auto justify-center justify-items-center bg-not-quite-black rounded-md"
      >
        <h1 className="text-transparent bg-clip-text bg-gradient-to-l from-blurple to-dark-blurple background-animate font-bold text-3xl pb-5">
          Welcome to Derailed
        </h1>
        <section className="flex flex-col gap-1.5">
          <h2 className="text-left text-white/60 font-medium">USERNAME</h2>
          <input
            name="username"
            type="text"
            size={32}
            placeholder="SpaceRanger69"
            minLength={3}
            maxLength={32}
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
            minLength={10}
            maxLength={100}
            required
            className="bg-kinda-black rounded-md text-white/60 text-xl p-2.5 outline-none font-extralight"
          />
        </section>
        <section className="flex flex-col gap-2.5">
          <button
            type="submit"
            className="mt-5 text-2xl font-light text-center text-white bg-blurple rounded-md m-auto py-3 w-full"
          >
            Register
          </button>
          <a
            href="/login"
            className="text-blurple text-left font-light max-w-sm text-sm"
          >
            Already have an account?
          </a>
        </section>

        <h3 className="text-white/60 font-light max-w-md text-xs mt-2.5">
          By registering you agree to Derailed&apos;s{" "}
          <a className="text-blurple" href="/terms">
            Terms of Service
          </a>{" "}
          and{" "}
          <a className="text-blurple" href="/privacy">
            Privacy Policy
          </a>
          .
        </h3>
      </form>
    </main>
  );
}

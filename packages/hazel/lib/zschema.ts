import "server-only";

import { z } from "zod";

export const registerForm = z.object({
  username: z
    .string()
    .min(3, "Username is lesser than 3 characters")
    .max(32, "Username is greater than 32 characters")
    .regex(RegExp("/^[a-z0-32]+(?:[._][a-z0-32]+)*$/"))
    .toLowerCase(),
  password: z
    .string()
    .min(10, "Password is lesser than 10 characters")
    .max(100, "Password is greater than 100 characters")
    .regex(RegExp("/^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@#$%^&*]).{10,100}$/")),
});

"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = { error: string } | null;

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
    return null;
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    throw error;
  }
}

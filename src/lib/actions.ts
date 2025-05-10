"use server";

import { hashSync } from "bcrypt-ts";
import { prisma } from "@/lib/prisma";
import { RegisterSchema, SignInSchema } from "./zod";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
// register action
export const signUpCredentials = async (prevState: unknown, formData: FormData) => {
  const validateFields = RegisterSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validateFields.success) {
    return {
      error: validateFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validateFields.data;
  const hashPassword = hashSync(password, 10);

  try {
    await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashPassword,
      },
    });
  } catch (error) {
    return { message: "Failed to Register" };
  }
  redirect("/login");
};

//sign in credential action
export const signInCredentials = async (prevState: unknown, formData: FormData) => {
  const validateFields = SignInSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validateFields.success) {
    return {
      error: validateFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validateFields.data;
  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.message) {
        case "CredentialsSignIn":
          return { message: "invalid credentials" };
        default:
          return { message: "something went wrong" };
      }
    }
    throw error;
  }
};

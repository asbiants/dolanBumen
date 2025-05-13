"use server";

import { hashSync } from "bcrypt-ts";
import { prisma } from "@/lib/prisma";
import { RegisterSchema, SignInSchema } from "./zod";
import { redirect } from "next/navigation";

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
    // TODO: Implement your own authentication logic here
    // For now, just redirect to dashboard
    redirect("/dashboard");
  } catch (error) {
    return { message: "Invalid credentials" };
  }
};

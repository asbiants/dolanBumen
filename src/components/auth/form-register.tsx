"use client";
import React, { useActionState } from "react";
import Link from "next/link";
import { signUpCredentials } from "@/lib/actions";
import { RegisterButton } from "@/components/button";

const FormRegister = () => {
  const [state, formAction] = useActionState(signUpCredentials, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.message ? (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-100">
          <span className="font-medium">{state?.message}</span>
        </div>
      ) : null}
      <div>
        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
          Name
        </label>
        <input type="text" placeholder="Asbian Tunggul" name="name" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg w-full p-2.5"></input>
        <div arial-live="polite" aria-atomic="true">
          <span className="text-sm text-red-500 mt-2">{state?.error?.name}</span>
        </div>
      </div>
      <div>
        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
          Email
        </label>
        <input type="email" name="email" placeholder="asbiansyh@mail.com" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg w-full p-2.5"></input>
        <div arial-live="polite" aria-atomic="true">
          <span className="text-sm text-red-500 mt-2">{state?.error?.email}</span>
        </div>
      </div>
      <div>
        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
          Password
        </label>
        <input type="password" placeholder="************" name="password" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg w-full p-2.5"></input>
        <div arial-live="polite" aria-atomic="true">
          <span className="text-sm text-red-500 mt-2">{state?.error?.password}</span>
        </div>
      </div>
      <div>
        <label htmlFor="ConfirmPassword" className="block mb-2 text-sm font-medium text-gray-900">
          Confirm Password
        </label>
        <input type="password" name="ConfirmPassword" placeholder="************" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg w-full p-2.5"></input>
        <div arial-live="polite" aria-atomic="true">
          <span className="text-sm text-red-500 mt-2">{state?.error?.ConfirmPassword}</span>
        </div>
      </div>
      <RegisterButton />
      <p className="text-sm font-light text-grey-500">
        Alredy have an account?
        <Link href="/login">
          <span className="font-medium pl-1 text-blue-600 hover:text-blue-800">Sign In</span>
        </Link>
      </p>
    </form>
  );
};

export default FormRegister;

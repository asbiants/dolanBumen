"use client";
import { useFormStatus } from "react-dom";

export const RegisterButton = () => {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="w-full text-white bg-yellow-500 font-medium rounded-lg px-5 py-2.5 text-center uppercase hover:bg-yellow-600">
      {pending ? "Registering..." : "Register"}
    </button>
  );
};

export const LoginButton = () => {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="w-full text-white bg-yellow-500 font-medium rounded-lg px-5 py-2.5 text-center uppercase hover:bg-yellow-600">
      {pending ? "Authenticating..." : "Sign In"}
    </button>
  );
};

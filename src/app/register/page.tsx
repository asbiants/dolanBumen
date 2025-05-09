"use client";
import axios from "axios";
import { useState, SyntheticEvent } from "react";
import { useRouter } from "next/navigation";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleRegister = async (e: SyntheticEvent) => {
    e.preventDefault();
    await axios.post("/api/register", {
      name: name,
      email: email,
      password: password,
    });
    setName("");
    setEmail("");
    setPassword("");
    router.refresh();
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md shadow-xl bg-base-100 p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <form onSubmit={handleRegister}>
          <div className="form-control w-full mb-4">
            <label className="label font-bold">Nama</label>
            <input type="text" className="input input-bordered" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-control w-full mb-4">
            <label className="label font-bold">Email</label>
            <input type="email" className="input input-bordered" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-control w-full mb-6">
            <label className="label font-bold">Password</label>
            <input type="password" className="input input-bordered" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="flex justify-between gap-4">
            <button type="button" className="btn btn-outline w-1/2">
              Close
            </button>
            <button type="submit" className="btn btn-primary w-1/2">
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;

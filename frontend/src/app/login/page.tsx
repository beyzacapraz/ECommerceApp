"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password, username, is_admin: isAdmin })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      router.push("/");
    } else {
      setError(data.error || "Login failed");
    }

  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className="text-xl font-bold mb-4">Login</h2>

        <input 
          className={styles.input}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input 
          className={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex gap-4 my-2">
          <label>
            <input
              type="radio"
              value="false"
              checked={!isAdmin}
              onChange={() => setIsAdmin(false)}
            />
            <span className="ml-1">User</span>
          </label>
          <label>
            <input
              type="radio"
              value="true"
              checked={isAdmin}
              onChange={() => setIsAdmin(true)}
            />
            <span className="ml-1">Admin</span>
          </label>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className={styles.button}>Login</button>
      </form>
    </div>
  );
}

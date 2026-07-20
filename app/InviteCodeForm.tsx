"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export function InviteCodeForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const code = String(formData.get("code") ?? "").trim();

    if (!code) {
      setMessage("Enter the code your church shared with you.");
      return;
    }

    router.push(`/board/${encodeURIComponent(code)}`);
  }

  return (
    <>
      <form className={styles.codeEntry} onSubmit={handleSubmit}>
        <input
          type="text"
          name="code"
          placeholder="Have an invite code?"
          aria-label="Invite code"
        />
        <button type="submit">Go to board</button>
      </form>
      <p className={styles.codeMsg}>{message}</p>
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export function InviteCodeForm({
  variant = "dark",
}: {
  variant?: "dark" | "light";
}) {
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

  const formClass =
    variant === "light" ? styles.codeEntryLight : styles.codeEntry;
  const msgClass = variant === "light" ? styles.codeMsgLight : styles.codeMsg;

  return (
    <>
      <form className={formClass} onSubmit={handleSubmit}>
        <input
          type="text"
          name="code"
          placeholder={variant === "light" ? "Enter code" : "Have an invite code?"}
          aria-label="Invite code"
        />
        <button type="submit">Go to board</button>
      </form>
      <p className={msgClass}>{message}</p>
    </>
  );
}

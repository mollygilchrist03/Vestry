"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
      <div className={`${styles.wrap} ${styles.navInner}`}>
        <Link href="/" className={styles.navBrand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Vestry.svg" alt="" className={styles.navMark} />
          Vestry
        </Link>
        <div className={styles.navLinks}>
          <a href="#how-it-works">How it works</a>
          <a href="#for-you">For your church</a>
          <a href="#privacy">Privacy</a>
          <Link href="/login">Sign in</Link>
        </div>
        <Link href="/login" className={styles.navCta}>
          Start your board
        </Link>
      </div>
    </nav>
  );
}

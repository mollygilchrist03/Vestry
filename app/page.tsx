import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import Link from "next/link";
import styles from "./page.module.css";
import { InviteCodeForm } from "./InviteCodeForm";
import { NavBar } from "./NavBar";
import { Reveal } from "./Reveal";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Vestry",
};

export default function Home() {
  return (
    <div className={`${styles.page} ${fraunces.variable}`}>
      <NavBar />

      <main id="top">
        <section className={`${styles.hero} ${styles.wrap}`}>
          <div className={styles.archPanel}>
            <span className={styles.eyebrow}>A quiet way to ask</span>
            <h1>The question you&apos;ve never asked out loud.</h1>
            <p className={styles.sub}>
              Vestry gives your congregation a private way to ask you
              anything — a verse, a doubt, a question they&apos;ve been too
              nervous to bring up in person. Named or anonymous. Their
              choice.
            </p>
            <div className={styles.heroActions}>
              <Link href="/login" className={styles.btnPrimary}>
                Create your church&apos;s board
              </Link>
              <a href="#how-it-works" className={styles.btnGhost}>
                See how it works
              </a>
            </div>
            <p className={styles.heroNote}>
              Free to start · No credit card · Set up in under five minutes
            </p>
          </div>
        </section>

        <section className={`${styles.inviteBar} ${styles.wrap}`}>
          <Reveal className={styles.inviteBarCard}>
            <span className={styles.inviteBarLabel}>
              Already have an invite code?
            </span>
            <InviteCodeForm variant="light" />
          </Reveal>
        </section>

        <section className={styles.story}>
          <Reveal className={`${styles.wrap} ${styles.storyInner}`}>
            <blockquote>
              &quot;I&apos;ve had the same question about a verse for three
              years. I just never found the right moment to ask it out
              loud.&quot;
            </blockquote>
            <cite>Why we built Vestry</cite>
          </Reveal>
        </section>

        <section className={`${styles.section} ${styles.wrap}`} id="how-it-works">
          <Reveal className={styles.sectionHead}>
            <h2>Set up in four steps</h2>
            <div className={styles.brandDivider}>
              <span className={styles.line} />
              <span className={styles.dot} />
              <span className={styles.line} />
            </div>
            <p>
              From sign-up to your first question, most pastors are live
              before Sunday.
            </p>
          </Reveal>
          <Reveal className={styles.steps} delay={100}>
            <div className={styles.step}>
              <span className={styles.num}>01</span>
              <h3>Create your board</h3>
              <p>Sign in with Google and name your church. Takes about a minute.</p>
            </div>
            <div className={styles.step}>
              <span className={styles.num}>02</span>
              <h3>Share your invite code</h3>
              <p>Post it in the bulletin, your group chat, or Sunday announcements.</p>
            </div>
            <div className={styles.step}>
              <span className={styles.num}>03</span>
              <h3>Members ask freely</h3>
              <p>Named or anonymous. No account, no app to download.</p>
            </div>
            <div className={styles.step}>
              <span className={styles.num}>04</span>
              <h3>You reply</h3>
              <p>Publicly to the whole board, or privately — always your call.</p>
            </div>
          </Reveal>
        </section>

        <section className={`${styles.section} ${styles.wrap}`} id="for-you">
          <Reveal className={styles.sectionHead}>
            <h2>Built around two people</h2>
            <div className={styles.brandDivider}>
              <span className={styles.line} />
              <span className={styles.dot} />
              <span className={styles.line} />
            </div>
            <p>A pastor with limited time, and a member who almost didn&apos;t ask.</p>
          </Reveal>
          <Reveal className={styles.split} delay={100}>
            <div className={styles.splitCard}>
              <span className={styles.tag}>For pastors</span>
              <h3>One board, every question in one place</h3>
              <p>Stop losing questions in texts and hallway conversations. See what your congregation is actually wondering about.</p>
              <ul>
                <li>Dashboard sorted by new, answered, and pending</li>
                <li>Hide or delete anything that needs moderation</li>
                <li>Flag sensitive threads for a closer follow-up</li>
                <li>Free to start, no setup fee</li>
              </ul>
            </div>
            <div className={styles.splitCard}>
              <span className={styles.tag}>For your congregation</span>
              <h3>Ask without the awkward moment</h3>
              <p>Some questions are easier to type than to say out loud after service. Now there&apos;s a place for both.</p>
              <ul>
                <li>Type a question in under a minute, no account</li>
                <li>Save your private link to check for a reply</li>
                <li>Reveal your name later, only if you want to</li>
                <li>Browse what others have already asked</li>
              </ul>
            </div>
          </Reveal>
        </section>

        <section className={`${styles.section} ${styles.wrap}`}>
          <Reveal className={styles.sectionHead}>
            <h2>Everything a board needs, nothing it doesn&apos;t</h2>
            <div className={styles.brandDivider}>
              <span className={styles.line} />
              <span className={styles.dot} />
              <span className={styles.line} />
            </div>
          </Reveal>
          <Reveal className={styles.features} delay={100}>
            <div className={styles.feature}>
              <h3>No account needed</h3>
              <p>Congregation members ask straight from the invite link — no sign-up, no password to remember.</p>
            </div>
            <div className={styles.feature}>
              <h3>True anonymity</h3>
              <p>If a name isn&apos;t given, nothing is stored. Not a device, not a session, not an IP.</p>
            </div>
            <div className={styles.feature}>
              <h3>Public or private replies</h3>
              <p>Turn a good question into something the whole church learns from, or keep it between the two of you.</p>
            </div>
            <div className={styles.feature}>
              <h3>A living FAQ</h3>
              <p>Public answers stay on the board, building a resource for the next person with the same question.</p>
            </div>
            <div className={styles.feature}>
              <h3>Invite your staff</h3>
              <p>Add associate pastors as moderators with the same reply and moderation permissions.</p>
            </div>
            <div className={styles.feature}>
              <h3>Built for every screen</h3>
              <p>Just as easy from the back pew on a phone as from a laptop at your desk.</p>
            </div>
          </Reveal>
        </section>

        <section className={styles.privacy} id="privacy">
          <Reveal className={`${styles.wrap} ${styles.privacyGrid}`}>
            <div>
              <h2>Anonymous means anonymous</h2>
              <p>
                Not &quot;hidden from other members.&quot; Not &quot;visible
                to the pastor only.&quot; If someone doesn&apos;t type a
                name, we never ask for one — and there&apos;s nothing behind
                the scenes tying that question back to a person.
              </p>
            </div>
            <div className={styles.privacyList}>
              <div className={styles.privacyItem}>
                <span className={styles.mark}>1</span>
                <div>
                  <h4>No account, no identity</h4>
                  <p>A name is just text on one post — never linked to a device, session, or login.</p>
                </div>
              </div>
              <div className={styles.privacyItem}>
                <span className={styles.mark}>2</span>
                <div>
                  <h4>A private link, not a login</h4>
                  <p>After posting, you get a unique link to check for a reply. Lose it, and the thread is unreachable — by design.</p>
                </div>
              </div>
              <div className={styles.privacyItem}>
                <span className={styles.mark}>3</span>
                <div>
                  <h4>Reveal on your terms</h4>
                  <p>Choose to share who you are, later, only within your own thread — never on the public board.</p>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section className={`${styles.cta} ${styles.wrap}`} id="get-started">
          <Reveal className={styles.ctaPanel}>
            <h2>Give your congregation a place to ask.</h2>
            <p>Set up your church&apos;s board in a few minutes. Free to start.</p>
            <Link href="/login" className={styles.btnPrimary}>
              Create your church&apos;s board
            </Link>
            <InviteCodeForm />
          </Reveal>
        </section>
      </main>

      <footer>
        <div className={`${styles.wrap} ${styles.footerInner}`}>
          <span className={styles.footerBrand}>Vestry</span>
          <div className={styles.footerLinks}>
            <a href="#how-it-works">How it works</a>
            <a href="#privacy">Privacy</a>
            <a href="#for-you">For your church</a>
          </div>
          <span className={styles.footerCopy}>
            Faithful conversations. Stronger together.
          </span>
        </div>
      </footer>
    </div>
  );
}

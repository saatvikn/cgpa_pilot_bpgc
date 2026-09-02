import Link from "next/link";

import styles from "./page.module.css";

export default function HomePage() {
    return (
        <main className={styles.main}>
            <section className={styles.hero}>
                <p className={styles.eyebrow}>
                    CGPA Pilot BPGC
                </p>

                <h1 className={styles.title}>
                    Your BITS Goa academic record, simplified.
                </h1>

                <p className={styles.subtitle}>
                    Save your semesters, track grades, and calculate
                    your SGPA and CGPA.
                </p>

                <div className={styles.actions}>
                    <Link
                        className={styles.primaryLink}
                        href="/register"
                    >
                        Create account
                    </Link>

                    <Link
                        className={styles.secondaryLink}
                        href="/login"
                    >
                        Log in
                    </Link>
                </div>

                <div className={styles.featureGrid}>
                    <article className={styles.featureCard}>
                        <p className={styles.featureNumber}>01</p>
                        <h2>Save your progress</h2>
                        <p>
                            Your semesters, courses, and grades remain
                            available when you return.
                        </p>
                    </article>

                    <article className={styles.featureCard}>
                        <p className={styles.featureNumber}>02</p>
                        <h2>Weighted GPA</h2>
                        <p>
                            SGPA and CGPA are calculated using course
                            credits, not simple averages.
                        </p>
                    </article>

                    <article className={styles.featureCard}>
                        <p className={styles.featureNumber}>03</p>
                        <h2>BITS Goa courses</h2>
                        <p>
                            Search the verified course catalogue by
                            course code or title.
                        </p>
                    </article>
                </div>
            </section>
        </main>
    );
}
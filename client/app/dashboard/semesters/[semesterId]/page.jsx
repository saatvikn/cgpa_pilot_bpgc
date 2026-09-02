"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    useParams,
    useRouter,
} from "next/navigation";

import { apiRequest } from "@/lib/api";
import styles from "./semester.module.css";

export default function SemesterDetailsPage() {
    const router = useRouter();
    const { semesterId } = useParams();

    const [semester, setSemester] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isActive = true;

        async function loadSemester() {
            try {
                const data = await apiRequest(
                    `/api/semesters/${semesterId}`
                );

                if (isActive) {
                    setSemester(data.semester);
                }
            } catch (requestError) {
                if (!isActive) {
                    return;
                }

                if (requestError.status === 401) {
                    router.replace("/login");
                    return;
                }

                setError(requestError.message);
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        }

        loadSemester();

        return () => {
            isActive = false;
        };
    }, [router, semesterId]);

    if (isLoading) {
        return (
            <main className={styles.page}>
                <p className={styles.statusCard}>
                    Loading semester...
                </p>
            </main>
        );
    }

    if (error) {
        return (
            <main className={styles.page}>
                <div className={styles.container}>
                    <Link
                        className={styles.backLink}
                        href="/dashboard"
                    >
                        &lt; Back to dashboard
                    </Link>

                    <section className={styles.errorCard}>
                        <h1>Could not load semester</h1>
                        <p role="alert">{error}</p>
                    </section>
                </div>
            </main>
        );
    }

    if (!semester) {
        return null;
    }

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <Link
                    className={styles.backLink}
                    href="/dashboard"
                >
                    &lt; Back to dashboard
                </Link>

                <header className={styles.header}>
                    <p className={styles.eyebrow}>
                        Semester {semester.semesterOrder}
                    </p>

                    <h1 className={styles.title}>
                        {semester.name}
                    </h1>
                </header>

                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h2>Courses</h2>
                        <p>
                            Courses and grades for this semester
                            will appear here.
                        </p>
                    </div>

                    <div className={styles.emptyState}>
                        <h3>No courses yet</h3>
                        <p>
                            Course management comes in the next
                            project phase.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}

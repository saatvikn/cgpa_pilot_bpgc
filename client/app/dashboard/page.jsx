"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

import styles from "./dashboard.module.css";

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const [logoutError, setLogoutError] = useState("");
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        let isActive = true;

        async function loadCurrentUser() {
            try {
                const data = await apiRequest("/api/auth/me");

                if (isActive) {
                    setUser(data.user);
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

        loadCurrentUser();

        return () => {
            isActive = false;
        };
    }, [router]);

    async function handleLogout() {
        setLogoutError("");
        setIsLoggingOut(true);

        try {
            await apiRequest("/api/auth/logout", {
                method: "POST",
            });

            router.replace("/login");
        } catch (requestError) {
            setLogoutError(requestError.message);
        } finally {
            setIsLoggingOut(false);
        }
    }

    if (isLoading) {
        return (
            <main className={styles.page}>
                <p>Loading dashboard...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className={styles.page}>
                <section className={styles.errorCard}>
                    <h1>Could not load dashboard</h1>
                    <p role="alert">{error}</p>
                </section>
            </main>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <p className={styles.eyebrow}>
                            CGPA Pilot BPGC
                        </p>

                        <h1 className={styles.title}>
                            Dashboard
                        </h1>
                    </div>

                    <div className={styles.account}>
                        <p className={styles.email}>
                            {user.email}
                        </p>

                        <button
                            className={styles.logoutButton}
                            type="button"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                        >
                            {isLoggingOut
                                ? "Logging out..."
                                : "Log out"}
                        </button>
                    </div>
                </header>

                {logoutError && (
                    <p
                        className={styles.logoutError}
                        role="alert"
                    >
                        Error: {logoutError}
                    </p>
                )}

                <section className={styles.panel}>
                    <h2>Your academic record</h2>
                    <p>
                        Semester management will be added
                        next.
                    </p>
                </section>
            </div>
        </main>
    );
}
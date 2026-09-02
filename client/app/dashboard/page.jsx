"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

import styles from "./dashboard.module.css";

const INITIAL_SEMESTER_FORM = {
    name: "",
    semesterOrder: "",
};

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [semesters, setSemesters] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const [logoutError, setLogoutError] = useState("");
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const [semesterForm, setSemesterForm] = useState(INITIAL_SEMESTER_FORM);
    const [semesterError, setSemesterError] = useState("");
    const [isCreatingSemester, setIsCreatingSemester] = useState(false);

    useEffect(() => {
        let isActive = true;

        async function loadDashboard() {
            try {
                const [userData, semesterData] =
                    await Promise.all([
                        apiRequest("/api/auth/me"),
                        apiRequest("/api/semesters"),
                    ]);

                if (isActive) {
                    setUser(userData.user);
                    setSemesters(semesterData.semesters);
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

        loadDashboard();

        return () => {
            isActive = false;
        };
    }, [router]);

    function handleSemesterChange(event) {
        const { name, value } = event.target;

        setSemesterForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    }

    async function handleCreateSemester(event) {
        event.preventDefault();
        setSemesterError("");
        setIsCreatingSemester(true);

        try {
            const data = await apiRequest("/api/semesters", {
                method: "POST",
                body: JSON.stringify({
                    name: semesterForm.name,
                    semesterOrder: Number(
                        semesterForm.semesterOrder
                    ),
                }),
            });

            // Add the returned semester without reloading the page.
            setSemesters((currentSemesters) =>
                [...currentSemesters, data.semester].sort(
                    (firstSemester, secondSemester) =>
                        firstSemester.semesterOrder -
                        secondSemester.semesterOrder
                )
            );

            setSemesterForm(INITIAL_SEMESTER_FORM);
        } catch (requestError) {
            setSemesterError(requestError.message);
        } finally {
            setIsCreatingSemester(false);
        }
    }

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
                    <div className={styles.panelHeader}>
                        <div>
                            <h2>Your semesters</h2>
                            <p>
                                Semesters are shown in academic order.
                            </p>
                        </div>
                    </div>

                    <form
                        className={styles.semesterForm}
                        onSubmit={handleCreateSemester}
                    >
                        <div className={styles.formField}>
                            <label
                                className={styles.formLabel}
                                htmlFor="semesterName"
                            >
                                Semester name
                            </label>

                            <input
                                className={styles.formInput}
                                id="semesterName"
                                name="name"
                                type="text"
                                maxLength={100}
                                value={semesterForm.name}
                                onChange={handleSemesterChange}
                                required
                            />
                        </div>

                        <div className={styles.formField}>
                            <label
                                className={styles.formLabel}
                                htmlFor="semesterOrder"
                            >
                                Order
                            </label>

                            <input
                                className={styles.formInput}
                                id="semesterOrder"
                                name="semesterOrder"
                                type="number"
                                min={1}
                                step={1}
                                value={semesterForm.semesterOrder}
                                onChange={handleSemesterChange}
                                required
                            />
                        </div>

                        <button
                            className={styles.createButton}
                            type="submit"
                            disabled={isCreatingSemester}
                        >
                            {isCreatingSemester
                                ? "Adding..."
                                : "+ Add semester"}
                        </button>
                    </form>

                    {semesterError && (
                        <p
                            className={styles.semesterError}
                            role="alert"
                        >
                            Error: {semesterError}
                        </p>
                    )}

                    {semesters.length === 0 ? (
                        <div className={styles.emptyState}>
                            <h3>No semesters yet</h3>
                            <p>
                                Add your first semester to begin
                                tracking courses and grades.
                            </p>
                        </div>
                    ) : (
                        <div className={styles.semesterList}>
                            {semesters.map((semester) => (
                                <article
                                    className={styles.semesterCard}
                                    key={semester.id}
                                >
                                    <p className={styles.semesterOrder}>
                                        Semester {semester.semesterOrder}
                                    </p>

                                    <h3>{semester.name}</h3>

                                    <p className={styles.semesterMeta}>
                                        Course and SGPA information will
                                        appear here later.
                                    </p>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
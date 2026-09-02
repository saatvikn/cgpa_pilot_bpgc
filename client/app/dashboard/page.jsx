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

    const [editingSemesterId, setEditingSemesterId] = useState(null);
    const [editedSemesterName, setEditedSemesterName] = useState("");
    const [editSemesterError, setEditSemesterError] = useState("");
    const [isUpdatingSemester, setIsUpdatingSemester] = useState(false);

    const [pendingDeleteSemesterId, setPendingDeleteSemesterId] = useState(null);
    const [deleteSemesterError, setDeleteSemesterError] = useState("");
    const [isDeletingSemester, setIsDeletingSemester] = useState(false);

    const isSemesterActionActive =
        editingSemesterId !== null ||
        pendingDeleteSemesterId !== null ||
        isUpdatingSemester ||
        isDeletingSemester;

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

    function startEditingSemester(semester) {
        setEditingSemesterId(semester.id);
        setEditedSemesterName(semester.name);
        setEditSemesterError("");
    }

    function cancelEditingSemester() {
        setEditingSemesterId(null);
        setEditedSemesterName("");
        setEditSemesterError("");
    }

    async function handleRenameSemester(event, semesterId) {
        event.preventDefault();
        setEditSemesterError("");
        setIsUpdatingSemester(true);

        try {
            const data = await apiRequest(
                `/api/semesters/${semesterId}`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        name: editedSemesterName,
                    }),
                }
            );

            // Replace only the semester returned by the backend.
            setSemesters((currentSemesters) =>
                currentSemesters.map((semester) =>
                    semester.id === semesterId
                        ? data.semester
                        : semester
                )
            );

            cancelEditingSemester();
        } catch (requestError) {
            setEditSemesterError(requestError.message);
        } finally {
            setIsUpdatingSemester(false);
        }
    }

    function startDeletingSemester(semesterId) {
        setPendingDeleteSemesterId(semesterId);
        setDeleteSemesterError("");
    }

    function cancelDeletingSemester() {
        setPendingDeleteSemesterId(null);
        setDeleteSemesterError("");
    }

    async function handleDeleteSemester(semesterId) {
        setDeleteSemesterError("");
        setIsDeletingSemester(true);

        try {
            await apiRequest(
                `/api/semesters/${semesterId}`,
                {
                    method: "DELETE",
                }
            );

            // Keep every semester except the deleted one.
            setSemesters((currentSemesters) =>
                currentSemesters.filter(
                    (semester) =>
                        semester.id !== semesterId
                )
            );

            setPendingDeleteSemesterId(null);
        } catch (requestError) {
            setDeleteSemesterError(requestError.message);
        } finally {
            setIsDeletingSemester(false);
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

                                    {editingSemesterId === semester.id ? (
                                        <form
                                            className={styles.editForm}
                                            onSubmit={(event) =>
                                                handleRenameSemester(
                                                    event,
                                                    semester.id
                                                )
                                            }
                                        >
                                            <label
                                                className={styles.formLabel}
                                                htmlFor={`semester-name-${semester.id}`}
                                            >
                                                New name
                                            </label>

                                            <input
                                                className={styles.formInput}
                                                id={`semester-name-${semester.id}`}
                                                type="text"
                                                maxLength={100}
                                                value={editedSemesterName}
                                                onChange={(event) =>
                                                    setEditedSemesterName(
                                                        event.target.value
                                                    )
                                                }
                                                autoFocus
                                                required
                                            />

                                            <div className={styles.editActions}>
                                                <button
                                                    className={styles.saveButton}
                                                    type="submit"
                                                    disabled={isUpdatingSemester}
                                                >
                                                    {isUpdatingSemester
                                                        ? "Saving..."
                                                        : "Save"}
                                                </button>

                                                <button
                                                    className={styles.cancelButton}
                                                    type="button"
                                                    onClick={cancelEditingSemester}
                                                    disabled={isUpdatingSemester}
                                                >
                                                    Cancel
                                                </button>
                                            </div>

                                            {editSemesterError && (
                                                <p
                                                    className={styles.editError}
                                                    role="alert"
                                                >
                                                    Error: {editSemesterError}
                                                </p>
                                            )}
                                        </form>
                                    ) : (
                                        <>
                                            <div className={styles.cardTitleRow}>
                                                <h3>{semester.name}</h3>

                                                <div className={styles.cardActions}>
                                                    <button
                                                        className={styles.editButton}
                                                        type="button"
                                                        onClick={() =>
                                                            startEditingSemester(semester)
                                                        }
                                                        disabled={isSemesterActionActive}
                                                        aria-label={`Rename ${semester.name}`}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className={styles.deleteButton}
                                                        type="button"
                                                        onClick={() =>
                                                            startDeletingSemester(semester.id)
                                                        }
                                                        disabled={isSemesterActionActive}
                                                        aria-label={`Delete ${semester.name}`}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>

                                            <p className={styles.semesterMeta}>
                                                Course and SGPA information will
                                                appear here later.
                                            </p>
                                        </>
                                    )}

                                    {pendingDeleteSemesterId === semester.id && (
                                        <div className={styles.deleteConfirmation}>
                                            <p className={styles.deleteQuestion}>
                                                Delete &quot;{semester.name}&quot;?
                                            </p>

                                            <p className={styles.deleteWarning}>
                                                This action cannot be undone.
                                            </p>

                                            <div className={styles.deleteActions}>
                                                <button
                                                    className={styles.confirmDeleteButton}
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteSemester(
                                                            semester.id
                                                        )
                                                    }
                                                    disabled={isDeletingSemester}
                                                >
                                                    {isDeletingSemester
                                                        ? "Deleting..."
                                                        : "Confirm delete"}
                                                </button>

                                                <button
                                                    className={styles.cancelButton}
                                                    type="button"
                                                    onClick={cancelDeletingSemester}
                                                    disabled={isDeletingSemester}
                                                >
                                                    Cancel
                                                </button>
                                            </div>

                                            {deleteSemesterError && (
                                                <p
                                                    className={styles.deleteError}
                                                    role="alert"
                                                >
                                                    Error: {deleteSemesterError}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    useParams,
    useRouter,
} from "next/navigation";

import { apiRequest } from "@/lib/api";
import styles from "./semester.module.css";

const GRADE_OPTIONS = [
    "A",
    "A-",
    "B",
    "B-",
    "C",
    "C-",
    "D",
    "E",
];

const EMPTY_SGPA_SUMMARY = {
    sgpa: null,
    gradedCredits: 0,
    gradedCourseCount: 0,
    totalCourseCount: 0,
};

export default function SemesterDetailsPage() {
    const router = useRouter();
    const { semesterId } = useParams();

    const [semester, setSemester] = useState(null);
    const [semesterCourses, setSemesterCourses] = useState([]);
    const [sgpaSummary, setSgpaSummary] = useState(EMPTY_SGPA_SUMMARY);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const [courseSearch, setCourseSearch] = useState("");
    const [courseResults, setCourseResults] = useState([]);
    const [searchError, setSearchError] = useState("");
    const [addCourseError, setAddCourseError] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [addingCourseId, setAddingCourseId] = useState(null);

    const [pendingRemoveCourseId, setPendingRemoveCourseId] = useState(null);
    const [removeCourseError, setRemoveCourseError] = useState("");
    const [isRemovingCourse, setIsRemovingCourse] = useState(false);

    const [updatingGradeCourseId, setUpdatingGradeCourseId] = useState(null);
    const [gradeErrorCourseId, setGradeErrorCourseId] = useState(null);
    const [gradeError, setGradeError] = useState("");

    useEffect(() => {
        let isActive = true;

        async function loadSemester() {
            try {
                const [semesterData, courseData] =
                    await Promise.all([
                        apiRequest(`/api/semesters/${semesterId}`),
                        apiRequest(`/api/semesters/${semesterId}/courses`),
                    ]);

                if (isActive) {
                    setSemester(semesterData.semester);
                    setSemesterCourses(courseData.semesterCourses);
                    setSgpaSummary(
                        courseData.sgpaSummary ?? EMPTY_SGPA_SUMMARY
                    );
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

    async function refreshSemesterCourses() {
        const courseData = await apiRequest(
            `/api/semesters/${semesterId}/courses`
        );

        // Keep the course list and calculated summary in sync.
        setSemesterCourses(courseData.semesterCourses);
        setSgpaSummary(
            courseData.sgpaSummary ?? EMPTY_SGPA_SUMMARY
        );
    }

    async function handleSearchCourses(event) {
        event.preventDefault();

        const trimmedSearch = courseSearch.trim();

        if (!trimmedSearch) {
            setSearchError("Enter a course code or name");
            return;
        }

        setSearchError("");
        setAddCourseError("");
        setHasSearched(false);
        setIsSearching(true);

        try {
            const searchParams = new URLSearchParams({
                search: trimmedSearch,
            });

            const data = await apiRequest(
                `/api/courses?${searchParams.toString()}`
            );

            setCourseResults(data.courses);
            setHasSearched(true);
        } catch (requestError) {
            setSearchError(requestError.message);
        } finally {
            setIsSearching(false);
        }
    }

    async function handleAddCourse(courseId) {
        setAddCourseError("");
        setAddingCourseId(courseId);

        try {
            await apiRequest(
                `/api/semesters/${semesterId}/courses`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        courseId,
                    }),
                }
            );

            await refreshSemesterCourses();
        } catch (requestError) {
            setAddCourseError(requestError.message);
        } finally {
            setAddingCourseId(null);
        }
    }

    async function handleGradeChange(
        semesterCourseId,
        selectedGrade
    ) {
        const grade = selectedGrade || null;

        setGradeError("");
        setGradeErrorCourseId(null);
        setUpdatingGradeCourseId(semesterCourseId);

        try {
            await apiRequest(
                `/api/semester-courses/${semesterCourseId}`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        grade,
                    }),
                }
            );

            await refreshSemesterCourses();
        } catch (requestError) {
            setGradeErrorCourseId(semesterCourseId);
            setGradeError(requestError.message);
        } finally {
            setUpdatingGradeCourseId(null);
        }
    }

    function startRemovingCourse(semesterCourseId) {
        setPendingRemoveCourseId(semesterCourseId);
        setRemoveCourseError("");
        setGradeErrorCourseId(null);
        setGradeError("");
    }

    function cancelRemovingCourse() {
        setPendingRemoveCourseId(null);
        setRemoveCourseError("");
    }

    async function handleRemoveCourse(semesterCourseId) {
        setRemoveCourseError("");
        setIsRemovingCourse(true);

        try {
            await apiRequest(
                `/api/semester-courses/${semesterCourseId}`,
                {
                    method: "DELETE",
                }
            );

            await refreshSemesterCourses();

            setPendingRemoveCourseId(null);
        } catch (requestError) {
            setRemoveCourseError(requestError.message);
        } finally {
            setIsRemovingCourse(false);
        }
    }

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

                <section
                    className={styles.summaryPanel}
                    aria-labelledby="sgpa-heading"
                >
                    <div>
                        <p
                            className={styles.summaryLabel}
                            id="sgpa-heading"
                        >
                            Current SGPA
                        </p>

                        <p className={styles.summaryValue}>
                            {sgpaSummary.sgpa === null
                                ? "--"
                                : Number(sgpaSummary.sgpa).toFixed(2)}
                        </p>
                    </div>

                    <div className={styles.summaryDetails}>
                        <p>
                            {sgpaSummary.gradedCourseCount} of{" "}
                            {sgpaSummary.totalCourseCount} courses graded
                        </p>
                        <p>
                            {sgpaSummary.gradedCredits} graded credits
                        </p>
                    </div>
                </section>

                <section className={styles.searchPanel}>
                    <div className={styles.panelHeader}>
                        <h2>Add a course</h2>
                        <p>
                            Search the BITS Goa course catalogue by
                            code or name.
                        </p>
                    </div>

                    <form
                        className={styles.searchForm}
                        onSubmit={handleSearchCourses}
                    >
                        <input
                            className={styles.searchInput}
                            type="search"
                            value={courseSearch}
                            onChange={(event) =>
                                setCourseSearch(event.target.value)
                            }
                            placeholder="Example: CS F111"
                            aria-label="Course code or name"
                            required
                        />

                        <button
                            className={styles.searchButton}
                            type="submit"
                            disabled={isSearching}
                        >
                            {isSearching ? "Searching..." : "Search"}
                        </button>
                    </form>

                    {searchError && (
                        <p
                            className={styles.searchError}
                            role="alert"
                        >
                            Error: {searchError}
                        </p>
                    )}

                    {addCourseError && (
                        <p
                            className={styles.searchError}
                            role="alert"
                        >
                            Error: {addCourseError}
                        </p>
                    )}

                    {hasSearched && courseResults.length === 0 && (
                        <p className={styles.searchEmpty}>
                            No matching courses found.
                        </p>
                    )}

                    {courseResults.length > 0 && (
                        <div className={styles.searchResults}>
                            {courseResults.map((course) => {
                                const isAdded = semesterCourses.some(
                                    (semesterCourse) =>
                                        semesterCourse.courseId ===
                                        course.id
                                );

                                return (
                                    <article
                                        className={styles.searchResult}
                                        key={course.id}
                                    >
                                        <div>
                                            <p className={styles.resultCode}>
                                                {course.courseCode}
                                            </p>

                                            <h3>{course.courseName}</h3>

                                            <p className={styles.resultMeta}>
                                                {course.credits} credits ·{" "}
                                                {course.department}
                                            </p>
                                        </div>

                                        <button
                                            className={styles.addCourseButton}
                                            type="button"
                                            onClick={() =>
                                                handleAddCourse(course.id)
                                            }
                                            disabled={
                                                isAdded ||
                                                addingCourseId !== null ||
                                                pendingRemoveCourseId !== null ||
                                                updatingGradeCourseId !== null
                                            }
                                        >
                                            {isAdded
                                                ? "Added"
                                                : addingCourseId === course.id
                                                    ? "Adding..."
                                                    : "+ Add"}
                                        </button>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h2>Courses</h2>
                        <p>
                            Courses and grades for this semester
                            will appear here.
                        </p>
                    </div>

                    {semesterCourses.length === 0 ? (
                        <div className={styles.emptyState}>
                            <h3>No courses yet</h3>
                            <p>
                                Search the catalogue to add the first
                                course.
                            </p>
                        </div>
                    ) : (
                        <div className={styles.courseList}>
                            {semesterCourses.map((semesterCourse) => (
                                <article
                                    className={styles.courseCard}
                                    key={semesterCourse.id}
                                >
                                    <div className={styles.courseHeading}>
                                        <div>
                                            <p className={styles.courseCode}>
                                                {semesterCourse.courseCode}
                                            </p>

                                            <h3>
                                                {semesterCourse.courseName}
                                            </h3>
                                        </div>

                                        <div className={styles.courseCardActions}>
                                            <p className={styles.courseCredits}>
                                                {semesterCourse.credits} credits
                                            </p>

                                            <button
                                                className={styles.removeCourseButton}
                                                type="button"
                                                onClick={() =>
                                                    startRemovingCourse(
                                                        semesterCourse.id
                                                    )
                                                }
                                                disabled={
                                                    pendingRemoveCourseId !== null ||
                                                    updatingGradeCourseId !== null
                                                }
                                                aria-label={`Remove ${semesterCourse.courseName}`}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    <p className={styles.courseMeta}>
                                        {semesterCourse.department}
                                    </p>

                                    <div className={styles.gradeField}>
                                        <label
                                            className={styles.gradeLabel}
                                            htmlFor={`grade-${semesterCourse.id}`}
                                        >
                                            Grade
                                        </label>

                                        <select
                                            className={styles.gradeSelect}
                                            id={`grade-${semesterCourse.id}`}
                                            value={semesterCourse.grade ?? ""}
                                            onChange={(event) =>
                                                handleGradeChange(
                                                    semesterCourse.id,
                                                    event.target.value
                                                )
                                            }
                                            disabled={
                                                updatingGradeCourseId !== null ||
                                                pendingRemoveCourseId !== null
                                            }
                                        >
                                            <option value="">
                                                Not selected
                                            </option>

                                            {GRADE_OPTIONS.map((grade) => (
                                                <option
                                                    key={grade}
                                                    value={grade}
                                                >
                                                    {grade}
                                                </option>
                                            ))}
                                        </select>

                                        {updatingGradeCourseId ===
                                            semesterCourse.id && (
                                                <span
                                                    className={styles.gradeStatus}
                                                >
                                                    Saving...
                                                </span>
                                            )}
                                    </div>

                                    {gradeErrorCourseId ===
                                        semesterCourse.id && (
                                            <p
                                                className={styles.gradeError}
                                                role="alert"
                                            >
                                                Error: {gradeError}
                                            </p>
                                        )}

                                    {pendingRemoveCourseId ===
                                        semesterCourse.id && (
                                            <div
                                                className={
                                                    styles.removeConfirmation
                                                }
                                            >
                                                <p
                                                    className={
                                                        styles.removeQuestion
                                                    }
                                                >
                                                    Remove &quot;
                                                    {semesterCourse.courseCode}
                                                    &quot; from this semester?
                                                </p>

                                                <p
                                                    className={
                                                        styles.removeWarning
                                                    }
                                                >
                                                    Its selected grade will also be
                                                    removed.
                                                </p>

                                                <div
                                                    className={
                                                        styles.removeActions
                                                    }
                                                >
                                                    <button
                                                        className={
                                                            styles.confirmRemoveButton
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveCourse(
                                                                semesterCourse.id
                                                            )
                                                        }
                                                        disabled={isRemovingCourse}
                                                    >
                                                        {isRemovingCourse
                                                            ? "Removing..."
                                                            : "Confirm remove"}
                                                    </button>

                                                    <button
                                                        className={
                                                            styles.cancelRemoveButton
                                                        }
                                                        type="button"
                                                        onClick={cancelRemovingCourse}
                                                        disabled={isRemovingCourse}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>

                                                {removeCourseError && (
                                                    <p
                                                        className={
                                                            styles.removeError
                                                        }
                                                        role="alert"
                                                    >
                                                        Error: {removeCourseError}
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

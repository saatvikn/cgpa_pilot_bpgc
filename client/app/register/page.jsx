"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

import styles from "../auth.module.css";

const INITIAL_FORM = {
    email: "",
    password: "",
    confirmPassword: "",
};

export default function RegisterPage() {
    const router = useRouter();
    const [formValues, setFormValues] = useState(INITIAL_FORM);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormValues((currentValues) => ({
            ...currentValues,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (formValues.password !== formValues.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsSubmitting(true);

        try {
            await apiRequest("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    email: formValues.email,
                    password: formValues.password,
                }),
            });

            router.replace("/dashboard");
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className={styles.main}>
            <section className={styles.card}>
                <p className={styles.eyebrow}>
                    CGPA Pilot BPGC
                </p>

                <h1 className={styles.title}>
                    Create your account
                </h1>

                <p className={styles.subtitle}>
                    Save your semesters, courses, and grades.
                </p>

                <form
                    className={styles.form}
                    onSubmit={handleSubmit}
                >
                    <div className={styles.field}>
                        <label
                            className={styles.label}
                            htmlFor="email"
                        >
                            Email
                        </label>

                        <input
                            className={styles.input}
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={formValues.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label
                            className={styles.label}
                            htmlFor="password"
                        >
                            Password
                        </label>

                        <input
                            className={styles.input}
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            minLength={8}
                            maxLength={72}
                            value={formValues.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label
                            className={styles.label}
                            htmlFor="confirmPassword"
                        >
                            Confirm password
                        </label>

                        <input
                            className={styles.input}
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            minLength={8}
                            maxLength={72}
                            value={formValues.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        className={styles.button}
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Creating account..."
                            : "Create account"}
                    </button>
                </form>

                {error && (
                    <p
                        className={styles.error}
                        role="alert"
                    >
                        Error: {error}
                    </p>
                )}

                <p className={styles.footer}>
                    Already have an account?{" "}
                    <Link
                        className={styles.link}
                        href="/login"
                    >
                        Log in
                    </Link>
                </p>
            </section>
        </main>
    );
}
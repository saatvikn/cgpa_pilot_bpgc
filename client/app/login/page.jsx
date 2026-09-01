"use client";

import Link from "next/link";
import { useState } from "react";
import { apiRequest } from "@/lib/api";

import styles from "../auth.module.css";

const INITIAL_FORM = {
    email: "",
    password: "",
};

export default function LoginPage() {
    const [formValues, setFormValues] = useState(INITIAL_FORM);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
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
        setMessage("");
        setIsSubmitting(true);

        try {
            await apiRequest("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email: formValues.email,
                    password: formValues.password,
                }),
            });

            setMessage("Logged in successfully.");

            setFormValues((currentValues) => ({
                ...currentValues,
                password: "",
            }));
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
                    Welcome back
                </h1>

                <p className={styles.subtitle}>
                    Log in to view your saved academic data.
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
                            autoComplete="current-password"
                            minLength={8}
                            maxLength={72}
                            value={formValues.password}
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
                            ? "Logging in..."
                            : "Log in"}
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

                {message && (
                    <p
                        className={styles.success}
                        aria-live="polite"
                    >
                        {message}
                    </p>
                )}

                <p className={styles.footer}>
                    Need an account?{" "}
                    <Link
                        className={styles.link}
                        href="/register"
                    >
                        Register
                    </Link>
                </p>
            </section>
        </main>
    );
}
"use client";

import { useState } from "react";
import styles from "./page.module.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
    const [backendStatus, setBackendStatus] = useState("Not checked");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function checkBackend() {
        setIsLoading(true);
        setError("");

        try {
            if (!apiUrl) {
                throw new Error("NEXT_PUBLIC_API_URL is not configured");
            }

            const response = await fetch(`${apiUrl}/api/health`);

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const data = await response.json();
            setBackendStatus(data.status);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className={styles.main}>
            <section className={styles.card}>
                <p className={styles.eyebrow}>CGPA Pilot BPGC</p>
                <h1>Frontend–backend connection test</h1>

                <p>
                    This button asks the Express API whether the backend is running.
                </p>

                <button
                    className={styles.button}
                    type="button"
                    onClick={checkBackend}
                    disabled={isLoading}
                >
                    {isLoading ? "Checking..." : "Check backend"}
                </button>

                <p className={styles.status}>
                    Backend status: <strong>{backendStatus}</strong>
                </p>

                {error && <p className={styles.error}>Error: {error}</p>}
            </section>
        </main>
    );
}
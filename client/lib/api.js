// frontend API helper

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        credentials: "include",
        headers: {
            ...(options.body
                ? { "Content-Type": "application/json" }
                : {}),
            ...(options.headers || {}),
        },
    });

    const data = await response.json();

    if (!response.ok) {
        const requestError = new Error(
            data.error ||
            `Request failed with status ${response.status}`
        );

        requestError.status = response.status;

        throw requestError;
    }

    return data;
}
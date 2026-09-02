export function notFoundHandler(request, response) {
    return response.status(404).json({
        error: "API route not found",
    });
}

export function errorHandler(error, request, response, next) {
    if (response.headersSent) {
        return next(error);
    }

    // express.json() reports malformed JSON as a syntax error.
    if (error instanceof SyntaxError && error.status === 400) {
        return response.status(400).json({
            error: "Invalid JSON body",
        });
    }

    console.error("Unhandled API error:", error);

    return response.status(500).json({
        error: "Internal server error",
    });
}

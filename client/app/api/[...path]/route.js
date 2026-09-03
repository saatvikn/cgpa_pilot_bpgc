const SERVER_API_URL = process.env.SERVER_API_URL;

async function forwardRequest(request, context) {
    if (!SERVER_API_URL) {
        return Response.json(
            { error: "SERVER_API_URL is not configured" },
            { status: 500 }
        );
    }

    const { path } = await context.params;
    const encodedPath = path
        .map((segment) => encodeURIComponent(segment))
        .join("/");

    const upstreamUrl = new URL(
        `/api/${encodedPath}`,
        SERVER_API_URL
    );

    upstreamUrl.search = new URL(request.url).search;

    // Forward only the required request headers.
    const requestHeaders = new Headers();

    for (const headerName of [
        "accept",
        "content-type",
        "cookie",
        "origin",
        "user-agent",
    ]) {
        const value = request.headers.get(headerName);

        if (value) {
            requestHeaders.set(headerName, value);
        }
    }

    try {
        const hasBody = !["GET", "HEAD"].includes(
            request.method
        );

        const upstreamResponse = await fetch(
            upstreamUrl,
            {
                method: request.method,
                headers: requestHeaders,
                body: hasBody
                    ? await request.arrayBuffer()
                    : undefined,
                redirect: "manual",
                cache: "no-store",
            }
        );

        const responseHeaders = new Headers(
            upstreamResponse.headers
        );

        responseHeaders.delete("content-encoding");
        responseHeaders.delete("content-length");
        responseHeaders.delete("transfer-encoding");
        responseHeaders.set("cache-control", "no-store");

        return new Response(upstreamResponse.body, {
            status: upstreamResponse.status,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error("API proxy failed:", error);

        return Response.json(
            { error: "Could not reach API" },
            { status: 502 }
        );
    }
}

export {
    forwardRequest as DELETE,
    forwardRequest as GET,
    forwardRequest as PATCH,
    forwardRequest as POST,
    forwardRequest as PUT,
};
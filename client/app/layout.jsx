import {
    Archivo,
    IBM_Plex_Mono,
} from "next/font/google";

import "./globals.css";

const archivo = Archivo({
    variable: "--font-archivo",
    subsets: ["latin"],
    weight: "variable",
});

const ibmPlexMono = IBM_Plex_Mono({
    variable: "--font-ibm-plex-mono",
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

export const metadata = {
    title: "CGPA Pilot BPGC",
    description: "Track semesters, courses, SGPA, and CGPA.",
};

export default function RootLayout({ children }) {
    return (
        <html
            lang="en"
            className={`${archivo.variable} ${ibmPlexMono.variable}`}
        >
            <body>{children}</body>
        </html>
    );
}
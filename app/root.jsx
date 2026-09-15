import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import { ThemeProvider, themeInitScript } from "~/components/ThemeProvider";
import stylesheet from "~/tailwind.css?url";

export const links = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
];

export const meta = () => [
  { title: "MyAnatomy.ai — Discover, evaluate, and hire top tech talent at scale" },
  {
    name: "description",
    content:
      "AI-powered assessment and skill orchestration. Connecting candidates, higher-ed institutions, and enterprises through next-gen evaluations, AI proctoring, and industry certifications.",
  },
  { name: "theme-color", content: "#0B0F19" },
];

export function Layout({ children }) {
  return (
    // Server renders `dark`; the blocking script below corrects it before paint.
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  );
}

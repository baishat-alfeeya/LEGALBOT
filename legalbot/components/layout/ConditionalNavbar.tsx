"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

// Pages where the Navbar should NOT appear
const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Hide navbar on auth pages
  if (AUTH_PAGES.includes(pathname)) return null;

  return <Navbar />;
}

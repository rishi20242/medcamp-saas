"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HeaderLogo() {
  const pathname = usePathname();
  
  // If we are on the registration page, do not render it as a functional link
  if (pathname?.endsWith("/register")) {
    return <span className="cursor-default">MedCamp.</span>;
  }
  
  return <Link href="/">MedCamp.</Link>;
}

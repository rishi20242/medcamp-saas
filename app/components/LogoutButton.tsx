"use client";
import { logoutAction } from "../actions";
import { useRouter, useParams } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const params = useParams();
  const campCode = params?.campCode as string | undefined;

  const handleLogout = async () => {
    await logoutAction();
    if (campCode) {
      router.push(`/${campCode}/login`);
    } else {
      router.push("/login");
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1.5"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
      <span className="hidden sm:inline">Logout</span>
    </button>
  );
}

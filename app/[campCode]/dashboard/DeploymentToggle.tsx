"use client";

import { useTransition } from "react";
import { toggleDeploymentStatusAction } from "../../actions";

export default function DeploymentToggle({ deploymentId, initialStatus }: { deploymentId: string, initialStatus: string }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const newStatus = initialStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    startTransition(async () => {
      try {
        await toggleDeploymentStatusAction(deploymentId, newStatus);
      } catch (e) {
        console.error("Failed to toggle deployment status", e);
      }
    });
  };

  const isActive = initialStatus === "ACTIVE";

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      role="switch"
      aria-checked={isActive}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 ${
        isActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
      }`}
    >
      <span className="sr-only">Toggle deployment status</span>
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isActive ? "translate-x-6 shadow-sm" : "translate-x-1"
        }`}
      />
    </button>
  );
}

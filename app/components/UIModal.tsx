"use client";
import React, { useState, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BaseModal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 transition-colors"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function AlertModal({
  isOpen,
  onClose,
  title = "Notice",
  message,
  type = "info",
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: "info" | "success" | "error" | "warning";
}) {
  if (!isOpen) return null;

  const iconColors = {
    info: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800",
    success: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    error: "text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
    warning: "text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center py-2">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border ${iconColors[type]}`}>
          {type === "success" && (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {type === "error" && (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {type === "warning" && (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          {type === "info" && (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base font-medium mb-6 leading-relaxed">
          {message}
        </p>
        <button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md active:scale-[0.98]"
        >
          Acknowledge
        </button>
      </div>
    </BaseModal>
  );
}

export function ConfirmModal({
  isOpen,
  onCancel,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = false,
  isLoading = false,
}: {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="py-2">
        <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base font-medium mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 ${
              isDanger
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
            }`}
          >
            {isLoading && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

export function PromptModal({
  isOpen,
  onCancel,
  onSubmit,
  title = "Input Required",
  message,
  placeholder = "Enter text...",
  confirmText = "Submit",
  cancelText = "Cancel",
  isLoading = false,
}: {
  isOpen: boolean;
  onCancel: () => void;
  onSubmit: (value: string) => void;
  title?: string;
  message: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}) {
  const [val, setVal] = useState("");

  useEffect(() => {
    if (isOpen) setVal("");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onCancel} title={title}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(val);
        }}
        className="py-2 space-y-4"
      >
        <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed">
          {message}
        </p>
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={placeholder}
          rows={3}
          autoFocus
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
        />
        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            )}
            {confirmText}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

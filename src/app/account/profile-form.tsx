"use client";

import { useState } from "react";
import { updateProfileAction } from "@/lib/actions/user-settings";
import { Loader2, Check, User, Lock, AtSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaStore } from "@/store/use-media-store";

export function ProfileForm({ currentUsername, currentName }: { currentUsername: string, currentName: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUser = useMediaStore((state) => state.setUser);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const res = await updateProfileAction(formData);

    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      
      // Update global store for instant sidebar reflection
      const name = formData.get("name") as string;
      const username = formData.get("username") as string;
      setUser({ name, username });

      // We don't reset anymore to keep the values visible, or we could reset password only
      const passwordInput = (e.target as HTMLFormElement).querySelector('input[name="newPassword"]') as HTMLInputElement;
      if (passwordInput) passwordInput.value = "";

      // Reset success state after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <label className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-40 px-1">
          Name
        </label>
        <div className="relative">
          <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" />
          <input
            type="text"
            name="name"
            defaultValue={currentName}
            className="w-full bg-surface border-hairline py-3 pl-11 pr-4 text-sm font-sans focus:outline-none focus:border-dark/30 transition-all placeholder:opacity-20"
            placeholder="Your name"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-40 px-1">
          Username
        </label>
        <div className="relative">
          <AtSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" />
          <input
            type="text"
            name="username"
            defaultValue={currentUsername}
            className="w-full bg-surface border-hairline py-3 pl-11 pr-4 text-sm font-sans focus:outline-none focus:border-dark/30 transition-all placeholder:opacity-20"
            placeholder="New username"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-40 px-1">
          New Password
        </label>
        <div className="relative">
          <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" />
          <input
            type="password"
            name="newPassword"
            className="w-full bg-surface border-hairline py-3 pl-11 pr-4 text-sm font-sans focus:outline-none focus:border-dark/30 transition-all placeholder:opacity-20"
            placeholder="••••••••"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full py-4 font-sans text-[11px] uppercase tracking-[0.3em] font-medium transition-all duration-500 flex items-center justify-center gap-2",
          success 
            ? "bg-green-500 text-white" 
            : "bg-dark text-white hover:bg-accent"
        )}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : success ? (
          <>
            <Check size={16} />
            Updated Successfully
          </>
        ) : (
          "Save Changes"
        )}
      </button>

      {error && (
        <p className="text-[10px] uppercase tracking-widest text-red-500 text-center font-medium">
          {error}
        </p>
      )}
    </form>
  );
}

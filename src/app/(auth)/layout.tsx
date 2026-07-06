import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-zinc-950 text-zinc-50 selection:bg-zinc-800">
      {/* Background gradients/glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black -z-10" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md px-6 py-12 flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 mb-8 group transition-all duration-300">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-all">
            D
          </div>
          <span className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent group-hover:to-white transition-all">
            Draftly
          </span>
        </Link>
        
        {children}
      </div>
    </div>
  );
}

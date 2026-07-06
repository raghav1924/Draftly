"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/lib/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result && !result.success) {
        toast.error(result.error);
      } else {
        toast.success("Logged in successfully!");
        router.push("/dashboard");
      }
    });
  };

  return (
    <Card className="w-full border-zinc-800 bg-zinc-900/50 backdrop-blur-xl text-zinc-50 shadow-2xl shadow-indigo-500/5">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center">Welcome back</CardTitle>
        <CardDescription className="text-zinc-400 text-center">
          Enter your credentials to access your workspace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              required
              disabled={isPending}
              className="border-zinc-800 bg-zinc-950/50 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-zinc-300">Password</Label>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={isPending}
              className="border-zinc-800 bg-zinc-950/50 text-zinc-50 focus-visible:ring-indigo-500"
            />
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all duration-300"
          >
            {isPending ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

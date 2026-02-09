// components/auth/register-dialog.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api-client";

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin: () => void;
  trigger?: React.ReactNode;
}

export function RegisterDialog({
  open,
  onOpenChange,
  onSwitchToLogin,
  trigger,
}: RegisterDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    try {
      const response = await apiClient.post<{ success: boolean; user: any }>("/auth/register", {
        name,
        email,
      });

      if (response.success) {
        setSuccess("Account created successfully! You can now sign in.");
        
        // Auto sign in after successful registration
        setTimeout(async () => {
          const result = await signIn("credentials", {
            email,
            redirect: false,
          });

          if (!result?.error) {
            onOpenChange(false);
            router.refresh();
          }
        }, 1500);
      }
    } catch (error: any) {
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create your account</DialogTitle>
          <DialogDescription>
            Fill in the details below to get started
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="p-3 text-sm bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-sm bg-green-50 text-green-700 rounded-md">
              {success}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Nickname</Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="[email protected]"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 rounded border-zinc-300"
            />
            <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
              I agree to the{" "}
              <a href="#" className="font-medium hover:underline">
                Terms and Conditions
              </a>
            </Label>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-medium hover:underline"
            >
              Sign in here
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
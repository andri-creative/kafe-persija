// components/auth/login-dialog.tsx
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
import { Loader2 } from "lucide-react"; // Import loader icon

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToRegister: () => void;
  trigger?: React.ReactNode;
}

export function LoginDialog({
  open,
  onOpenChange,
  onSwitchToRegister,
  trigger,
}: LoginDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Function untuk delay/wait
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    try {
      // Tampilkan loading minimal 3 detik
      const [signInResult] = await Promise.all([
        signIn("credentials", {
          email,
          redirect: false,
        }),
        wait(3000) // Delay 3 detik
      ]);

      if (signInResult?.error) {
        setError("Login gagal");
        return;
      }

      if (signInResult?.ok) {
        const session = await fetch("/api/auth/session").then((res) => res.json());

        const roles: string[] = session.user.roles || [];

        // Redirect berdasarkan role
        if (roles.includes("SUPER_ADMIN")) {
          router.push("/super-admin/dashboard");
        } else if (roles.includes("ADMIN")) {
          router.push("/admin/dashboard");
        } else if (roles.includes("STAFF")) {
          router.push("/staff/dashboard");
        } else {
          onOpenChange(false);
          router.refresh();
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Versi alternatif dengan loading timer yang lebih jelas
  const handleSubmitAlternative = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    try {
      // Mulai timer untuk minimal 3 detik
      const startTime = Date.now();
      
      // Proses sign in
      const result = await signIn("credentials", {
        email,
        redirect: false,
      });

      // Hitung sisa waktu untuk mencapai 3 detik
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 3000 - elapsedTime);
      
      // Tunggu sisa waktu jika proses terlalu cepat
      if (remainingTime > 0) {
        await wait(remainingTime);
      }

      if (result?.error) {
        setError("Login gagal");
        return;
      }

      if (result?.ok) {
        const session = await fetch("/api/auth/session").then((res) => res.json());

        const roles: string[] = session.user.roles || [];

        if (roles.includes("SUPER_ADMIN")) {
          router.push("/super-admin/dashboard");
        } else if (roles.includes("ADMIN")) {
          router.push("/admin/dashboard");
        } else if (roles.includes("STAFF")) {
          router.push("/staff/dashboard");
        } else {
          onOpenChange(false);
          router.refresh();
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Versi dengan loading spinner dan progress bar (opsional)
  const handleSubmitWithProgress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    // Tampilkan loading selama 3 detik
    const loadingPromise = wait(3000);
    
    try {
      const result = await signIn("credentials", {
        email,
        redirect: false,
      });

      // Tunggu loading minimal 3 detik
      await loadingPromise;

      if (result?.error) {
        setError("Login gagal");
        return;
      }

      if (result?.ok) {
        const session = await fetch("/api/auth/session").then((res) => res.json());

        const roles: string[] = session.user.roles || [];

        if (roles.includes("SUPER_ADMIN")) {
          router.push("/super-admin/dashboard");
        } else if (roles.includes("ADMIN")) {
          router.push("/admin/dashboard");
        } else if (roles.includes("STAFF")) {
          router.push("/staff/dashboard");
        } else {
          onOpenChange(false);
          router.refresh();
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Sign in to your account
          </DialogTitle>
          <DialogDescription>
            Enter your email to access your account
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="p-3 text-sm bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="[EMAIL_ADDRESS]"
              disabled={isLoading}
            />
          </div>
          
          {/* Loading Progress Bar (Opsional) */}
          {isLoading && (
            <div className="space-y-2">
              <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full animate-pulse"
                  style={{ 
                    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                    width: "100%" 
                  }}
                />
              </div>
              <p className="text-xs text-center text-zinc-500">
                Loading, please wait...
              </p>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in (3s)...
              </>
            ) : (
              "Sign in with Email"
            )}
          </Button>
          
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-medium hover:underline disabled:opacity-50"
              disabled={isLoading}
            >
              Register here
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
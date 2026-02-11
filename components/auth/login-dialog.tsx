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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "../ui/field";
import { CardContent } from "../ui/card";

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

  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const redirectByRole = async () => {
    const session = await fetch("/api/auth/session").then((res) => res.json());

    const roles: string[] = session?.user?.roles || [];

    if (roles.includes("SUPER_ADMIN")) {
      router.push("/super-admin/order");
    } else if (roles.includes("ADMIN")) {
      router.push("/admin/order");
    } else if (roles.includes("STAFF")) {
      router.push("/staff/order");
    } else {
      router.push("/order");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Login gagal");
        return;
      }

      if (signInResult?.ok) {
        redirectByRole();
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const signInResult = await signIn("google", {
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Login gagal");
        return;
      }

      if (signInResult?.ok) {
        redirectByRole();
      }
    } catch (error) {
      console.error("Google login error:", error);
      setError("Google login gagal");
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const signInResult = await signIn("apple", {
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Login gagal");
        return;
      }

      if (signInResult?.ok) {
        redirectByRole();
      }
    } catch (error) {
      console.error("Apple login error:", error);
      setError("Apple login gagal");
      setIsLoading(false);
    }
  };

  const handleSubmitAlternative = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const startTime = Date.now();

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 3000 - elapsedTime);

      if (remainingTime > 0) {
        await wait(remainingTime);
      }

      if (result?.error) {
        setError("Login gagal");
        return;
      }

      if (result?.ok) {
        const session = await fetch("/api/auth/session").then((res) =>
          res.json(),
        );

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

  const handleSubmitWithProgress = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const loadingPromise = wait(3000);

    try {
      const result = await signIn("credentials", {
        email,
        redirect: false,
      });

      await loadingPromise;

      if (result?.error) {
        setError("Login gagal");
        return;
      }

      if (result?.ok) {
        const session = await fetch("/api/auth/session").then((res) =>
          res.json(),
        );

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
      {trigger && (
        <DialogTrigger asChild className="cursor-pointer">
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Persija Caffee
                </p>
              </div>
              {error && <div className="text-red-500 text-center">{error}</div>}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="m@example.com"
                  disabled={isLoading}
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  required
                />
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="cursor-pointer"
                >
                  {isLoading ? "Loading..." : "Login"}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Login with Apple</span>
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Login with Google</span>
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Don&apos;t have an account? <a href="#">Sign up</a>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </DialogContent>
    </Dialog>
  );
}

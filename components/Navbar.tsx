"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginDialog } from "./auth/login-dialog";

import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Login submitted");
    setLoginOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm dark:bg-black/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <Image
                className="dark:invert"
                src="/next.svg"
                alt="Logo"
                width={100}
                height={20}
                priority
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {status === "loading" ? (
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
            ) : session?.user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {session.user.picture ? (
                    <Image
                      src={session.user.picture}
                      alt={session.user.nickname || "User"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {session.user.nickname?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Hi, {session.user.nickname?.split(" ")[0]}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {session.user.roles?.[0] || "User"}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                {/* Login Dialog */}
                <LoginDialog
                  open={loginOpen}
                  onOpenChange={setLoginOpen}
                  onSwitchToRegister={() => { }}
                  trigger={
                    <Button variant="ghost" className="text-sm font-medium">
                      Login
                    </Button>
                  }
                />
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {status === "loading" ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-10 w-full bg-gray-200 rounded"></div>
                <div className="h-10 w-full bg-gray-200 rounded"></div>
              </div>
            ) : session?.user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-2 py-2">
                  {session.user.picture ? (
                    <Image
                      src={session.user.picture}
                      alt={session.user.nickname || "User"}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {session.user.nickname?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {session.user.nickname || "User"}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {session.user.email}
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400 capitalize mt-0.5">
                      {session.user.roles?.[0] || "User"}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-center text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    setIsOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">Sign in to your account</DialogTitle>
                      <DialogDescription>
                        Enter your credentials to access your account
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleLoginSubmit} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="mobile-login-email">Email address</Label>
                        <Input
                          id="mobile-login-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          placeholder="[email protected]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mobile-login-password">Password</Label>
                        <Input
                          id="mobile-login-password"
                          name="password"
                          type="password"
                          autoComplete="current-password"
                          required
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            id="mobile-remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 rounded border-zinc-300"
                          />
                          <Label htmlFor="mobile-remember-me" className="text-sm font-normal cursor-pointer">
                            Remember me
                          </Label>
                        </div>
                        <button
                          type="button"
                          className="text-sm font-medium hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <Button type="submit" className="w-full">
                        Sign in
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

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
import { RegisterDialog } from "./auth/register-dialog";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add your login logic here
    console.log("Login submitted");
    setLoginOpen(false);
  };

  const handleRegisterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add your register logic here
    console.log("Register submitted");
    setRegisterOpen(false);
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
            {/* Login Dialog */}
            <LoginDialog 
              open={loginOpen}
              onOpenChange={setLoginOpen}
              onSwitchToRegister={() => {
                setLoginOpen(false);
                setRegisterOpen(true);
              }}
              trigger={
                <Button variant="ghost" className="text-sm font-medium">
                  Login
                </Button>
              }
            />

            {/* Register Dialog */}
        <RegisterDialog 
          open={registerOpen}
          onOpenChange={setRegisterOpen}
          onSwitchToLogin={() => {
            setRegisterOpen(false);
            setLoginOpen(true);
          }}
          trigger={
            <Button variant="ghost" className="text-sm font-medium">
              Register
            </Button>
          }
        />
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
                  <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setLoginOpen(false);
                        setRegisterOpen(true);
                      }}
                      className="font-medium hover:underline"
                    >
                      Register here
                    </button>
                  </p>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-full text-sm font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Create your account</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to get started
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRegisterSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobile-register-name">Full Name</Label>
                    <Input
                      id="mobile-register-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile-register-email">Email address</Label>
                    <Input
                      id="mobile-register-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="[email protected]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile-register-password">Password</Label>
                    <Input
                      id="mobile-register-password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile-register-confirm-password">Confirm Password</Label>
                    <Input
                      id="mobile-register-confirm-password"
                      name="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="mobile-terms"
                      name="terms"
                      type="checkbox"
                      required
                      className="h-4 w-4 rounded border-zinc-300"
                    />
                    <Label htmlFor="mobile-terms" className="text-sm font-normal cursor-pointer">
                      I agree to the{" "}
                      <a href="#" className="font-medium hover:underline">
                        Terms and Conditions
                      </a>
                    </Label>
                  </div>
                  <Button type="submit" className="w-full">
                    Create account
                  </Button>
                  <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setRegisterOpen(false);
                        setLoginOpen(true);
                      }}
                      className="font-medium hover:underline"
                    >
                      Sign in here
                    </button>
                  </p>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </nav>
  );
}

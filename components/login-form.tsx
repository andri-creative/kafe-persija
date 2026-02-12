"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const router = useRouter()
    const [mode, setMode] = useState<'signin' | 'signup'>('signin')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const isLogin = mode === 'signin'

    const redirectByRole = async () => {
        const session = await fetch("/api/auth/session").then((res) => res.json())
        const roles: string[] = session?.user?.roles || []

        if (roles.includes("SUPER_ADMIN")) {
            router.push("/super-admin/dashboard")
        } else if (roles.includes("ADMIN")) {
            router.push("/admin/dashboard")
        } else if (roles.includes("STAFF")) {
            router.push("/staff/dashboard")
        } else {
            router.push("/")
        }
        router.refresh()
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        setSuccess("")

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        if (isLogin) {
            try {
                const result = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                })

                if (result?.error) {
                    setError("Email atau password salah")
                    return
                }

                if (result?.ok) {
                    await redirectByRole()
                }
            } catch (err) {
                setError("Terjadi kesalahan log in. Silakan coba lagi.")
            } finally {
                setIsLoading(false)
            }
        } else {
            const name = formData.get("name") as string
            try {
                const response = await apiClient.post<{ success: boolean }>("/auth/register", {
                    name,
                    email,
                    password
                })

                if (response.success) {
                    setSuccess("Akun berhasil dibuat! Mengalihkan ke login...")
                    setTimeout(() => {
                        setMode('signin')
                        setSuccess("")
                    }, 2000)
                }
            } catch (err: any) {
                setError(err.message || "Registrasi gagal. Silakan coba lagi.")
            } finally {
                setIsLoading(false)
            }
        }
    }

    const handleSocialLogin = async (provider: 'google' | 'apple') => {
        setIsLoading(true)
        setError("")
        try {
            const result = await signIn(provider, { redirect: false })
            if (result?.error) {
                setError(`Login dengan ${provider} gagal`)
                return
            }
            if (result?.ok) {
                await redirectByRole()
            }
        } catch (err) {
            setError(`Terjadi kesalahan pada login ${provider}`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0 border-none shadow-xl">
                <CardContent className="grid p-0 md:grid-cols-2 relative min-h-[400px]">
                    {/* Image Container */}
                    <motion.div
                        layout
                        transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
                        className={cn(
                            "bg-muted relative hidden md:block h-full",
                            isLogin ? "md:order-1" : "md:order-2"
                        )}
                    >
                        <img
                            src="/home-page.webp"
                            alt="Image"
                            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                        />
                    </motion.div>

                    {/* Form Container */}
                    <motion.div
                        layout
                        transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
                        className={cn(
                            "p-6 md:p-8 flex flex-col justify-center bg-card h-full min-h-[400px]",
                            isLogin ? "md:order-2" : "md:order-1"
                        )}
                    >
                        <form onSubmit={handleSubmit}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={mode}
                                    initial={{ x: isLogin ? 20 : -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: isLogin ? -20 : 20, opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <FieldGroup>
                                        <div className="flex flex-col items-center gap-2 text-center">
                                            <h1 className="text-2xl font-bold">
                                                {isLogin ? "Welcome back" : "Create an account"}
                                            </h1>
                                            <p className="text-muted-foreground text-balance">
                                                {isLogin
                                                    ? "Login to your Persija Cafe account"
                                                    : "Enter your details below to create your account"}
                                            </p>
                                        </div>

                                        {error && (
                                            <div className="p-3 text-sm bg-red-50 text-red-600 rounded-md text-center border border-red-100">
                                                {error}
                                            </div>
                                        )}

                                        {success && (
                                            <div className="p-3 text-sm bg-green-50 text-green-600 rounded-md text-center border border-green-100">
                                                {success}
                                            </div>
                                        )}

                                        {!isLogin && (
                                            <Field>
                                                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    name="name"
                                                    placeholder="John Doe"
                                                    disabled={isLoading}
                                                    required
                                                />
                                            </Field>
                                        )}

                                        <Field>
                                            <FieldLabel htmlFor="email">Email</FieldLabel>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                placeholder="m@example.com"
                                                disabled={isLoading}
                                                required
                                            />
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="password">Password</FieldLabel>
                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                disabled={isLoading}
                                                required
                                            />
                                        </Field>

                                        <Field>
                                            <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                                                {isLoading ? "Memproses..." : (isLogin ? "Login" : "Sign Up")}
                                            </Button>
                                        </Field>

                                        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                                            <span className="relative z-10 bg-card px-2 text-muted-foreground">
                                                Or continue with
                                            </span>
                                        </div>

                                        <Field className="grid grid-cols-2 gap-4">
                                            <Button
                                                variant="outline"
                                                type="button"
                                                className="cursor-pointer"
                                                onClick={() => handleSocialLogin('apple')}
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
                                                className="cursor-pointer"
                                                onClick={() => handleSocialLogin('google')}
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
                                            {isLogin ? (
                                                <>
                                                    Don&apos;t have an account?{" "}
                                                    <button
                                                        type="button"
                                                        onClick={() => setMode('signup')}
                                                        className="underline cursor-pointer underline-offset-4 hover:text-primary"
                                                        disabled={isLoading}
                                                    >
                                                        Sign up
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    Already have an account?{" "}
                                                    <button
                                                        type="button"
                                                        onClick={() => setMode('signin')}
                                                        className="underline cursor-pointer underline-offset-4 hover:text-primary"
                                                        disabled={isLoading}
                                                    >
                                                        Sign in
                                                    </button>
                                                </>
                                            )}
                                        </FieldDescription>
                                    </FieldGroup>
                                </motion.div>
                            </AnimatePresence>
                        </form>
                    </motion.div>
                </CardContent>
            </Card>
        </div>
    )
}

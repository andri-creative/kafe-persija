"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const redirectByRole = async () => {
        const session = await fetch("/api/auth/session").then((res) => res.json())
        const roles: string[] = session?.user?.roles || []

        if (roles.includes("SUPER_ADMIN") || roles.includes("ADMIN") || roles.includes("MANAGER")) {
            router.push("/dashboard")
        } else if (roles.includes("STAFF")) {
            router.push("/staff/menu");
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
            <Card className="overflow-hidden border border-white/20 shadow-2xl bg-black/50 backdrop-blur-md">
                <CardContent className="p-6 md:p-8">
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center gap-2 text-center">
                                {/* Ubah warna teks menjadi putih */}
                                <h1 className="text-2xl font-bold text-white">
                                    Welcome back
                                </h1>
                                <p className="text-white/80 text-balance">
                                    Login to your Persija Cafe account
                                </p>
                            </div>

                            {error && (
                                <div className="p-3 text-sm bg-red-500/90 text-white rounded-md text-center border border-red-400/50 backdrop-blur-sm">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="p-3 text-sm bg-green-500/90 text-white rounded-md text-center border border-green-400/50 backdrop-blur-sm">
                                    {success}
                                </div>
                            )}

                            <FieldGroup>
                                <Field>
                                    {/* Ubah warna label menjadi putih */}
                                    <FieldLabel htmlFor="email" className="text-white/90">Email</FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="m@example.com"
                                        disabled={isLoading}
                                        required
                                        className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="password" className="text-white/90">Password</FieldLabel>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            disabled={isLoading}
                                            required
                                            className="bg-white/20 border-white/30 text-white pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4 text-white" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-white" />
                                            )}
                                        </button>
                                    </div>
                                </Field>

                                <Field>
                                    {/* Ubah style button */}
                                    <Button
                                        type="submit"
                                        className="w-full cursor-pointer h-11 bg-white/20 hover:bg-white/30 text-white border border-white/30"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Memproses..." : "Login"}
                                    </Button>
                                </Field>

                                <div className="relative flex items-center justify-center gap-4">
                                    <div className="flex-1 h-px bg-white/30"></div>
                                    <span className="text-white/90 text-sm">Or continue with</span>
                                    <div className="flex-1 h-px bg-white/30"></div>
                                </div>

                                <Field className="grid grid-cols-2 gap-4">
                                    <Button
                                        variant="outline"
                                        type="button"
                                        className="cursor-pointer bg-white/20 hover:bg-white/30 text-white border-white/30"
                                        onClick={() => handleSocialLogin('apple')}
                                        disabled={isLoading}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-white">
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
                                        className="cursor-pointer bg-white/20 hover:bg-white/30 text-white border-white/30"
                                        onClick={() => handleSocialLogin('google')}
                                        disabled={isLoading}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-white">
                                            <path
                                                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                        <span className="sr-only">Login with Google</span>
                                    </Button>
                                </Field>
                            </FieldGroup>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
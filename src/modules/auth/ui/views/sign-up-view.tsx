"use client";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, OctagonAlert, Mail, Lock, Github, User } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const signUpSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be less than 50 characters"),
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
    password: z
        .string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z
        .string()
        .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
    </svg>
);

const SignUpView = () => {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState<"google" | "github" | null>(null);

    const form = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = (data: z.infer<typeof signUpSchema>) => {
        setError(null);
        setIsLoading(true);

        console.log("Sign up attempt:", data);
        authClient.signUp.email({
            email: data.email,
            password: data.password,
            name: data.name,
            callbackURL: "/"
        }, {
            onSuccess: () => {
                console.log("Sign up successful");
                setIsLoading(false);
                router.push("/");
            },
            onError: ({ error }) => {
                setIsLoading(false);
                setError(error.message || "An unexpected error occurred. Please try again.");
            },
        });
    };

    const handleSocialSignUp = (provider: "google" | "github") => {
        setError(null);
        setSocialLoading(provider);
        console.log(`Initiating social sign-up with ${provider}`);
        authClient.signIn.social({
            provider: provider,
            callbackURL: "/"
        }, {
            onSuccess: () => {
                console.log("Sign up successful");
                setIsLoading(false);
                router.push("/sign-in");
            },
            onError: ({ error }) => {
                setIsLoading(false);
                setError(error.message || "An unexpected error occurred. Please try again.");
            },
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="w-full max-w-6xl">
                <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
                    <div className="grid md:grid-cols-2 min-h-[700px]">
                        <div className="p-8 md:p-12 flex flex-col justify-center">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                                <CardDescription className="text-gray-600">
                                    Enter your details to get started
                                </CardDescription>
                            </CardHeader>

                            {error && (
                                <Alert variant="destructive" className="mb-6">
                                    <OctagonAlert className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                        <Input
                                                            type="text"
                                                            placeholder="John Doe"
                                                            className="pl-10"
                                                            disabled={isLoading}
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                        <Input
                                                            type="email"
                                                            placeholder="name@example.com"
                                                            className="pl-10"
                                                            disabled={isLoading}
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                        <Input
                                                            type="password"
                                                            placeholder="Create a strong password"
                                                            className="pl-10"
                                                            disabled={isLoading}
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                        <Input
                                                            type="password"
                                                            placeholder="Confirm your password"
                                                            className="pl-10"
                                                            disabled={isLoading}
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Creating account..." : "Sign up"}
                                        </Button>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-white px-2 text-gray-500">Or continue with</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => handleSocialSignUp("google")}
                                            disabled={isLoading || socialLoading !== null}
                                            className="relative"
                                        >
                                            {socialLoading === "google" ? (
                                                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-gray-900" />
                                            ) : (
                                                <GoogleIcon />
                                            )}
                                            <span className="ml-2">Google</span>
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => handleSocialSignUp("github")}
                                            disabled={isLoading || socialLoading !== null}
                                            className="relative"
                                        >
                                            {socialLoading === "github" ? (
                                                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-gray-900" />
                                            ) : (
                                                <Github className="h-5 w-5" />
                                            )}
                                            <span className="ml-2">GitHub</span>
                                        </Button>
                                    </div>

                                    <div className="text-center text-sm">
                                        <span className="text-gray-600">Already have an account? </span>
                                        <Link
                                            href="/sign-in"
                                            className="text-emerald-600 hover:text-emerald-700 font-medium"
                                        >
                                            Sign in
                                        </Link>
                                    </div>
                                </form>
                            </Form>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 relative hidden md:flex flex-col items-center justify-center p-12">
                            <div className="flex flex-col items-center justify-center text-white space-y-6">
                                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                                    <Video className="h-16 w-16 text-white" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h1 className="text-4xl font-bold tracking-tight">Meet AI</h1>
                                    <p className="text-emerald-100 text-lg">Intelligent Meeting Assistant</p>
                                </div>
                                <div className="mt-8 text-center max-w-sm">
                                    <p className="text-emerald-50/90 text-sm leading-relaxed">
                                        Join thousands of teams transforming their meetings with AI-powered insights and automation.
                                    </p>
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignUpView;
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  loadGoogleIdentity,
  promptGoogleIdentity,
  type GoogleCredentialResponse,
} from "@/lib/googleIdentity";

const inputClassName =
  "h-11 pl-10 focus-visible:ring-1 focus-visible:ring-blue-500/40 focus-visible:border-blue-500";

type LoginResponse = {
  message?: string;
};

type GoogleAuthResponse = {
  message?: string;
  success?: boolean;
};

export default function LoginForm() {
  const router = useRouter();
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const validateForm = () => {
    const nextErrors = {
      email: "",
      password: "",
    };

    if (!formData.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean);
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setFormStatus(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setFormStatus(null);

    try {
      const { data } = await axios.post<LoginResponse>("/api/auth/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      setFormStatus({
        type: "success",
        message: data.message || "Signed in successfully.",
      });
      router.push("/");
      router.refresh();
    } catch (error) {
      const axiosError = error as AxiosError<LoginResponse>;

      setFormStatus({
        type: "error",
        message:
          axiosError.response?.data?.message ||
          "Sign in failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        setFormStatus({
          type: "error",
          message: "Google sign-in did not return a credential.",
        });
        return;
      }

      setIsGoogleSubmitting(true);
      setFormStatus(null);

      try {
        const { data } = await axios.post<GoogleAuthResponse>(
          "/api/auth/google",
          {
            idToken: response.credential,
          },
        );

        setFormStatus({
          type: "success",
          message: data.message || "Signed in with Google successfully.",
        });
        router.push("/");
        router.refresh();
      } catch (error) {
        const axiosError = error as AxiosError<GoogleAuthResponse>;

        setFormStatus({
          type: "error",
          message:
            axiosError.response?.data?.message ||
            "Google sign-in failed. Please try again.",
        });
      } finally {
        setIsGoogleSubmitting(false);
      }
    },
    [router],
  );

  const handleGoogleSignIn = async () => {
    if (!googleClientId) {
      setFormStatus({
        type: "error",
        message: "Google client id is not configured.",
      });
      return;
    }

    try {
      await loadGoogleIdentity(googleClientId, handleGoogleCredential);
    } catch {
      setFormStatus({
        type: "error",
        message: "Google sign-in could not load. Please try again.",
      });
      return;
    }

    setFormStatus(null);

    promptGoogleIdentity((notification) => {
      if (
        notification.isNotDisplayed() ||
        notification.isSkippedMoment() ||
        notification.isDismissedMoment()
      ) {
        setFormStatus({
          type: "error",
          message: "Google sign-in was not completed.",
        });
      }
    });
  };

  useEffect(() => {
    if (!googleClientId) {
      return;
    }

    loadGoogleIdentity(googleClientId, handleGoogleCredential).catch(() => {
      setFormStatus({
        type: "error",
        message: "Google sign-in could not load. Please refresh the page.",
      });
    });
  }, [googleClientId, handleGoogleCredential]);

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>

        <p className="mt-2 text-gray-500">Sign in to continue to ShopHub.</p>
      </div>

      <form className="space-y-4" noValidate onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email Address
          </label>

          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="Enter your email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={inputClassName}
            />
          </div>
          {errors.email ? (
            <p id="email-error" className="text-xs font-medium text-red-600">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Password
          </label>

          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="Enter your password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              className={`${inputClassName} pr-11`}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.password ? (
            <p id="password-error" className="text-xs font-medium text-red-600">
              {errors.password}
            </p>
          ) : null}
        </div>

        {formStatus ? (
          <p
            className={`text-center text-sm font-medium ${
              formStatus.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {formStatus.message}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-500">OR</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={isGoogleSubmitting}
        onClick={handleGoogleSignIn}
        className="w-full h-11 gap-2"
      >
        <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
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
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
          />
        </svg>
        {isGoogleSubmitting ? "Signing in..." : "Continue with Google"}
      </Button>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="font-semibold text-blue-600 hover:text-blue-700"
        >
          Create Account
        </Link>
      </p>
    </div>
  );
}

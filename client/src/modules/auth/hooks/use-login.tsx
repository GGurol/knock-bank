"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LoginUserPayload, LoginUserSchema } from "@/modules/auth/auth.type";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useLogin() {
  const router = useRouter();
  const form = useForm<LoginUserPayload>({
    resolver: zodResolver(LoginUserSchema),
    defaultValues: {
      cpf: "",
      password: "",
    },
  });

  const { mutateAsync: signInMutation, isPending } = useMutation({
    mutationFn: async (data: LoginUserPayload) => {
      // Clean the CPF before sending it to the API
      const cleanedData = {
        ...data,
        cpf: data.cpf.replace(/\D/g, ''),
      };

      const response = await signIn("credentials", {
        ...cleanedData,
        redirect: false,
      });

      // If the signIn response has an error, throw a generic error
      // This will be caught by the onError handler below.
      if (response?.error) {
        throw new Error(response.error);
      }
    },
    onSuccess: () => {
      toast.success("Successfully connected.");
      router.push("/dashboard");
    },
    // CORRECTED: Simplified error handling
    onError: (error: Error) => {
      // This will now display the actual error message from the backend
      // (e.g., "Invalid credentials") directly in the toast.
      toast.error(error.message);
    },
  });

  const handleLogin = (data: LoginUserPayload) => signInMutation(data);

  return {
    form,
    isPending,
    handleLogin,
  };
}
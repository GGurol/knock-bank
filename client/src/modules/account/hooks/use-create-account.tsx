import {
  CreateAccountPayload,
  CreateAccountSchema,
} from "@/modules/account/account.type";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Api, API_URL, ApiError, ApiUnprocessableEntityError } from "@/lib/api"; 
import { AccountService } from "../account.service";
import { toast } from "sonner";
import { useState } from "react";

export function useCreateAccount() {
  const api = new Api(API_URL);
  const accountService = new AccountService(api);

  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<CreateAccountPayload>({
    resolver: zodResolver(CreateAccountSchema),
    defaultValues: {
      name: "",
      cpf: "",
      birthDate: "",
      password: "",
      accountType: 1,
    },
  });

  const { mutateAsync: createAccountMutation, isPending } = useMutation({
    mutationFn: (data: CreateAccountPayload) => {
      return accountService.createAccount(data);
    },
    onSuccess: (result) => {
      toast.success(result.message);
      form.reset();
      setIsOpen(false);
    },
    onError: (error) => {
      if (error instanceof ApiUnprocessableEntityError && error.detail) {
        try {
          const errorDetails = error.detail as any[];
          const formattedErrors = errorDetails
            .map(err => `${err.loc[1]}: ${err.msg}`)
            .join('\n');
          toast.error(formattedErrors);
        } catch {
          toast.error(JSON.stringify(error.detail));
        }
        return;
      }

      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("An unexpected error occurred.");
    },
  });

  const handleCreateAccount = (data: CreateAccountPayload) => {
    // --- CORRECTED LOGIC: Clean the CPF before sending ---
    const cleanedData = {
      ...data,
      cpf: data.cpf.replace(/\D/g, ''), // This removes all non-digit characters
    };
    
    // Pass the cleaned data to the API mutation
    createAccountMutation(cleanedData);
  };

  return {
    form,
    isPending,
    handleCreateAccount,
    modal: {
      isOpen,
      setIsOpen,
    },
  };
}
import { z } from "zod";
// The cpf validator is no longer needed for login
// import { cpf } from "cpf-cnpj-validator";

export const LoginUserSchema = z.object({
  // --- CPF VALIDATION SIMPLIFIED FOR LOGIN ---
  cpf: z
    .string()
    .trim()
    .min(1, "CPF is required."), // Basic check to ensure it's not empty
  
  password: z.string().trim().min(1, "Password is required."),
});

export type LoginUserPayload = z.infer<typeof LoginUserSchema>;

export type LoginUserResponse = {
  type: string;
  accessToken: string;
};
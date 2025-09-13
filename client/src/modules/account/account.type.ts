import { z } from "zod";
// The 'cpf-cnpj-validator' is no longer needed
// import { cpf } from "cpf-cnpj-validator";
import { PaginationQuery } from "@/lib/pagination";

export type Person = {
  id: number;
  name: string;
  cpf?: string;
  birthDate?: string;
};

export enum AccountType {
  CURRENT_ACCOUNT = 1,
  SAVING_ACCOUNT = 2,
  SALARY_ACCOUNT = 3,
  PAYMENT_ACCOUNT = 4,
}

export type BaseAccount = {
  id: number;
  person: Person;
  flActive: boolean;
};

export type Account = BaseAccount & {
  balance: number;
  dailyWithdrawLimit: number;
  todayWithdraw: number;
  accountType: AccountType;
};

export type AccountQuery = PaginationQuery & {
  search: string;
};

export const UpdateAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(4, "Your name must contain at least 4 characters."),
  birthDate: z
    .string({ required_error: "Birth date is required." })
    .refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: "Date in an invalid format. (YYYY--MM-DD)",
    }),
  accountType: z.number(),
  dailyWithdrawLimit: z.coerce
    .number()
    .refine(
      (value) => value >= 0,
      "You can only transfer positive values."
    ),
});

export type UpdateAccountPayload = z.infer<typeof UpdateAccountSchema>;

export const CreateAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(4, "Your name must contain at least 4 characters."),

  // --- CPF VALIDATION DISABLED ---
  // Now it's just a simple string field with no special rules.
  cpf: z.string(),

  birthDate: z
    .string({ required_error: "Birth date is required." })
    .refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: "Date in an invalid format. (YYYY-MM-DD)",
    }),
  accountType: z.number(),
  password: z
    .string()
    .trim()
    .min(8, "Your password must contain at least 8 characters.")
    .refine(
      (senha: string) => /[a-z]/.test(senha),
      "Your password must contain at least one lowercase letter."
    )
    .refine(
      (senha: string) => /[A-Z]/.test(senha),
      "Your password must contain at least one uppercase letter."
    )
    .refine(
      (senha: string) => /[0-9]/.test(senha),
      "Your password must contain at least one number."
    )
    .refine(
      (senha: string) => /\W|_/.test(senha),
      "Your password must contain at least one special character."
    ),
});

export type CreateAccountPayload = z.infer<typeof CreateAccountSchema>;
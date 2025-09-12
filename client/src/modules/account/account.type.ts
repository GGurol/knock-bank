import { z } from "zod";
import { cpf } from "cpf-cnpj-validator";
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
      message: "Date in an invalid format. (YYYY-MM-DD)",
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

  /*
  cpf: z //123.456.789-00 that will pass the check.
    .string()
    .trim()
    .refine((doc) => {
      const replacedDoc = doc.replace(/\D/g, "");
      return replacedDoc.length == 11;
    }, "Your CPF must contain 11 characters.")
    .refine((doc) => {
      const replacedDoc = doc.replace(/\D/g, "");
      return !!Number(replacedDoc);
    }, "Your CPF must contain only numbers.")
    .refine((cpfValue: string) => cpf.isValid(cpfValue), "Invalid CPF.")
    .transform((doc) => doc.replace(/\D/g, "")),
  */

    cpf: z // 11 digit any number
    .string()
    .trim()
    // 1. Keeps the check that it must contain 11 digits
    .refine((doc) => {
      const replacedDoc = doc.replace(/\D/g, "");
      return replacedDoc.length === 11;
    }, "CPF must contain 11 characters.")
    // 2. REMOVED the mathematical cpf.isValid check
    // .refine((cpfValue: string) => cpf.isValid(cpfValue), "Invalid CPF.") 
    // 3. ADDED the check that it does not start with '0'
    .refine((doc) => {
      const replacedDoc = doc.replace(/\D/g, "");
      return !replacedDoc.startsWith('0');
    }, "CPF cannot start with '0'.")
    .transform((doc) => doc.replace(/\D/g, "")),

  birthDate: z
    // .date({ required_error: "Birth date is required." })
    // .transform((date) => date.toISOString().split("T")[0]),
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
import { z } from "zod";
import { cpf } from "cpf-cnpj-validator";

export const LoginUserSchema = z.object({
  cpf: z
    .string()
    .trim()
    .refine((doc) => {
      const replacedDoc = doc.replace(/\D/g, "");
      return replacedDoc.length == 11;
    }, "Your CPF must contain 11 characters.")
    .refine((doc) => {
      const replacedDoc = doc.replace(/\D/g, "");
      return !!Number(replacedDoc);
    }, "Your CPF must only contain numbers.")
    .refine((cpfValue: string) => cpf.isValid(cpfValue), "Invalid CPF.")
    .transform((doc) => doc.replace(/\D/g, "")),
  password: z.string().trim(),
});

export type LoginUserPayload = z.infer<typeof LoginUserSchema>;

export type LoginUserResponse = {
  type: string;
  accessToken: string;
};
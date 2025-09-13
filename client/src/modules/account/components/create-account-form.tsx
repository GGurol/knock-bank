"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/date-picker";
import { AccountType } from "@/modules/account/account.type";
import { formatCpf } from "@/lib/masks";
import { useCreateAccount } from "@/modules/account/hooks/use-create-account";
import { Loader2 } from "lucide-react";

export function CreateAccountForm() {
  const { form, isPending, handleCreateAccount, modal } = useCreateAccount();

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.setIsOpen}>
      <DialogTrigger asChild>
        <Button className="text-xl py-8 px-10 rounded-2xl lg:max-w-60 hover:cursor-pointer">
          Create your account
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-sm rounded-lg lg:rounded-sm lg:max-w-xl">
        <DialogHeader>
          <DialogTitle> Create your account </DialogTitle>
          <DialogDescription>
            Fill in the information below to complete your registration.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateAccount)}
            autoComplete="off"
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
                  </FormControl>
                  <FormDescription>Enter your full name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cpf"
              render={({ field: { onChange, ...props } }) => (
                <FormItem>
                  <FormLabel> Cpf (Taxpayer Registry Number)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="000.000.000-14"
                      onChange={(event) => {
                        const { value } = event.target;
                        event.target.value = formatCpf(value);
                        onChange(event);
                      }}
                      {...props}
                    />
                  </FormControl>
                  <FormDescription>
                    Your Individual Taxpayer Registry (CPF)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      onChange={(value: Date) => {
                        const [datePart] = value.toISOString().split("T");
                        field.onChange(datePart);
                      }}
                      disableDays={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Your date of birth is used to calculate your age.
                  </FormDescription>
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
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormDescription>Enter a strong password</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> Account Type </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={String(field.value)}
                    >
                      <SelectTrigger className="w-full focus:outline-primary">
                        <SelectValue placeholder="Select the account type…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Account Types </SelectLabel>
                          <SelectItem value={`${AccountType.CURRENT_ACCOUNT}`}>
                            Checking Account
                          </SelectItem>
                          <SelectItem value={`${AccountType.PAYMENT_ACCOUNT}`}>
                            Payment Account
                          </SelectItem>
                          <SelectItem value={`${AccountType.SAVING_ACCOUNT}`}>
                            Savings Account
                          </SelectItem>
                          <SelectItem value={`${AccountType.SALARY_ACCOUNT}`}>
                            Salary Account
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Type of account you want to open
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={isPending}
                className="w-full max-w-52 hover:cursor-pointer"
              >
                Register{" "}
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

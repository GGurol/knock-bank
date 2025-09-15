import { ComponentProps, forwardRef, ChangeEvent } from "react";
import { Input } from "./ui/input";
import { formatCurrency } from "@/lib/masks";

// This defines the props that our component will accept.
// It's designed to be compatible with react-hook-form's <Controller>.
interface MoneyInputProps extends Omit<ComponentProps<"input">, "onChange" | 'value'> {
  value?: number; // It receives the value as a number from the form state
  onChange?: (value: number) => void; // It will call onChange with a number
}

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    
    // This function handles the user's typing.
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      // Get the user's raw input (e.g., "$1,234.56")
      const inputValue = event.target.value;
      
      // Remove all non-digit characters to get a clean string (e.g., "123456")
      const digitsOnly = inputValue.replace(/\D/g, "");

      // If the user deletes everything, the value is 0.
      if (digitsOnly === "") {
        onChange?.(0);
        return;
      }

      // Convert the digits to a number and handle the decimal part correctly.
      const numberValue = Number(digitsOnly) / 100;

      // If an onChange handler was provided (from react-hook-form),
      // call it directly with the new numeric value.
      if (onChange) {
        onChange(numberValue);
      }
    };

    // We take the numeric value from the form state (e.g., 1234.56)
    // and format it for display purposes only (e.g., "$1,234.56").
    const displayValue = formatCurrency(value);

    return (
      <Input
        type="text" // Use text type to allow for currency symbols and commas
        placeholder="$ 0.00"
        ref={ref}
        value={displayValue}
        onChange={handleInputChange}
        {...props}
      />
    );
  }
);
MoneyInput.displayName = "Money Input";
import type { FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { PasswordInput } from "./ui/password-input";
import { Textarea } from "./ui/textarea";

type CustomInputProps<T extends FieldValues> = {
  control: any;
  name: FieldPath<T>;
  type: "text" | "email" | "password" | "number" | "textarea" | "select";
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  formItemClassName?: string;
};

const CustomInput = <T extends FieldValues>({
  control,
  name,
  type,
  label,
  placeholder,
  description,
  disabled = false,
  readOnly = true,
  className,
  formItemClassName,
}: CustomInputProps<T>) => {
  const renderInput = (field: any) => {
    switch (type) {
      // Password gets its own branch so every field routed through
      // CustomInput picks up the show/hide toggle, rather than each call site
      // having to know to reach for PasswordInput directly.
      case "password":
        return (
          <PasswordInput
            placeholder={placeholder}
            {...field}
            disabled={disabled}
            className={cn(
              // Mirrors ui/input.tsx so the two render identically; the
              // toggle needs a positioned wrapper, which Input does not have.
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
              "font-sans!",
              className,
            )}
            readOnly={false}
          />
        );
      case "text":
      case "email":
      case "number":
        return (
          <Input
            type={type}
            placeholder={placeholder}
            {...field}
            disabled={disabled}
            className={cn("font-sans!", className)}
            readOnly={false}
          />
        );
      case "textarea":
        return (
          <Textarea
            placeholder={placeholder}
            {...field}
            disabled={disabled}
            className={cn("overflow-y-scroll h-42 font-sans!", className)}
            readOnly={false}
          />
        );

      default:
        return (
          <Input
            type="text"
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            className={className}
            {...field}
          />
        );
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={formItemClassName}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>{renderInput(field)}</FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CustomInput;

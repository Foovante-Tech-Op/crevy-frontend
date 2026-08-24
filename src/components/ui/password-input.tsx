"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type"> & {
  /** Classes for the positioning wrapper, not the input itself. */
  wrapperClassName?: string;
};

/**
 * A password field with a show/hide toggle.
 *
 * Drop-in for a bare `<input type="password">`: `className` still lands on the
 * input, so each call site keeps its own styling rather than being pulled onto
 * a shared look. Only `pr-10` is added, to stop long values running underneath
 * the toggle.
 *
 * `ref` is deliberately NOT pulled out of props. React 19 passes it through as
 * an ordinary prop, which is what lets `{...form.register("password")}` keep
 * working — react-hook-form's returned object carries its own `ref`, and
 * destructuring it here (or wrapping in forwardRef and overriding) would
 * disconnect the field from the form and make it permanently invalid.
 */
export function PasswordInput({
  className,
  wrapperClassName,
  disabled,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const describedBy = useId();

  return (
    <div className={cn("relative", wrapperClassName)}>
      <input
        {...props}
        disabled={disabled}
        type={visible ? "text" : "password"}
        className={cn(className, "pr-10")}
      />
      <button
        type="button"
        // type="button" is load-bearing: the default inside a <form> is
        // "submit", so without it revealing the password submits the form.
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        aria-controls={describedBy}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition-colors hover:text-slate-700 focus-visible:outline-none focus-visible:text-slate-900 disabled:pointer-events-none disabled:opacity-50"
      >
        {visible ? (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

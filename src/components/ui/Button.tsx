import type { ButtonHTMLAttributes } from "react";

import { clsx } from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-surface-raised hover:bg-primary-hover focus-visible:outline-primary",
  secondary:
    "bg-surface-raised text-text shadow-soft hover:bg-surface focus-visible:outline-accent",
  ghost:
    "bg-transparent text-text hover:bg-surface/70 focus-visible:outline-accent",
};

export function Button({
  className,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-11 items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition-colors duration-150 ease-settled disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className,
      )}
      type={type}
      {...props}
    />
  );
}

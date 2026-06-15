import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "outline";

const variantClasses: Record<Variant, string> = {
  primary: "bg-blue-600 text-white active:bg-blue-700 disabled:bg-slate-300",
  secondary: "bg-slate-600 text-white active:bg-slate-700 disabled:bg-slate-300",
  danger: "bg-red-600 text-white active:bg-red-700 disabled:bg-slate-300",
  outline:
    "bg-white text-slate-700 border-2 border-slate-300 active:bg-slate-100 disabled:text-slate-300",
};

const baseClasses =
  "w-full rounded-2xl px-4 py-4 text-lg font-bold shadow-sm transition-colors disabled:cursor-not-allowed text-center";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`${baseClasses} ${variantClasses[variant]} ${className} block`}>
      {children}
    </Link>
  );
}

import clsx from "clsx";
import Link from "next/link";
import type { ComponentProps } from "react";

export function OutlineLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={clsx(
        "inline-flex h-10 w-full items-center justify-center px-5",
        "bg-e2e-button-fill type-button-s text-e2e-text-soft inset-ring-[0.5px] inset-ring-e2e-button-stroke",
        "transition-[color,box-shadow] hover:text-e2e-text-bright hover:inset-ring-e2e-paper-0 motion-reduce:transition-none",
        "focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-e2e-white-60",
        className,
      )}
      {...props}
    />
  );
}

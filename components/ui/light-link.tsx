import clsx from "clsx";
import type { ComponentProps } from "react";

// LightButton's look for a link to another site.
export function LightLink({ className, ...props }: ComponentProps<"a">) {
  return (
    <a
      className={clsx(
        "inline-flex h-10 w-full items-center justify-center gap-1.5 px-5 whitespace-nowrap",
        "bg-e2e-button-fill-solid type-button-s font-medium text-e2e-text-on-light",
        "transition-colors duration-200 motion-reduce:transition-none",
        "hover:bg-e2e-paper-0 focus-visible:bg-e2e-paper-0",
        "focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-e2e-button-stroke",
        className,
      )}
      {...props}
    />
  );
}

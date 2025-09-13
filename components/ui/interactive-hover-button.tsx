import React from "react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  children?: React.ReactNode;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative w-auto min-w-32 cursor-pointer overflow-hidden rounded-full border bg-background p-3 text-center font-semibold flex items-center justify-center gap-2",
        className,
      )}
      {...props}
    >
      <span className="relative z-20 flex items-center gap-2 transition-all duration-300 group-hover:text-primary-foreground">
        {children}
        {text}
      </span>
      <div className="absolute left-2 top-2 h-2 w-2 scale-[1] rounded-full bg-primary transition-all duration-500 group-hover:left-0 group-hover:top-0 group-hover:h-full group-hover:w-full group-hover:scale-[1] group-hover:bg-primary z-10"></div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
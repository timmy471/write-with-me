import React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textfield = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        {...props}
        className={cn(
          "w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-transparent",
          className
        )}
      />
    );
  }
);
Textfield.displayName = "Textfield";

export { Textfield };

import React from "react";
import { cn } from "../../lib/utils";

export const Card = ({ className, children, ...props }) => (
  <div className={cn("rounded-xl border bg-white p-4 shadow", className)} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ className, ...props }) => (
  <div className={cn("pb-4", className)} {...props} />
);

export const CardTitle = ({ className, ...props }) => (
  <h3 className={cn("text-lg font-semibold", className)} {...props} />
);

export const CardContent = ({ className, ...props }) => (
  <div className={cn("pt-2", className)} {...props} />
);

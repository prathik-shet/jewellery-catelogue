import React from "react";

export const Select = ({ children }) => (
  <div className="relative">{children}</div>
);

export const SelectTrigger = ({ className, ...props }) => (
  <button
    className={`w-full px-3 py-2 border rounded-md text-left ${className}`}
    {...props}
  />
);

export const SelectValue = ({ children }) => (
  <span>{children}</span>
);

export const SelectContent = ({ children }) => (
  <div className="absolute mt-1 w-full border bg-white rounded-md shadow">
    {children}
  </div>
);

export const SelectItem = ({ children, onClick }) => (
  <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={onClick}>
    {children}
  </div>
);

export const Input = ({ className, ...props }) => (
  <input
    className={`border px-3 py-2 rounded-md outline-none ${className}`}
    {...props}
  />
);

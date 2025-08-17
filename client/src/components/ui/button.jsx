export const Button = ({ className, ...props }) => (
  <button
    className={`px-4 py-2 bg-black text-white rounded-md hover:opacity-90 ${className}`}
    {...props}
  />
);

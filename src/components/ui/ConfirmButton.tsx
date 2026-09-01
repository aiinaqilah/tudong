"use client";

export default function ConfirmButton({
  confirmMessage,
  children,
  className,
}: {
  confirmMessage: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
      className={className}
    >
      {children}
    </button>
  );
}

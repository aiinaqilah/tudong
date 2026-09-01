"use client";

import { useRef } from "react";

export default function ConfirmForm({
  action,
  confirmMessage,
  children,
  className,
}: {
  action: (formData: FormData) => void;
  confirmMessage: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={ref}
      action={(formData) => {
        if (!confirm(confirmMessage)) return;
        action(formData);
      }}
      className={className}
    >
      {children}
    </form>
  );
}

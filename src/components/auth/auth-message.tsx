import {
  getAuthErrorMessage,
  getAuthStatusMessage
} from "@/lib/auth/messages";

type AuthMessageProps = {
  error?: string | string[];
  status?: string | string[];
};

export function AuthMessage({ error, status }: AuthMessageProps) {
  const errorMessage = getAuthErrorMessage(error);
  const statusMessage = getAuthStatusMessage(status);

  if (!errorMessage && !statusMessage) {
    return null;
  }

  if (errorMessage) {
    return (
      <p
        className="rounded-md border border-[#f1b7b7] bg-[#fff2f2] px-4 py-3 text-sm font-medium text-[#8a1f1f]"
        role="alert"
      >
        {errorMessage}
      </p>
    );
  }

  return (
    <p
      className="rounded-md border border-[#b8dbc9] bg-[#f0faf5] px-4 py-3 text-sm font-medium text-[#155b38]"
      role="status"
    >
      {statusMessage}
    </p>
  );
}

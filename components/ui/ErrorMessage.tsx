interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div
      className="p-4 rounded-lg text-center"
      style={{
        backgroundColor: 'var(--tg-theme-secondary-bg-color)',
        color: 'var(--tg-theme-destructive-text-color)',
      }}
    >
      <p>{message}</p>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div
        className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
        style={{
          borderColor: 'var(--tg-theme-button-color, #f5c518)',
          borderTopColor: 'transparent',
        }}
      />
    </div>
  );
}

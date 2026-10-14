type StatusBarProps = {
  health: string;
  failed: boolean;
  onRetry: () => void;
};

export function StatusBar({ health, failed, onRetry }: StatusBarProps) {
  return (
    <footer className="statusbar">
      <span role="status">API {health}</span>
      {failed ? (
        <button type="button" className="text-button" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </footer>
  );
}

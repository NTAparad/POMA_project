export default function Alert({ type = 'error', children }) {
  if (!children) return null;
  const styles = {
    error: 'border-signal/30 bg-signal-soft text-signal',
    success: 'border-done/30 bg-done/10 text-done',
    info: 'border-ink-100 bg-ink-50 text-ink-700',
  };
  return (
    <div role="alert" className={`rounded-lg border px-3 py-2 text-sm ${styles[type]}`}>{children}</div>
  );
}

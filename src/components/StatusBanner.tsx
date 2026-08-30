interface Props {
  kind: "error" | "not-journey";
  title: string;
  message: string;
}

export function StatusBanner({ kind, title, message }: Props) {
  return (
    <div className="status-banner" data-kind={kind} role="alert">
      <span className="status-banner__title">{title}</span>
      <p className="status-banner__body">{message}</p>
    </div>
  );
}

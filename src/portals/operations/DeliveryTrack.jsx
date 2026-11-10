import { statusClass, trackSteps } from "./data";

export function DeliveryTrack({ status }) {
  if (status === "Cancelled") return null;
  const at = trackSteps.indexOf(status);
  return (
    <ol className="delivery-track" aria-label={`Progress: ${status}`}>
      {trackSteps.map((step, i) => (
        <li key={step} className={i < at || status === "Completed" ? "done" : i === at ? "current" : ""}>
          <span />{step}
        </li>
      ))}
    </ol>
  );
}

export function StatusBadge({ status }) {
  return <span className={`status-badge ${statusClass[status]}`}>{status}</span>;
}

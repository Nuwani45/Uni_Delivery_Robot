import { useState } from "react";
import { Icon } from "../../components/Icon";
import { initialStations, stationName } from "../../data/stations";

/* Delivery request entry point: INTERFACE ONLY.
 * The form keeps its values in local state so people can try it, but nothing
 * is validated, saved or sent anywhere, and the submit button is disabled.
 * Real request handling will be added in a later stage. */
export function RequestDelivery({ user }) {
  const [destination, setDestination] = useState("");
  const [item, setItem] = useState("");
  const [recipient, setRecipient] = useState(user?.displayName || "");
  const [notes, setNotes] = useState("");

  return (
    <div className="c-page">
      <header className="c-page-head">
        <p className="c-eyebrow">Request delivery</p>
        <h1>Request a delivery</h1>
        <p className="c-lead">Tell us what you'd like delivered and where it should go.</p>
      </header>

      <section className="c-card c-note c-note-warn" role="note">
        <Icon g="info" />
        <p>
          <strong>Not available yet.</strong> This is a preview of the request form.
          Nothing you enter here is saved or sent, and the robot cannot be requested yet.
        </p>
      </section>

      <form className="c-card c-form" onSubmit={(event) => event.preventDefault()}>
        <div className="c-field">
          <label htmlFor="req-destination">Destination station</label>
          <select
            id="req-destination"
            className="c-input"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
          >
            <option value="">Select a station</option>
            {initialStations.map((station) => (
              <option key={station.id} value={station.id}>{stationName(station)}</option>
            ))}
          </select>
        </div>

        <div className="c-field">
          <label htmlFor="req-item">What are you sending?</label>
          <input
            id="req-item"
            className="c-input"
            type="text"
            value={item}
            onChange={(event) => setItem(event.target.value)}
            placeholder="For example: lab notes, a small parcel"
          />
        </div>

        <div className="c-field">
          <label htmlFor="req-recipient">Recipient name</label>
          <input
            id="req-recipient"
            className="c-input"
            type="text"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            placeholder="Who will collect it?"
          />
        </div>

        <div className="c-field">
          <label htmlFor="req-notes">Notes (optional)</label>
          <textarea
            id="req-notes"
            className="c-input c-textarea"
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Anything the operator should know"
          />
        </div>

        <button className="c-btn c-btn-primary c-btn-block" type="submit" disabled>
          Submit request (not available yet)
        </button>
      </form>
    </div>
  );
}

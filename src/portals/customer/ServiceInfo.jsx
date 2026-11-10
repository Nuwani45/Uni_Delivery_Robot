import { Icon } from "../../components/Icon";
import { PLANNED_FLOW, SERVICE_FACTS } from "./customerContent";

export function ServiceInfo() {
  return (
    <div className="c-page">
      <header className="c-page-head">
        <p className="c-eyebrow">Service information</p>
        <h1>About UniDelivery</h1>
        <p className="c-lead">
          UniDelivery is an autonomous indoor delivery robot designed to carry items
          between locations around the university campus.
        </p>
      </header>

      <section className="c-card c-note" role="note">
        <Icon g="info" />
        <p>
          UniDelivery is still in development. The steps below describe how the service
          is planned to work, and items marked "To be confirmed" are not final.
        </p>
      </section>

      <section aria-labelledby="facts-title">
        <h2 id="facts-title" className="c-section-title">At a glance</h2>
        <dl className="c-grid c-grid-2 c-facts">
          {SERVICE_FACTS.map((fact) => (
            <div key={fact.label} className="c-card c-fact">
              <span className="c-icon-tile"><Icon g={fact.icon} /></span>
              <div>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="flow-title">
        <h2 id="flow-title" className="c-section-title">Planned service flow</h2>
        <ol className="c-steps">
          {PLANNED_FLOW.map((step, index) => (
            <li key={step.title} className="c-card c-step">
              <span className="c-step-number">{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

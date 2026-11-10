import { Icon } from "../../components/Icon";
import { FAQS, SUPPORT_CONTACT } from "./customerContent";

export function HelpSupport() {
  return (
    <div className="c-page">
      <header className="c-page-head">
        <p className="c-eyebrow">Help and support</p>
        <h1>How can we help?</h1>
        <p className="c-lead">Answers to common questions about UniDelivery and your account.</p>
      </header>

      <section aria-labelledby="faq-title">
        <h2 id="faq-title" className="c-section-title">Frequently asked questions</h2>
        <div className="c-faq">
          {FAQS.map((item) => (
            <details key={item.q} className="c-card c-faq-item">
              <summary>
                <span>{item.q}</span>
                <span className="c-faq-chevron" aria-hidden="true"><Icon g="arrowRight" /></span>
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section aria-labelledby="contact-title">
        <h2 id="contact-title" className="c-section-title">Contact the team</h2>
        <div className="c-card c-contact">
          <div className="c-contact-row">
            <span className="c-icon-tile"><Icon g="mail" /></span>
            <div><strong>Email</strong><p>{SUPPORT_CONTACT.email}</p></div>
          </div>
          <div className="c-contact-row">
            <span className="c-icon-tile"><Icon g="clock" /></span>
            <div><strong>Support hours</strong><p>{SUPPORT_CONTACT.hours}</p></div>
          </div>
          <div className="c-contact-row">
            <span className="c-icon-tile"><Icon g="pin" /></span>
            <div><strong>Where to find us</strong><p>{SUPPORT_CONTACT.location}</p></div>
          </div>
        </div>
      </section>
    </div>
  );
}

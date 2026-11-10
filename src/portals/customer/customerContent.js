/* Text content for the Customer Portal.
 * Edit this file to update wording, service facts and FAQs without touching
 * the components. Anything marked "To be confirmed" is a placeholder that the
 * UniDelivery team still needs to fill in; none of it is a real commitment. */

export const SERVICE_STATUS = {
  label: "In development",
  detail:
    "Delivery requests are not open yet. You can explore the service and preview the request form.",
};

export const PLANNED_FLOW = [
  {
    title: "Request",
    text: "Choose a destination station and describe the item you want delivered.",
  },
  {
    title: "Prepare",
    text: "An operator prepares your item and loads it into one of the robot's locked drawers.",
  },
  {
    title: "Delivery",
    text: "The robot travels to the destination station on its own.",
  },
  {
    title: "Collect",
    text: "On arrival, enter your PIN on the robot's keypad to unlock the drawer and collect your item.",
  },
];

export const SERVICE_FACTS = [
  { icon: "info", label: "Service status", value: "In development" },
  { icon: "clock", label: "Service hours", value: "To be confirmed" },
  { icon: "pin", label: "Coverage", value: "Indoor campus areas. Stations to be announced." },
  { icon: "package", label: "Item size and weight", value: "To be confirmed" },
  { icon: "lock", label: "Handover", value: "PIN-protected drawers (planned)" },
];

export const FAQS = [
  {
    q: "How do I request a delivery?",
    a: "Delivery requests are not available yet. The Request delivery page shows a preview of the form. Nothing you enter there is saved or sent.",
  },
  {
    q: "What can the robot carry?",
    a: "Item size, weight and any restricted items are still to be confirmed. Check this page again once the service opens.",
  },
  {
    q: "How will I collect my delivery?",
    a: "The planned process is that the robot arrives at your station and you enter a PIN on its keypad to unlock the drawer. This is not active yet.",
  },
  {
    q: "I can't sign in or my account looks wrong.",
    a: "Check that you are using the email address you registered with. If you still have problems, contact the UniDelivery team using the details below.",
  },
  {
    q: "I'm staff, but I see the customer portal.",
    a: "Staff accounts are set up by an administrator. Ask them to assign the right role to your account, then sign out and sign in again.",
  },
];

/* Replace these with real contact details when they are available. */
export const SUPPORT_CONTACT = {
  email: "To be confirmed",
  hours: "To be confirmed",
  location: "To be confirmed",
};

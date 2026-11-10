/* The UniDelivery "UD" mark. Same markup and classes as the original logo. */
export function BrandMark() {
  return <div className="brand-mark">U<span>D</span></div>;
}

export function BrandLockup({ subtitle = "Robotics systems" }) {
  return (
    <div className="brand-lockup">
      <BrandMark />
      <div className="brand-name">
        <strong>UniDelivery</strong>
        <small>{subtitle}</small>
      </div>
    </div>
  );
}

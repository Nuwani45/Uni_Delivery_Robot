import { useRef, useState } from "react";

export function Joystick({ onMove }) {
  const padRef = useRef(null);
  const lastLabel = useRef("Idle");
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  function publish(x, y) {
    setPos({ x, y });
    const vertical = y > 0.35 ? "Forward" : y < -0.35 ? "Backward" : "";
    const horizontal = x > 0.35 ? "Right" : x < -0.35 ? "Left" : "";
    const label = [vertical, horizontal].filter(Boolean).join(" ") || "Idle";
    if (label !== lastLabel.current) {
      lastLabel.current = label;
      onMove(label);
    }
  }

  function update(event) {
    const rect = padRef.current.getBoundingClientRect();
    const radius = rect.width / 2;
    const travel = radius * 0.62;
    let dx = event.clientX - (rect.left + radius);
    let dy = event.clientY - (rect.top + radius);
    const distance = Math.hypot(dx, dy);
    if (distance > travel) {
      dx = (dx / distance) * travel;
      dy = (dy / distance) * travel;
    }
    publish(Math.round((dx / travel) * 100) / 100, Math.round((-dy / travel) * 100) / 100);
  }

  function release() {
    setActive(false);
    publish(0, 0);
  }

  function handleKey(event, pressed) {
    const keys = { ArrowUp: [0, 1], ArrowDown: [0, -1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
    if (!keys[event.key]) return;
    event.preventDefault();
    if (pressed) publish(...keys[event.key]);
    else publish(0, 0);
  }

  const power = Math.min(1, Math.hypot(pos.x, pos.y));

  return (
    <>
      <div
        ref={padRef}
        className={active ? "joystick-pad active" : "joystick-pad"}
        role="application"
        aria-label="Joystick. Drag, or use the arrow keys, to steer the robot."
        tabIndex={0}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          setActive(true);
          update(event);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) update(event);
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onKeyDown={(event) => handleKey(event, true)}
        onKeyUp={(event) => handleKey(event, false)}
      >
        <span
          className="joystick-knob"
          style={{ left: `${50 + pos.x * 31}%`, top: `${50 - pos.y * 31}%` }}
        />
      </div>
      <div className="joystick-readout">
        <span><small>X</small><strong>{pos.x.toFixed(2)}</strong></span>
        <span><small>Y</small><strong>{pos.y.toFixed(2)}</strong></span>
        <span><small>Speed</small><strong>{Math.round(power * 100)}%</strong></span>
      </div>
    </>
  );
}

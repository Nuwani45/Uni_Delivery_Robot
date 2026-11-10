import { useEffect, useState } from "react";
import { Icon } from "../../components/Icon";
import { DashboardShell } from "../../components/DashboardShell";
import { initialStations, pad, stationName } from "../../data/stations";
import { DeliveryTrack, StatusBadge } from "./DeliveryTrack";
import {
  operationsNavItems,
  stationLayout,
  ROBOT_STEP,
  PREPARING_MS,
  COLLECTING_MS,
  DEMO_PIN,
  initialRobot,
  lockedDrawers,
  getRoute,
  getPathPoints,
} from "./data";

export function OperationsDashboard({ onHome, user, onLogout, onSwitch, switchTargets }) {
  const [page, setPage] = useState("Operations Overview");
  const [deliveries, setDeliveries] = useState([]);
  const [nextNumber, setNextNumber] = useState(1);
  const [robot, setRobot] = useState(initialRobot);
  const [drawers, setDrawers] = useState(lockedDrawers);
  const [form, setForm] = useState({
    stationId: 1,
    drawer: 1,
    item: "",
    recipient: "",
  });
  const [formError, setFormError] = useState("");
  const [lastCreated, setLastCreated] = useState("");
  const [pin, setPin] = useState("");
  const [pinMessage, setPinMessage] = useState(null);

  const nextId = `DEL-${String(nextNumber).padStart(3, "0")}`;
  const activeDelivery = deliveries.find((item) => item.id === robot.activeId);
  const activeStation = initialStations.find((item) => item.id === robot.stationId);
  const robotBusy = robot.phase !== "idle";

  const pendingCount = deliveries.filter((item) => item.status === "Pending").length;
  const completedCount = deliveries.filter((item) => item.status === "Completed").length;

  const phaseLabels = {
    idle: "Idle – waiting at dock",
    preparing: "Preparing for delivery",
    outbound: "Moving to destination",
    arrived: "Arrived – awaiting PIN",
    collecting: "Drawer unlocked",
    returning: "Returning to dock",
  };

  const locationLabel =
    robot.phase === "outbound" || robot.phase === "returning"
      ? "In corridor (moving)"
      : (robot.phase === "arrived" || robot.phase === "collecting") && activeStation
        ? stationName(activeStation)
        : "Charging dock";

  const destinationLabel = activeStation ? stationName(activeStation) : "None";

  // Robot movement simulation: advance a few pixels every 100 ms.
  useEffect(() => {
    if (robot.phase !== "outbound" && robot.phase !== "returning") return undefined;

    const timer = setInterval(() => {
      setRobot((prev) => {
        if (prev.phase !== "outbound" && prev.phase !== "returning") return prev;
        const route = getRoute(prev.phase, prev.stationId);
        const target = route[prev.routeIndex];
        if (!target) return prev;

        const dx = target.x - prev.x;
        const dy = target.y - prev.y;
        const distance = Math.hypot(dx, dy);
        const battery = Math.max(20, prev.battery - 0.03);
        const angle = distance > 0 ? (Math.atan2(dy, dx) * 180) / Math.PI : prev.angle;

        if (distance <= ROBOT_STEP) {
          const nextIndex = prev.routeIndex + 1;
          const base = { ...prev, x: target.x, y: target.y, angle, battery };
          if (nextIndex < route.length) return { ...base, routeIndex: nextIndex };
          if (prev.phase === "outbound") return { ...base, routeIndex: 0, phase: "arrived" };
          return {
            ...base,
            routeIndex: 0,
            phase: "idle",
            angle: 0,
            activeId: null,
            stationId: null,
          };
        }

        return {
          ...prev,
          x: prev.x + (dx / distance) * ROBOT_STEP,
          y: prev.y + (dy / distance) * ROBOT_STEP,
          angle,
          battery,
        };
      });
    }, 100);

    return () => clearInterval(timer);
  }, [robot.phase]);

  // Preparing -> In Transit after a short delay.
  useEffect(() => {
    if (robot.phase !== "preparing") return undefined;
    const timer = setTimeout(() => {
      setDeliveries((prev) =>
        prev.map((item) =>
          item.id === robot.activeId ? { ...item, status: "In Transit" } : item
        )
      );
      setRobot((prev) => ({ ...prev, phase: "outbound", routeIndex: 0 }));
    }, PREPARING_MS);
    return () => clearTimeout(timer);
  }, [robot.phase, robot.activeId]);

  // Robot reaches destination -> mark delivery Arrived.
  useEffect(() => {
    if (robot.phase !== "arrived") return;
    setDeliveries((prev) =>
      prev.map((item) =>
        item.id === robot.activeId && item.status === "In Transit"
          ? { ...item, status: "Arrived" }
          : item
      )
    );
  }, [robot.phase, robot.activeId]);

  // After the drawer has been open for a while, lock it and return to dock.
  useEffect(() => {
    if (robot.phase !== "collecting") return undefined;
    const timer = setTimeout(() => {
      setDrawers(lockedDrawers);
      setRobot((prev) => ({ ...prev, phase: "returning", routeIndex: 0 }));
    }, COLLECTING_MS);
    return () => clearTimeout(timer);
  }, [robot.phase]);

  function createDelivery() {
    const item = form.item.trim();
    if (!item) {
      setFormError("Please describe the item to be delivered.");
      return;
    }
    const created = {
      id: nextId,
      stationId: form.stationId,
      drawer: form.drawer,
      item,
      recipient: form.recipient.trim(),
      status: "Pending",
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setDeliveries((prev) => [...prev, created]);
    setNextNumber((number) => number + 1);
    setForm((prev) => ({ ...prev, item: "", recipient: "" }));
    setFormError("");
    setLastCreated(created.id);
  }

  function startDelivery(id) {
    if (robot.phase !== "idle") return;
    const target = deliveries.find((item) => item.id === id);
    if (!target || target.status !== "Pending") return;
    setDeliveries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "Preparing" } : item))
    );
    setDrawers(lockedDrawers);
    setPin("");
    setPinMessage(null);
    setRobot((prev) => ({
      ...prev,
      phase: "preparing",
      activeId: id,
      stationId: target.stationId,
      routeIndex: 0,
    }));
  }

  function cancelDelivery(id) {
    setDeliveries((prev) =>
      prev.map((item) =>
        item.id === id && (item.status === "Pending" || item.status === "Preparing")
          ? { ...item, status: "Cancelled" }
          : item
      )
    );
    if (robot.activeId === id && robot.phase === "preparing") {
      setRobot((prev) => ({ ...prev, phase: "idle", activeId: null, stationId: null }));
    }
  }

  function cancelAndReturn() {
    if (robot.phase !== "arrived") return;
    setDeliveries((prev) =>
      prev.map((item) =>
        item.id === robot.activeId ? { ...item, status: "Cancelled" } : item
      )
    );
    setDrawers(lockedDrawers);
    setPin("");
    setPinMessage(null);
    setRobot((prev) => ({ ...prev, phase: "returning", routeIndex: 0 }));
  }

  function verifyPin() {
    if (robot.phase !== "arrived" || !activeDelivery) return;
    if (pin === DEMO_PIN) {
      setDrawers((prev) => ({ ...prev, [activeDelivery.drawer]: "Unlocked" }));
      setDeliveries((prev) =>
        prev.map((item) =>
          item.id === activeDelivery.id ? { ...item, status: "Completed" } : item
        )
      );
      setRobot((prev) => ({ ...prev, phase: "collecting" }));
      setPinMessage({
        type: "success",
        text: `PIN accepted (simulated). Drawer ${activeDelivery.drawer} unlocked.`,
      });
    } else {
      setPinMessage({
        type: "error",
        text: "Incorrect PIN (simulated). The drawer remains locked.",
      });
    }
    setPin("");
  }

  function goTo(label) {
    setPage(label);
  }

  const progress =
    activeDelivery?.status === "Completed" ? 4 : activeDelivery?.status === "Arrived" ? 1 : 0;
  const completionSteps = [
    "Robot arrived",
    "PIN entered on robot keypad",
    "Drawer unlocked",
    "Delivery completed",
  ];

  const pathPoints = getPathPoints(robot.phase, robot.stationId);
  const traveled = pathPoints.length === 0 ? [] :
    robot.phase === "arrived" || robot.phase === "collecting"
      ? pathPoints
      : [...pathPoints.slice(0, robot.routeIndex + 1), { x: robot.x, y: robot.y }];

  const overviewCards = [
    ["◈", "cyan", "ROBOT", "Operating Status", phaseLabels[robot.phase], "Simulated status"],
    [
      "☰",
      "violet",
      "DELIVERY",
      "Current Delivery",
      activeDelivery ? `${activeDelivery.id} · ${activeDelivery.status}` : "No active delivery",
      "Simulated status",
    ],
    ["⌖", "green", "DESTINATION", "Current Destination", destinationLabel, "Simulated route"],
    [
      "⌁",
      "amber",
      "POWER",
      "Battery Level",
      `${Math.round(robot.battery)} %`,
      "Simulated value",
    ],
    ["◎", "cyan", "LOCATION", "Robot Location", locationLabel, "Simulated position"],
    [
      "▤",
      "green",
      "DRAWERS",
      "Drawer Lock State",
      `D1 ${drawers[1]} · D2 ${drawers[2]}`,
      "Simulated lock",
    ],
    ["◌", "amber", "QUEUE", "Pending Deliveries", pad(pendingCount), "Waiting to start"],
    ["✓", "green", "HISTORY", "Completed Deliveries", pad(completedCount), "This session"],
  ];

  return (
    <DashboardShell
      sidebarLabel="Operations"
      navItems={operationsNavItems}
      page={page}
      onNavigate={goTo}
      onHome={onHome}
      eyebrow="Operations"
      subtitle="Manage deliveries, select destinations and monitor robot activity."
      robotInfo={{ name: "UniDelivery Robot", line: "Operations Console · v1.0" }}
      footerText="Operations Console v1.0"
      user={user}
      onLogout={onLogout}
      onSwitch={onSwitch}
      switchTargets={switchTargets}
      view="operations"
      alerts={robot.phase === "arrived" ? 1 : 0}
    >
      {robot.phase === "arrived" && page !== "Delivery Completion" && (
        <div className="alert-banner" role="status">
          <span className="alert-icon">!</span>
          <p>
            <strong>Robot arrived</strong> at {destinationLabel} with{" "}
            {activeDelivery?.id}. Waiting for the recipient to enter a PIN on the
            robot keypad.
          </p>
          <button className="secondary-button" onClick={() => goTo("Delivery Completion")}>
            View arrival
          </button>
        </div>
      )}

      {page === "Operations Overview" && (
        <>
          <section className="section">
            <div className="section-heading">
              <div>
                <div className="section-kicker">LIVE SUMMARY</div>
                <h2>Operations Overview</h2>
                <p>Robot and delivery status. All values are simulated.</p>
              </div>
              <span className="tag">Simulated data</span>
            </div>

            <div className="kpi-grid">
              <div className="kpi">
                <span className="mini-label">Robot status</span>
                <strong>{phaseLabels[robot.phase]}</strong>
                <span className={robotBusy ? "health warn" : "health ok"}>{robotBusy ? "Active" : "Ready"}</span>
              </div>
              <div className="kpi">
                <span className="mini-label">Total deliveries</span>
                <strong>{pad(deliveries.length)}</strong>
                <small>{completedCount} completed · {pendingCount} pending</small>
              </div>
              <div className="kpi">
                <span className="mini-label">Battery level</span>
                <strong>{Math.round(robot.battery)}%</strong>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${robot.battery}%` }} /></div>
              </div>
              <div className="kpi">
                <span className="mini-label">System health</span>
                <strong>{robot.battery < 30 ? "Low battery" : "Healthy"}</strong>
                <span className={robot.battery < 30 ? "health warn" : "health ok"}>{robot.battery < 30 ? "Attention" : "All checks passed"}</span>
              </div>
            </div>

            <div className="overview-grid">
              {overviewCards.map(([icon, tone, label, title, value, note]) => (
                <div className="stat-card" key={title}>
                  <div className="stat-card-top">
                    <span className={`stat-icon ${tone}`}><Icon g={icon} /></span>
                    <span className="mini-label">{label}</span>
                  </div>
                  <p>{title}</p>
                  <h3 className="text-value">{value}</h3>
                  <small className="muted-note">{note}</small>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="section-heading">
              <div>
                <div className="section-kicker">QUICK ACTIONS</div>
                <h2>Get Started</h2>
                <p>Create a delivery, start it from the queue and watch the robot.</p>
              </div>
            </div>
            <div className="mapping-actions">
              <button className="primary-button" onClick={() => goTo("Create Delivery")}>
                ＋ Create a Delivery
              </button>
              <button className="secondary-button" onClick={() => goTo("Delivery Queue")}>
                View Delivery Queue
              </button>
              <button className="secondary-button" onClick={() => goTo("Live Monitoring")}>
                Open Live Monitoring
              </button>
            </div>
            <div className="notice">
              <span className="notice-icon">i</span>
              <p>
                This dashboard is a frontend simulation. Robot movement, battery,
                location and drawer states are generated in the browser and are
                not real hardware readings.
              </p>
            </div>
          </section>
        </>
      )}

      {page === "Create Delivery" && (
        <section className="section">
          <div className="section-heading">
            <div>
              <div className="section-kicker">NEW REQUEST</div>
              <h2>Create a Delivery</h2>
              <p>Choose a destination and drawer, then add the item details.</p>
            </div>
          </div>

          <div className="form-card">
            <div className="field">
              <label className="field-label" htmlFor="delivery-id">DELIVERY ID (AUTOMATIC)</label>
              <input id="delivery-id" className="text-input" value={nextId} readOnly />
            </div>

            <div className="field">
              <span className="field-label">DESTINATION</span>
              <div className="dest-grid">
                {initialStations.map((station) => (
                  <button
                    type="button"
                    key={station.id}
                    className={form.stationId === station.id ? "dest-option selected" : "dest-option"}
                    onClick={() => setForm((prev) => ({ ...prev, stationId: station.id }))}
                    aria-pressed={form.stationId === station.id}
                  >
                    <span className={`mini-marker ${station.color.toLowerCase()}`}>{station.symbol}</span>
                    <span className="dest-text">
                      <strong>Station {pad(station.id)} – {station.room}</strong>
                      <small>{station.color} marker</small>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <span className="field-label">DRAWER</span>
              <div className="drawer-grid">
                {[1, 2].map((number) => (
                  <button
                    type="button"
                    key={number}
                    className={form.drawer === number ? "dest-option selected" : "dest-option"}
                    onClick={() => setForm((prev) => ({ ...prev, drawer: number }))}
                    aria-pressed={form.drawer === number}
                  >
                    <span className="mini-marker drawer-marker">{number}</span>
                    <span className="dest-text">
                      <strong>Drawer {number}</strong>
                      <small>Secure storage compartment</small>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="delivery-item">ITEM DESCRIPTION</label>
              <input
                id="delivery-item"
                className="text-input"
                placeholder="e.g. Lab report folder"
                maxLength={80}
                value={form.item}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, item: event.target.value }));
                  setFormError("");
                }}
              />
              {formError && <div className="form-error">{formError}</div>}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="delivery-recipient">RECIPIENT NAME (OPTIONAL)</label>
              <input
                id="delivery-recipient"
                className="text-input"
                placeholder="e.g. Dr. Perera"
                maxLength={60}
                value={form.recipient}
                onChange={(event) => setForm((prev) => ({ ...prev, recipient: event.target.value }))}
              />
            </div>

            <button className="primary-button form-submit" onClick={createDelivery}>
              ＋ Create Delivery
            </button>

            {lastCreated && (
              <div className="success-banner" role="status">
                <span>✓ {lastCreated} added to the delivery queue.</span>
                <button className="text-button" onClick={() => goTo("Delivery Queue")}>
                  View queue
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {page === "Delivery Queue" && (
        <section className="section">
          <div className="section-heading">
            <div>
              <div className="section-kicker">DELIVERY MANAGEMENT</div>
              <h2>Delivery Queue</h2>
              <p>Start or cancel deliveries and follow their status.</p>
            </div>
            <span className="count-label">{pad(deliveries.length)} DELIVERIES</span>
          </div>

          {robotBusy && (
            <div className="notice queue-notice">
              <span className="notice-icon">i</span>
              <p>
                The robot is busy{activeDelivery ? ` with ${activeDelivery.id}` : ""}. Pending
                deliveries can be started once it is back at the dock.
              </p>
            </div>
          )}

          {deliveries.length === 0 ? (
            <div className="empty-state">
              <strong>No deliveries yet</strong>
              <p>Create a delivery and it will appear here.</p>
              <button className="primary-button" onClick={() => goTo("Create Delivery")}>
                ＋ Create a Delivery
              </button>
            </div>
          ) : (
            <div className="delivery-list">
              {[...deliveries].reverse().map((item) => {
                const station = initialStations.find((s) => s.id === item.stationId);
                return (
                  <div className="delivery-card" key={item.id}>
                    <div className="delivery-cell delivery-main">
                      <strong>{item.id}</strong>
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="delivery-cell">
                      <span className="field-label">DESTINATION</span>
                      <span className="dest-inline">
                        <span className={`mini-marker small ${station.color.toLowerCase()}`}>{station.symbol}</span>
                        {stationName(station)}
                      </span>
                    </div>
                    <div className="delivery-cell">
                      <span className="field-label">DRAWER</span>
                      <span>Drawer {item.drawer}</span>
                    </div>
                    <div className="delivery-cell delivery-item">
                      <span className="field-label">ITEM</span>
                      <span>{item.item}</span>
                      {item.recipient && <small>For {item.recipient}</small>}
                    </div>
                    <div className="delivery-cell">
                      <span className="field-label">CREATED</span>
                      <span>{item.createdAt}</span>
                    </div>
                    <DeliveryTrack status={item.status} />
                    <div className="delivery-actions">
                      {item.status === "Pending" && (
                        <>
                          <button
                            className="primary-button"
                            onClick={() => startDelivery(item.id)}
                            disabled={robotBusy}
                            title={robotBusy ? "Robot is busy" : "Start this delivery"}
                          >
                            ▶ Start
                          </button>
                          <button className="stop-button" onClick={() => cancelDelivery(item.id)}>
                            Cancel
                          </button>
                        </>
                      )}
                      {item.status === "Preparing" && (
                        <button className="stop-button" onClick={() => cancelDelivery(item.id)}>
                          Cancel
                        </button>
                      )}
                      {item.status === "In Transit" && (
                        <button className="secondary-button" onClick={() => goTo("Live Monitoring")}>
                          Track
                        </button>
                      )}
                      {item.status === "Arrived" && (
                        <button className="secondary-button" onClick={() => goTo("Delivery Completion")}>
                          Open arrival
                        </button>
                      )}
                      {(item.status === "Completed" || item.status === "Cancelled") && (
                        <span className="no-action">No actions</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {page === "Live Monitoring" && (
        <section className="section">
          <div className="section-heading">
            <div>
              <div className="section-kicker">ROBOT TRACKING</div>
              <h2>Live Robot Monitoring</h2>
              <p>Top-down view of the delivery route.</p>
            </div>
            <span className="tag">Frontend simulation</span>
          </div>

          <div className="monitor-layout">
            <div className="map-card">
              <svg
                className="map-svg"
                viewBox="0 0 600 300"
                role="img"
                aria-label="Simulated top-down map showing the robot, corridor, dock and four rooms"
              >
                <defs>
                  <pattern id="map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M20 0H0V20" className="map-grid-line" />
                  </pattern>
                </defs>
                <rect width="600" height="300" fill="url(#map-grid)" />
                <rect className="map-corridor" x="30" y="130" width="540" height="40" rx="6" />
                {initialStations.map((station) => {
                  const layout = stationLayout[station.id];
                  return (
                    <g key={station.id}>
                      <rect
                        className={robot.stationId === station.id ? "map-room target" : "map-room"}
                        x={layout.roomX}
                        y={layout.roomY}
                        width="100"
                        height="110"
                        rx="6"
                      />
                      <text
                        className="map-label"
                        x={layout.x}
                        y={station.id % 2 === 1 ? layout.roomY + 16 : layout.roomY + 100}
                        textAnchor="middle"
                      >
                        ROOM {pad(station.id)}
                      </text>
                      <circle
                        className={`map-marker ${station.color.toLowerCase()}`}
                        cx={layout.x}
                        cy={layout.y}
                        r="11"
                      />
                      <text className="map-marker-text" x={layout.x} y={layout.y + 4} textAnchor="middle">
                        {station.symbol}
                      </text>
                    </g>
                  );
                })}
                <rect className="map-obstacle" x="290" y="133" width="24" height="8" rx="2" />
                <rect className="map-obstacle" x="470" y="159" width="24" height="8" rx="2" />
                {initialStations.map((s) => (
                  <rect key={`desk-${s.id}`} className="map-obstacle" x={stationLayout[s.id].roomX + 12} y={stationLayout[s.id].roomY + (s.id % 2 ? 62 : 28)} width="30" height="14" rx="2" />
                ))}
                <rect className="map-dock" x="30" y="130" width="60" height="40" rx="6" />
                <text className="map-label" x="60" y="184" textAnchor="middle">DOCK</text>

                {pathPoints.length > 0 && (
                  <polyline
                    className="map-route"
                    points={pathPoints.map((point) => `${point.x},${point.y}`).join(" ")}
                  />
                )}

                {traveled.length > 1 && (
                  <polyline className="map-done" points={traveled.map((p) => `${p.x},${p.y}`).join(" ")} />
                )}
                <g transform={`translate(${robot.x} ${robot.y}) rotate(${robot.angle})`}>
                  <rect className="robot-body" x="-15" y="-11" width="30" height="22" rx="5" />
                  <rect className="robot-drawer" x="-10" y="-7" width="9" height="14" rx="2" />
                  <rect className="robot-drawer" x="1" y="-7" width="9" height="14" rx="2" />
                  <rect className="robot-front" x="12" y="-6" width="4" height="12" rx="2" />
                </g>
              </svg>
              <div className="map-legend">
                <span><i className="legend-robot" /> Robot</span>
                <span><i className="legend-route" /> Planned route</span>
                <span><i className="legend-dock" /> Charging dock</span>
                <span><i className="legend-done" /> Completed route</span>
                <span><i className="legend-obstacle" /> Obstacle</span>
              </div>
            </div>

            <div className="info-panel">
              <div className="info-row">
                <span className="field-label">MOVEMENT STATUS</span>
                <strong>{phaseLabels[robot.phase]}</strong>
              </div>
              <div className="info-row">
                <span className="field-label">CURRENT LOCATION</span>
                <strong>{locationLabel}</strong>
              </div>
              <div className="info-row">
                <span className="field-label">DESTINATION</span>
                <strong>{destinationLabel}</strong>
              </div>
              <div className="info-row">
                <span className="field-label">ACTIVE DELIVERY</span>
                <strong>{activeDelivery ? activeDelivery.id : "None"}</strong>
              </div>
              <div className="info-row">
                <span className="field-label">BATTERY (SIMULATED)</span>
                <strong>{Math.round(robot.battery)} %</strong>
              </div>
              <div className="notice">
                <span className="notice-icon">i</span>
                <p>
                  Simulation only. Positions are generated in the browser and are
                  not real SLAM or odometry data.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {page === "Delivery Completion" && (
        <section className="section">
          <div className="section-heading">
            <div>
              <div className="section-kicker">HANDOVER</div>
              <h2>Delivery Completion</h2>
              <p>Arrival status, drawer lock state and completion progress.</p>
            </div>
            <span className="tag">Simulated workflow</span>
          </div>

          <div className="completion-layout">
            <div className="form-card">
              <div className="completion-head">
                <div>
                  <span className="field-label">CURRENT HANDOVER</span>
                  <h3>
                    {robot.phase === "arrived" || robot.phase === "collecting"
                      ? `${activeDelivery?.id} at ${destinationLabel}`
                      : "No robot at a destination"}
                  </h3>
                </div>
                {activeDelivery && <StatusBadge status={activeDelivery.status} />}
              </div>

              <ol className="step-list">
                {completionSteps.map((label, index) => (
                  <li
                    key={label}
                    className={
                      index < progress ? "done" : index === progress && robot.phase === "arrived" ? "current" : ""
                    }
                  >
                    <span className="step-number">{index < progress ? "✓" : index + 1}</span>
                    {label}
                  </li>
                ))}
              </ol>

              <div className="lock-grid">
                {[1, 2].map((number) => (
                  <div
                    key={number}
                    className={drawers[number] === "Unlocked" ? "lock-card unlocked" : "lock-card"}
                  >
                    <span className="field-label">DRAWER {number}</span>
                    <strong>{drawers[number] === "Unlocked" ? "🔓 Unlocked" : "🔒 Locked"}</strong>
                    <small>Simulated lock state</small>
                  </div>
                ))}
              </div>

              {robot.phase === "collecting" && (
                <div className="success-banner" role="status">
                  <span>✓ Delivery completed. The drawer will lock and the robot will return to the dock.</span>
                </div>
              )}
            </div>

            <div className="form-card pin-panel">
              <span className="section-kicker">DEMONSTRATION ONLY</span>
              <h3>Simulated Keypad PIN</h3>
              <p>
                In the real system the recipient enters the PIN on the robot's
                physical keypad. This control stands in for that keypad so the
                workflow can be demonstrated.
              </p>
              <label className="field-label" htmlFor="pin-input">DEMO PIN: {DEMO_PIN}</label>
              <input
                id="pin-input"
                className="text-input pin-input"
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                placeholder="----"
                value={pin}
                disabled={robot.phase !== "arrived"}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
              />
              <button
                className="primary-button"
                onClick={verifyPin}
                disabled={robot.phase !== "arrived" || pin.length !== 4}
              >
                Simulate PIN Entry
              </button>
              <button
                className="stop-button"
                onClick={cancelAndReturn}
                disabled={robot.phase !== "arrived"}
              >
                Cancel &amp; Return to Dock
              </button>
              {pinMessage && (
                <div className={pinMessage.type === "success" ? "success-banner" : "form-error"} role="status">
                  {pinMessage.text}
                </div>
              )}
              <div className="notice">
                <span className="notice-icon">!</span>
                <p>
                  Real PIN verification and drawer unlocking require hardware
                  integration (keypad, microcontroller and drawer locks). Nothing
                  here controls a physical lock.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </DashboardShell>
  );
}

import { useEffect, useState } from "react";
import "./App.css";

/* ==========================================================================
   SHARED DATA
   ========================================================================== */

const initialMotors = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  pwm: 0,
  direction: "Forward",
  running: false,
}));

const initialStations = [
  { id: 1, color: "Red", room: "Room 01", symbol: "R", registered: true },
  { id: 2, color: "Blue", room: "Room 02", symbol: "B", registered: true },
  { id: 3, color: "Green", room: "Room 03", symbol: "G", registered: true },
  { id: 4, color: "Yellow", room: "Room 04", symbol: "Y", registered: true },
];

const pad = (number) => String(number).padStart(2, "0");

const stationName = (station) => `Station ${pad(station.id)} – ${station.room}`;

const navigationItems = [
  { label: "Overview", icon: "▦" },
  { label: "Motor Control", icon: "⚙" },
  { label: "Mapping & Navigation", icon: "⌖" },
  { label: "Cooling System", icon: "❄" },
  { label: "Indicators", icon: "◉" },
  { label: "Sensor Monitoring", icon: "⌁" },
  { label: "Manual Control", icon: "✥" },
];

const navigationDiagnostics = [
  ["SLAM", "Not connected"],
  ["Map Data", "Not available"],
  ["Robot Position", "Not available"],
  ["Path Planning", "Not active"],
  ["Obstacle Avoidance", "Not connected"],
  ["Marker Recognition", "Not connected"],
  ["Wheel Odometry", "Not connected"],
  ["IMU Localisation", "Not connected"],
];

const sensorReadings = [
  ["LiDAR / ToF", "Not connected"],
  ["RGB Camera", "Not connected"],
  ["RGB Colour Sensor", "Not connected"],
  ["Temperature", "-- °C"],
  ["Battery Voltage", "-- V"],
  ["Wheel Encoders", "Not connected"],
  ["IMU", "Not connected"],
  ["Obstacle Sensors", "Not connected"],
];

/* ==========================================================================
   OPERATIONS DATA (simulation only)
   ========================================================================== */

const operationsNavItems = [
  { label: "Operations Overview", icon: "▦" },
  { label: "Create Delivery", icon: "＋" },
  { label: "Delivery Queue", icon: "☰" },
  { label: "Live Monitoring", icon: "◎" },
  { label: "Delivery Completion", icon: "✓" },
];

// Positions inside the 600 x 300 simulated map. Rooms open onto a corridor at y = 150.
const DOCK = { x: 60, y: 150 };
const CORRIDOR_Y = 150;
const stationLayout = {
  1: { x: 190, y: 80, roomX: 140, roomY: 20 },
  2: { x: 190, y: 220, roomX: 140, roomY: 170 },
  3: { x: 410, y: 80, roomX: 360, roomY: 20 },
  4: { x: 410, y: 220, roomX: 360, roomY: 170 },
};

const ROBOT_STEP = 6; // pixels moved every 100 ms
const PREPARING_MS = 2500;
const COLLECTING_MS = 4000;
const DEMO_PIN = "1234";

const statusClass = {
  Pending: "s-pending",
  Preparing: "s-preparing",
  "In Transit": "s-transit",
  Arrived: "s-arrived",
  Completed: "s-completed",
  Cancelled: "s-cancelled",
};

const initialRobot = {
  phase: "idle", // idle | preparing | outbound | arrived | collecting | returning
  x: DOCK.x,
  y: DOCK.y,
  angle: 0,
  battery: 86,
  activeId: null,
  stationId: null,
  routeIndex: 0,
};

const lockedDrawers = { 1: "Locked", 2: "Locked" };

// Points the robot still has to reach (excluding where it starts).
function getRoute(phase, stationId) {
  const layout = stationLayout[stationId];
  if (!layout) return [];
  const junction = { x: layout.x, y: CORRIDOR_Y };
  return phase === "returning"
    ? [junction, DOCK]
    : [junction, { x: layout.x, y: layout.y }];
}

// Full path used for drawing the route line.
function getPathPoints(phase, stationId) {
  const layout = stationLayout[stationId];
  if (!layout) return [];
  const junction = { x: layout.x, y: CORRIDOR_Y };
  const room = { x: layout.x, y: layout.y };
  return phase === "returning" ? [room, junction, DOCK] : [DOCK, junction, room];
}

/* ==========================================================================
   SHARED DASHBOARD SHELL (sidebar + top bar + footer)
   ========================================================================== */

function DashboardShell({
  sidebarLabel,
  navItems,
  page,
  onNavigate,
  onHome,
  eyebrow,
  subtitle,
  robotInfo,
  footerText,
  children,
}) {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div>
          <div className="brand-lockup">
            <div className="brand-mark">U<span>D</span></div>
            <div className="brand-name">
              <strong>UniDelivery</strong>
              <small>ROBOTICS SYSTEMS</small>
            </div>
          </div>

          <div className="sidebar-label">{sidebarLabel}</div>

          <nav className="sidebar-nav" aria-label={`${sidebarLabel} navigation`}>
            {navItems.map((item) => (
              <button
                key={item.label}
                className={page === item.label ? "nav-item active" : "nav-item"}
                onClick={() => onNavigate(item.label)}
                aria-current={page === item.label ? "page" : undefined}
                aria-label={item.label}
                title={item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {page === item.label && <span className="active-indicator" />}
              </button>
            ))}
          </nav>

          <div className="sidebar-divider" />
          <button
            className="nav-item portal-link"
            onClick={onHome}
            aria-label="Back to main portal"
            title="Back to main portal"
          >
            <span className="nav-icon">⌂</span>
            <span>Main Portal</span>
          </button>
        </div>

        <div className="sidebar-bottom">
          <div className="robot-avatar">UD</div>
          <div className="sidebar-robot-info">
            <strong>{robotInfo.name}</strong>
            <small>{robotInfo.line}</small>
          </div>
          <span className="sidebar-status-dot" title="Simulation mode" />
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="page-heading">
            <div className="eyebrow">
              UNIDELIVERY <span>/</span> {eyebrow}
            </div>
            <h1>{page}</h1>
            <p>{subtitle}</p>
          </div>

          <div className="topbar-right">
            <button className="secondary-button" onClick={onHome}>
              <span>←</span> Main Portal
            </button>
            <div className="simulation-pill">
              <span className="simulation-dot" />
              SIMULATION MODE
            </div>
            <div className="system-label">
              <span className="system-label-icon">UD</span>
              <span>
                <strong>System Panel</strong>
                <small>Local interface</small>
              </span>
            </div>
          </div>
        </header>

        {children}

        <footer className="app-footer">
          <span><strong>UniDelivery</strong> · Robotics Management System</span>
          <span>{footerText} <i /> Frontend simulation</span>
        </footer>
      </main>
    </div>
  );
}

/* ==========================================================================
   LANDING PORTAL
   ========================================================================== */

function Portal({ onOpen }) {
  return (
    <div className="portal">
      <svg className="portal-art" viewBox="0 0 600 300" aria-hidden="true">
        <path d="M30 150 H570 M190 150 V80 M190 150 V220 M410 150 V80 M410 150 V220" />
        <circle cx="190" cy="80" r="9" />
        <circle cx="190" cy="220" r="9" />
        <circle cx="410" cy="80" r="9" />
        <circle cx="410" cy="220" r="9" />
        <rect x="30" y="136" width="44" height="28" rx="6" />
      </svg>

      <div className="portal-inner">
        <div className="portal-hero">
          <div className="portal-mark">U<span>D</span></div>
          <h1>UniDelivery</h1>
          <div className="portal-subtitle">ROBOTICS MANAGEMENT SYSTEM</div>
          <p>
            Welcome to the UniDelivery control portal. Choose a dashboard to
            maintain the robot's hardware systems or to manage indoor
            deliveries across the university.
          </p>
        </div>

        <div className="portal-cards">
          <article className="portal-card" onClick={() => onOpen("maintenance")}>
            <div className="portal-card-icon">⚙</div>
            <div className="section-kicker">TECHNICAL TEAM</div>
            <h2>Maintenance Dashboard</h2>
            <p>
              Monitor and manage robot hardware, sensors, navigation and
              technical systems.
            </p>
            <button
              className="primary-button portal-button"
              onClick={() => onOpen("maintenance")}
            >
              Open Maintenance Dashboard <span>→</span>
            </button>
          </article>

          <article className="portal-card" onClick={() => onOpen("operations")}>
            <div className="portal-card-icon">☰</div>
            <div className="section-kicker">AUTHORISED OPERATORS</div>
            <h2>Operations Dashboard</h2>
            <p>
              Manage deliveries, select destinations and monitor the robot's
              delivery activities.
            </p>
            <button
              className="primary-button portal-button"
              onClick={() => onOpen("operations")}
            >
              Open Operations Dashboard <span>→</span>
            </button>
          </article>
        </div>

        <div className="portal-note">
          <span className="simulation-dot" />
          FRONTEND SIMULATION · No robot hardware is connected yet
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   MAINTENANCE DASHBOARD (existing features preserved)
   ========================================================================== */

function MaintenanceDashboard({ onHome }) {
  const [page, setPage] = useState("Overview");
  const [motors, setMotors] = useState(initialMotors);
  const [fan, setFan] = useState(false);
  const [mapping, setMapping] = useState("Not Started");
  const [stations] = useState(initialStations);
  const [lights, setLights] = useState({
    power: true,
    running: false,
    delivery: false,
    warning: false,
  });
  const [robotMode, setRobotMode] = useState("Standby");

  function updateMotor(id, changes) {
    setMotors((previous) =>
      previous.map((motor) =>
        motor.id === id ? { ...motor, ...changes } : motor
      )
    );
  }

  function stopAll() {
    setMotors((previous) =>
      previous.map((motor) => ({
        ...motor,
        pwm: 0,
        running: false,
      }))
    );
    setRobotMode("Emergency Stop");
  }

  function toggleLight(name) {
    setLights((previous) => ({
      ...previous,
      [name]: !previous[name],
    }));
  }

  function startMapping() {
    setMapping("Mapping in Progress");
    setRobotMode("Exploration");
  }

  function finishMapping() {
    setMapping("Map Saved");
    setRobotMode("Standby");
  }

  function issueManualCommand(command) {
    setRobotMode(`Manual: ${command}`);
  }

  return (
    <DashboardShell
      sidebarLabel="MAINTENANCE"
      navItems={navigationItems}
      page={page}
      onNavigate={setPage}
      onHome={onHome}
      eyebrow="MAINTENANCE"
      subtitle="Monitor, inspect and manage robot hardware systems."
      robotInfo={{ name: "UniDelivery Robot", line: "Maintenance Panel · v1.2" }}
      footerText="Maintenance Panel v1.2"
    >
      {page === "Overview" && (
        <>
          <section className="section">
            <div className="section-heading">
              <div>
                <div className="section-kicker">SYSTEM SUMMARY</div>
                <h2>Robot Overview</h2>
                <p>Current operating state and hardware summary.</p>
              </div>
            </div>

            <div className="overview-grid">
              <div className="stat-card">
                <div className="stat-card-top">
                  <span className="stat-icon cyan">◈</span>
                  <span className="mini-label">OPERATING MODE</span>
                </div>
                <p>Robot Status</p>
                <h3>{robotMode}</h3>
                <small className="muted-note">Current system state</small>
              </div>
              <div className="stat-card">
                <div className="stat-card-top">
                  <span className="stat-icon green">⌁</span>
                  <span className="mini-label">POWER</span>
                </div>
                <p>Battery Level</p>
                <h3>-- <span className="unit">%</span></h3>
                <small className="muted-note">Awaiting sensor data</small>
              </div>
              <div className="stat-card">
                <div className="stat-card-top">
                  <span className="stat-icon amber">♨</span>
                  <span className="mini-label">THERMAL</span>
                </div>
                <p>Temperature</p>
                <h3>-- <span className="unit">°C</span></h3>
                <small className="muted-note">Awaiting sensor data</small>
              </div>
              <div className="stat-card">
                <div className="stat-card-top">
                  <span className="stat-icon violet">❄</span>
                  <span className="mini-label">COOLING</span>
                </div>
                <p>Cooling Fan</p>
                <h3>{fan ? "ON" : "OFF"}</h3>
                <small className="muted-note">Interface state only</small>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section-heading">
              <div>
                <div className="section-kicker">AUTONOMY</div>
                <h2>Mapping System</h2>
                <p>Environment exploration and map-building status.</p>
              </div>
              <button
                className="text-button"
                onClick={() => setPage("Mapping & Navigation")}
              >
                Open mapping <span>→</span>
              </button>
            </div>

            <div className="mapping-summary">
              <div className="mapping-summary-main">
                <span className="stat-icon cyan">⌖</span>
                <div>
                  <h3>{mapping}</h3>
                  <p>SLAM mapping status</p>
                </div>
              </div>
              <div className="mapping-summary-item">
                <strong>04</strong>
                <p>Planned stations</p>
              </div>
              <div className="mapping-summary-item">
                <strong>--</strong>
                <p>Map coverage</p>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section-heading">
              <div>
                <div className="section-kicker">DRIVE SYSTEM</div>
                <h2>Motor Overview</h2>
                <p>Six motor channels and their current interface values.</p>
              </div>
              <button
                className="text-button"
                onClick={() => setPage("Motor Control")}
              >
                Manage motors <span>→</span>
              </button>
            </div>

            <div className="motor-grid">
              {motors.map((motor) => (
                <div className="motor-card" key={motor.id}>
                  <div className="card-top">
                    <strong>Motor {pad(motor.id)}</strong>
                    <span className={motor.running ? "tag status-active" : "tag"}>
                      <i className="tag-dot" />
                      {motor.running ? "Running" : "Standby"}
                    </span>
                  </div>
                  <h3>{motor.pwm}<small> / 255 PWM</small></h3>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${(motor.pwm / 255) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {page === "Mapping & Navigation" && (
        <>
          <section className="section">
            <div className="section-heading">
              <div>
                <div className="section-kicker">AUTONOMOUS NAVIGATION</div>
                <h2>Autonomous Mapping (SLAM)</h2>
                <p>The robot explores its environment and builds a map.</p>
              </div>
              <span className="tag mapping-state">{mapping}</span>
            </div>

            <div className="mapping-summary">
              <div className="mapping-summary-main">
                <span className="stat-icon cyan">⌖</span>
                <div>
                  <h3>{mapping}</h3>
                  <p>Mapping process</p>
                </div>
              </div>
              <div className="mapping-summary-item">
                <strong>04</strong>
                <p>Station locations planned</p>
              </div>
              <div className="mapping-summary-item">
                <strong>--</strong>
                <p>Mapping coverage</p>
              </div>
            </div>

            <div className="mapping-actions">
              <button className="primary-button" onClick={startMapping}>
                <span>▶</span> Start Mapping Simulation
              </button>
              <button className="secondary-button" onClick={finishMapping}>
                Finish &amp; Save Map Simulation
              </button>
            </div>

            <div className="notice">
              <span className="notice-icon">i</span>
              <p>
                These controls demonstrate the dashboard interface only.
                Actual SLAM mapping requires the robot navigation software
                and compatible ranging sensors.
              </p>
            </div>
          </section>

          <section className="section">
            <div className="section-heading">
              <div>
                <div className="section-kicker">DESTINATIONS</div>
                <h2>Delivery Stations</h2>
                <p>Planned destination markers assigned to rooms.</p>
              </div>
              <span className="count-label">04 STATIONS</span>
            </div>

            <div className="station-grid">
              {stations.map((station) => (
                <div className="station-card" key={station.id}>
                  <div className={`station-marker ${station.color.toLowerCase()}`}>
                    {station.symbol}
                  </div>
                  <div className="station-info">
                    <h3>Station {pad(station.id)}</h3>
                    <p>{station.room}</p>
                    <small>{station.color} marker</small>
                  </div>
                  <span className="tag planned-tag">Planned</span>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="section-heading">
              <div>
                <div className="section-kicker">DIAGNOSTICS</div>
                <h2>Navigation System</h2>
                <p>Localisation, route planning and obstacle detection.</p>
              </div>
            </div>

            <div className="sensor-grid">
              {navigationDiagnostics.map(([name, value]) => (
                <div className="sensor-card" key={name}>
                  <span className="sensor-symbol">⌖</span>
                  <p>{name}</p>
                  <h3>{value}</h3>
                  <small>Awaiting hardware / software</small>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {page === "Motor Control" && (
        <section className="section">
          <div className="section-heading">
            <div>
              <div className="section-kicker">DRIVE SYSTEM</div>
              <h2>Motor Management</h2>
              <p>Adjust PWM values and select motor direction.</p>
            </div>
            <button className="stop-button" onClick={stopAll}>
              ■ Stop All Motors
            </button>
          </div>

          <div className="motor-control-grid">
            {motors.map((motor) => (
              <div className="control-card" key={motor.id}>
                <div className="card-top">
                  <h3>Motor {pad(motor.id)}</h3>
                  <span className={motor.running ? "tag status-active" : "tag"}>
                    <i className="tag-dot" />
                    {motor.running ? "Running" : "Stopped"}
                  </span>
                </div>

                <div className="pwm-display">
                  {motor.pwm}<small> / 255 PWM</small>
                </div>

                <label className="range-label" htmlFor={`motor-${motor.id}-pwm`}>
                  PWM OUTPUT <span>{motor.pwm}</span>
                </label>
                <input
                  id={`motor-${motor.id}-pwm`}
                  type="range"
                  min="0"
                  max="255"
                  value={motor.pwm}
                  onChange={(event) => {
                    const pwm = Number(event.target.value);
                    updateMotor(motor.id, { pwm, running: pwm > 0 });
                  }}
                />

                <div className="direction-label">DIRECTION</div>
                <div className="direction-buttons">
                  <button
                    className={motor.direction === "Forward" ? "selected" : ""}
                    onClick={() => updateMotor(motor.id, { direction: "Forward" })}
                  >
                    Forward
                  </button>
                  <button
                    className={motor.direction === "Reverse" ? "selected" : ""}
                    onClick={() => updateMotor(motor.id, { direction: "Reverse" })}
                  >
                    Reverse
                  </button>
                </div>

                <button
                  className="individual-stop"
                  onClick={() => updateMotor(motor.id, { pwm: 0, running: false })}
                >
                  Stop Motor
                </button>
              </div>
            ))}
          </div>
          <div className="notice">
            <span className="notice-icon">i</span>
            <p>
              Motor values are currently simulated in the frontend. They will
              not drive physical motors until the ESP32 and motor-driver
              communication is connected.
            </p>
          </div>
        </section>
      )}

      {page === "Cooling System" && (
        <section className="section">
          <div className="section-heading">
            <div>
              <div className="section-kicker">THERMAL MANAGEMENT</div>
              <h2>Cooling System</h2>
              <p>Cooling fan control and operating state.</p>
            </div>
          </div>

          <div className="cooling-card">
            <div className="fan-icon">❄</div>
            <div className="section-kicker">MAIN COOLING UNIT</div>
            <h2>Main Cooling Fan</h2>
            <p>Fan operating state shown by the interface.</p>
            <div className={fan ? "large-status fan-on" : "large-status"}>
              <span className="status-dot" />
              {fan ? "FAN RUNNING" : "FAN OFF"}
            </div>
            <button className="primary-button cooling-toggle" onClick={() => setFan(!fan)}>
              {fan ? "Turn Fan OFF" : "Turn Fan ON"}
            </button>
            <small className="cooling-footnote">Simulation control · Hardware not connected</small>
          </div>
        </section>
      )}

      {page === "Indicators" && (
        <section className="section">
          <div className="section-heading">
            <div>
              <div className="section-kicker">STATUS OUTPUTS</div>
              <h2>Indicator Lights</h2>
              <p>Toggle the interface states of the robot indicators.</p>
            </div>
          </div>

          <div className="indicator-grid">
            {Object.entries(lights).map(([name, value]) => (
              <div className="indicator-card" key={name}>
                <div
                  className={value
                    ? `indicator-light ${name}`
                    : "indicator-light inactive-light"}
                />
                <div className="mini-label">INDICATOR OUTPUT</div>
                <h3>{name.charAt(0).toUpperCase() + name.slice(1)} Light</h3>
                <p className={value ? "indicator-state is-on" : "indicator-state"}>
                  {value ? "ON" : "OFF"}
                </p>
                <button onClick={() => toggleLight(name)}>
                  {value ? "Switch OFF" : "Switch ON"}
                </button>
              </div>
            ))}
          </div>
          <div className="notice">
            <span className="notice-icon">i</span>
            <p>Indicator toggles currently change only the frontend simulation state.</p>
          </div>
        </section>
      )}

      {page === "Sensor Monitoring" && (
        <section className="section">
          <div className="section-heading">
            <div>
              <div className="section-kicker">INPUT DEVICES</div>
              <h2>Sensor Monitoring</h2>
              <p>Connection and reading status for planned robot sensors.</p>
            </div>
            <span className="count-label">08 SENSOR GROUPS</span>
          </div>

          <div className="sensor-grid">
            {sensorReadings.map(([name, value]) => (
              <div className="sensor-card" key={name}>
                <span className="sensor-symbol">⌁</span>
                <p>{name}</p>
                <h3>{value}</h3>
                <small>Waiting for hardware connection</small>
              </div>
            ))}
          </div>
        </section>
      )}

      {page === "Manual Control" && (
        <section className="section">
          <div className="section-heading">
            <div>
              <div className="section-kicker">MANUAL OVERRIDE</div>
              <h2>Manual Control</h2>
              <p>Directional command interface for maintenance testing.</p>
            </div>
            <span className="tag">Simulation only</span>
          </div>

          <div className="manual-layout">
            <div className="joystick-card">
              <div className="section-kicker">MOVEMENT COMMANDS</div>
              <h3>Directional Control</h3>
              <p>Choose a direction to update the displayed command.</p>
              <div className="direction-pad">
                <button aria-label="Move forward" onClick={() => issueManualCommand("Forward")}>↑</button>
                <div>
                  <button aria-label="Move left" onClick={() => issueManualCommand("Left")}>←</button>
                  <button className="center-stop" aria-label="Stop" onClick={stopAll}>■</button>
                  <button aria-label="Move right" onClick={() => issueManualCommand("Right")}>→</button>
                </div>
                <button aria-label="Move backward" onClick={() => issueManualCommand("Backward")}>↓</button>
              </div>
              <div className="movement-status">
                <span>Current command</span>
                <strong>{robotMode}</strong>
              </div>
            </div>

            <div className="joystick-card">
              <div className="section-kicker">ANALOG INPUT</div>
              <h3>Joystick Interface</h3>
              <p>Physical joystick input can be integrated during hardware development.</p>
              <div className="joystick-placeholder">
                <div className="joystick-stick">●</div>
              </div>
              <div className="joystick-caption">PHYSICAL JOYSTICK · NOT CONNECTED</div>
            </div>
          </div>

          <button className="stop-button large-stop" onClick={stopAll}>
            ■ &nbsp; EMERGENCY STOP
          </button>
          <div className="notice">
            <span className="notice-icon">!</span>
            <p>
              This is a frontend demonstration. Do not treat these controls
              as a physical emergency-stop system.
            </p>
          </div>
        </section>
      )}
    </DashboardShell>
  );
}

/* ==========================================================================
   OPERATIONS DASHBOARD
   ========================================================================== */

function StatusBadge({ status }) {
  return <span className={`status-badge ${statusClass[status]}`}>{status}</span>;
}

function OperationsDashboard({ onHome }) {
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
      sidebarLabel="OPERATIONS"
      navItems={operationsNavItems}
      page={page}
      onNavigate={goTo}
      onHome={onHome}
      eyebrow="OPERATIONS"
      subtitle="Manage deliveries, select destinations and monitor robot activity."
      robotInfo={{ name: "UniDelivery Robot", line: "Operations Console · v1.0" }}
      footerText="Operations Console v1.0"
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

            <div className="overview-grid">
              {overviewCards.map(([icon, tone, label, title, value, note]) => (
                <div className="stat-card" key={title}>
                  <div className="stat-card-top">
                    <span className={`stat-icon ${tone}`}>{icon}</span>
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
                  View queue <span>→</span>
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
                <rect className="map-dock" x="30" y="130" width="60" height="40" rx="6" />
                <text className="map-label" x="60" y="184" textAnchor="middle">DOCK</text>

                {pathPoints.length > 0 && (
                  <polyline
                    className="map-route"
                    points={pathPoints.map((point) => `${point.x},${point.y}`).join(" ")}
                  />
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

/* ==========================================================================
   APP ROOT
   ========================================================================== */

function App() {
  const [view, setView] = useState("portal"); // portal | maintenance | operations

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  // Dashboards stay mounted (just hidden) so their simulated state is kept
  // while the user moves back to the portal.
  return (
    <>
      <div hidden={view !== "portal"}>
        <Portal onOpen={setView} />
      </div>
      <div hidden={view !== "maintenance"}>
        <MaintenanceDashboard onHome={() => setView("portal")} />
      </div>
      <div hidden={view !== "operations"}>
        <OperationsDashboard onHome={() => setView("portal")} />
      </div>
    </>
  );
}

export default App;

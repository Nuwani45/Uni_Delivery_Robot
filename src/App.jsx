import { useState } from "react";
import "./App.css";

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

function App() {
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

  const currentNav = navigationItems.find((item) => item.label === page);

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

          <div className="sidebar-label">MAINTENANCE</div>

          <nav className="sidebar-nav" aria-label="Maintenance navigation">
            {navigationItems.map((item) => (
              <button
                key={item.label}
                className={page === item.label ? "nav-item active" : "nav-item"}
                onClick={() => setPage(item.label)}
                aria-current={page === item.label ? "page" : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {page === item.label && <span className="active-indicator" />}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="robot-avatar">UD</div>
          <div className="sidebar-robot-info">
            <strong>UniDelivery Robot</strong>
            <small>Maintenance Panel · v1.2</small>
          </div>
          <span className="sidebar-status-dot" title="Simulation mode" />
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="page-heading">
            <div className="eyebrow">
              UNIDELIVERY <span>/</span> MAINTENANCE
            </div>
            <h1>{page}</h1>
            <p>Monitor, inspect and manage robot hardware systems.</p>
          </div>

          <div className="topbar-right">
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
                      <strong>Motor {String(motor.id).padStart(2, "0")}</strong>
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
                      <h3>Station {String(station.id).padStart(2, "0")}</h3>
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
                    <h3>Motor {String(motor.id).padStart(2, "0")}</h3>
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
                    onClick={() =>
                      updateMotor(motor.id, { pwm: 0, running: false })
                    }
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
                  <div className={value
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

        <footer className="app-footer">
          <span><strong>UniDelivery</strong> · Robotics Management System</span>
          <span>Maintenance Panel v1.2 <i /> Frontend simulation</span>
        </footer>
      </main>
    </div>
  );
}

export default App;

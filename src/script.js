/* MotionLab six-channel dashboard
 * This version is simulation-only. No motor hardware is controlled.
 * Later, replace sendCommand() with fetch/WebSocket calls to ESP32 firmware.
 */
"use strict";

const MOTOR_COUNT = 6;
const motors = Array.from({ length: MOTOR_COUNT }, (_, i) => ({
  id: i + 1,
  pwm: 0,
  direction: "forward",
  status: "stopped"
}));

const $ = (selector) => document.querySelector(selector);
const motorGrid = $("#motorGrid");
const activityLog = $("#activityLog");

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}

function renderMotorCards() {
  motorGrid.innerHTML = motors.map(motor => `
    <article class="motor-card" id="motor-card-${motor.id}" aria-labelledby="motor-title-${motor.id}">
      <div class="motor-head">
        <div class="motor-identity">
          <div class="motor-symbol" aria-hidden="true">⌁</div>
          <div><div class="motor-name" id="motor-title-${motor.id}">Motor ${String(motor.id).padStart(2,"0")}</div>
          <div class="motor-sub">IBT-2 channel ${motor.id}</div></div>
        </div>
        <span class="state-badge stopped" id="status-${motor.id}">STOPPED</span>
      </div>
      <div class="pwm-row">
        <label class="pwm-label" for="pwm-${motor.id}">PWM DUTY COMMAND</label>
        <div class="pwm-value"><span id="pwm-value-${motor.id}">0</span><small> / 255</small></div>
      </div>
      <input type="range" id="pwm-${motor.id}" min="0" max="255" step="1" value="0"
        style="--fill:0%" aria-label="Motor ${motor.id} PWM from 0 to 255">
      <div class="range-labels"><span>0 · STOP</span><span>128 · 50%</span><span>255 · MAX</span></div>
      <span class="direction-label">ROTATION DIRECTION</span>
      <div class="direction-switch" role="group" aria-label="Motor ${motor.id} direction">
        <button type="button" class="direction-btn selected" data-direction="forward" data-motor="${motor.id}" aria-pressed="true">↻ Forward</button>
        <button type="button" class="direction-btn" data-direction="reverse" data-motor="${motor.id}" aria-pressed="false">↺ Reverse</button>
      </div>
      <div class="motor-footer">
        <div class="duty-info">Duty cycle <strong id="duty-${motor.id}">0.0%</strong></div>
        <button type="button" class="stop-one" data-stop="${motor.id}">■ Stop motor</button>
      </div>
    </article>`).join("");

  motors.forEach(motor => {
    $(`#pwm-${motor.id}`).addEventListener("input", event => {
      const next = Number(event.target.value);
      motor.pwm = next;
      motor.status = next > 0 ? "running" : "stopped";
      updateMotorUI(motor.id);
      updateSummary();
      sendCommand(motor, "pwm_changed");
    });
  });

  motorGrid.querySelectorAll("[data-direction]").forEach(button => {
    button.addEventListener("click", () => {
      const motor = motors[Number(button.dataset.motor) - 1];
      const direction = button.dataset.direction;
      if (motor.direction === direction) return;
      motor.direction = direction;
      updateMotorUI(motor.id);
      addLog(`Motor ${motor.id}: direction set to ${direction}.`);
      sendCommand(motor, "direction_changed");
    });
  });

  motorGrid.querySelectorAll("[data-stop]").forEach(button => {
    button.addEventListener("click", () => stopMotor(Number(button.dataset.stop)));
  });
  updateSummary();
}

function updateMotorUI(id) {
  const motor = motors[id - 1];
  const card = $(`#motor-card-${id}`);
  const slider = $(`#pwm-${id}`);
  slider.value = motor.pwm;
  slider.style.setProperty("--fill", `${(motor.pwm / 255) * 100}%`);
  $(`#pwm-value-${id}`).textContent = motor.pwm;
  $(`#duty-${id}`).textContent = `${(motor.pwm / 255 * 100).toFixed(1)}%`;

  const status = $(`#status-${id}`);
  status.textContent = motor.pwm > 0 ? "SIMULATED RUN" : "STOPPED";
  status.className = `state-badge ${motor.pwm > 0 ? "running" : "stopped"}`;
  card.classList.toggle("is-running", motor.pwm > 0);

  card.querySelectorAll("[data-direction]").forEach(button => {
    const selected = button.dataset.direction === motor.direction;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function updateSummary() {
  const active = motors.filter(m => m.pwm > 0);
  const average = Math.round(motors.reduce((sum, m) => sum + m.pwm, 0) / MOTOR_COUNT);
  $("#activeCount").textContent = active.length;
  $("#averagePwm").textContent = average;
  $("#averageMeter").style.width = `${average / 255 * 100}%`;
  const directions = new Set(active.map(m => m.direction));
  $("#directionSummary").textContent = active.length === 0 ? "—" :
    directions.size > 1 ? "Mixed" : active[0].direction === "forward" ? "Forward" : "Reverse";
}

/* Integration point: currently a deliberate no-op for hardware safety.
 * Later this can POST to an ESP32 endpoint, e.g. /api/motor.
 * Example payload: { id: 1, pwm: 120, direction: "forward" }
 */

async function sendCommand(motor, reason) {
  try {
    const response = await fetch("http://192.168.4.1/api/motor", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain"
      },
      body: JSON.stringify({
        id: motor.id,
        pwm: motor.pwm,
        direction: motor.direction,
        reason: reason
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const result = await response.text();
    console.log("ESP32 response:", result);
  } catch (error) {
    console.error("Could not reach ESP32:", error);
  }
}


function stopMotor(id, quiet = false) {
  const motor = motors[id - 1];
  motor.pwm = 0;
  motor.status = "stopped";
  updateMotorUI(id);
  updateSummary();
  sendCommand(motor, "stop_motor");
  if (!quiet) addLog(`Motor ${id} stopped.`);
}

function stopAll() {
  motors.forEach(motor => {
    motor.pwm = 0;
    motor.status = "stopped";
    updateMotorUI(motor.id);
    sendCommand(motor, "stop_all");
  });
  updateSummary();
  addLog("Stop All pressed — all six simulated PWM commands set to 0.", "warning");
}

function setAllZero() {
  motors.forEach(motor => {
    motor.pwm = 0;
    motor.status = "stopped";
    updateMotorUI(motor.id);
    sendCommand(motor, "set_all_zero");
  });
  updateSummary();
  addLog("All six PWM values set to 0.");
}

function runDemoPattern() {
  // This is a UI-only demonstration pattern, not a hardware test.
  const pattern = [70, 110, 150, 190, 220, 255];
  motors.forEach((motor, index) => {
    motor.pwm = pattern[index];
    motor.direction = index % 2 === 0 ? "forward" : "reverse";
    motor.status = "running";
    updateMotorUI(motor.id);
    sendCommand(motor, "demo_pattern");
  });
  updateSummary();
  addLog("Demo pattern loaded into the six simulated channels.", "warning");
}

function addLog(message, kind = "normal") {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const empty = activityLog.querySelector(".log-empty");
  if (empty) empty.remove();
  const entry = document.createElement("div");
  entry.className = `log-entry ${kind === "warning" ? "log-warning" : ""}`;
  const timeNode = document.createElement("span");
  timeNode.className = "log-time";
  timeNode.textContent = time;
  const bullet = document.createElement("span");
  bullet.className = "log-bullet";
  const textNode = document.createElement("span");
  textNode.textContent = message;
  entry.append(timeNode, bullet, textNode);
  activityLog.prepend(entry);
  while (activityLog.children.length > 8) activityLog.lastElementChild.remove();
}

$("#stopAllTop").addEventListener("click", stopAll);
$("#setAllZero").addEventListener("click", setAllZero);
$("#demoRun").addEventListener("click", runDemoPattern);
$("#clearLog").addEventListener("click", () => {
  activityLog.innerHTML = '<div class="log-empty">No recent actions.</div>';
});

renderMotorCards();
addLog("Dashboard initialized in simulation mode.", "warning");

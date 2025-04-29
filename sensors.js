const gauges = {
  temp: { value: 0, min: -10, max: 100, start: -180, end: 0, unit: "°C", tickStep: 10, minorTickStep: 2 },
  humi: { value: 0, min: 0, max: 100, start: -180, end: 0, unit: "%", tickStep: 10, minorTickStep: 2 },
  co: { value: 0, min: 0, max: 1600, start: -125, end: 125, unit: "ppm", tickStep: 200, minorTickStep: 50 }
};

// Draw
function drawMeter(canvas, value, minVal, maxVal, startAngle, endAngle, unit, labelId, tickStep = 10, minorTickStep = 50) {
  const ctx = canvas.getContext("2d");
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 100;

  const toRad = angle => (angle * Math.PI) / 180;

  const clamped = Math.max(minVal, Math.min(value, maxVal));
  const ratio = (clamped - minVal) / (maxVal - minVal);
  const needleAngle = toRad(startAngle + ratio * (endAngle - startAngle));

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background arc
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, toRad(startAngle), toRad(endAngle));
  ctx.lineWidth = 15;
  ctx.strokeStyle = "#333";
  ctx.stroke();

  // Major Ticks
  const steps = Math.ceil((maxVal - minVal) / tickStep);
  for (let i = 0; i <= steps; i++) {
    const stepValue = minVal + (i / steps) * (maxVal - minVal);
    const tickRatio = (stepValue - minVal) / (maxVal - minVal);
    const angle = toRad(startAngle + tickRatio * (endAngle - startAngle));

    const x1 = centerX + Math.cos(angle) * (radius - 10);
    const y1 = centerY + Math.sin(angle) * (radius - 10);
    const x2 = centerX + Math.cos(angle) * radius;
    const y2 = centerY + Math.sin(angle) * radius;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();

    const tx = centerX + Math.cos(angle) * (radius - 30);
    const ty = centerY + Math.sin(angle) * (radius - 30);
    ctx.fillStyle = "#fff";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(Math.round(stepValue), tx, ty);
  }

  // Minor Ticks for all gauges
  const minorSteps = Math.ceil((maxVal - minVal) / minorTickStep);
  for (let i = 0; i < minorSteps; i++) {
    const minorStepValue = minVal + (i / minorSteps) * (maxVal - minVal);
    const minorTickRatio = (minorStepValue - minVal) / (maxVal - minVal);
    const angle = toRad(startAngle + minorTickRatio * (endAngle - startAngle));

    const x1 = centerX + Math.cos(angle) * (radius - 15);
    const y1 = centerY + Math.sin(angle) * (radius - 15);
    const x2 = centerX + Math.cos(angle) * (radius - 5);
    const y2 = centerY + Math.sin(angle) * (radius - 5);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Pointer
  const nx = centerX + Math.cos(needleAngle) * (radius - 40);
  const ny = centerY + Math.sin(needleAngle) * (radius - 40);
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(nx, ny);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Dot
  ctx.beginPath();
  ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
  ctx.fillStyle = "white";
  ctx.fill();

  // Update label
  document.getElementById(labelId).textContent = `${Math.round(value)} ${unit}`;
}

// Animate
function animateGauge(id, newValue, duration = 500) {
  const gauge = gauges[id];
  const startTime = performance.now();
  const oldValue = gauge.value;
  const diff = newValue - oldValue;

  function animate(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentValue = oldValue + diff * progress;

    drawMeter(
      document.getElementById(`gauge-${id}`),
      currentValue,
      gauge.min,
      gauge.max,
      gauge.start,
      gauge.end,
      gauge.unit,
      `label-${id}`,
      gauge.tickStep,
      gauge.minorTickStep 
    );

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      gauge.value = newValue;
    }
  }

  requestAnimationFrame(animate);
}

// Update
function updateGauges() {
  const newTemp = Math.floor(Math.random() * 111) - 10;
  const newHumi = Math.floor(Math.random() * 101);
  const newCO = Math.floor(Math.random() * 1601);

  // Animate
  animateGauge("temp", newTemp);
  animateGauge("humi", newHumi);
  animateGauge("co", newCO);
}

updateGauges();
setInterval(updateGauges, 5000);

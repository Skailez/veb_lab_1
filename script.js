let historyPoints = [];
window.addEventListener("load", () => {
  const stored = localStorage.getItem("hitHistory");
  if (stored) {
    historyPoints = JSON.parse(stored);
    historyPoints.forEach((row) => {
      addTabletRow(row);
    });
  }
});
const clearButton = document.querySelector("#clear-btn");
clearButton.addEventListener("click", () => {
  document.querySelector("#result-body").innerHTML = "";
  historyPoints = [];
  localStorage.removeItem("hitHistory");
});
const checkboxGroup = document.querySelector(".checkbox-group");
const checkboxes = Array.from(document.querySelectorAll("input[name = 'r-val']"));
// const rValue = document.querySelector();
const form = document.querySelector("#coordinates-form");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  document.getElementById("y-error").textContent = "";
  document.getElementById("r-error").textContent = "";
  const formData = new FormData(form);
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

  const isAnyChecked = Array.from(checkboxes).some((box) => box.checked);
  if (!isAnyChecked) {
    document.querySelector("#r-error").textContent = "Выберите хотя бы один радиус R";
    return;
  }

  const xValue = parseFloat(formData.get("x-val"));
  const yStr = formData.get("y-val").trim().replace(",", ".");
  if (yStr === "") {
    document.querySelector("#y-error").textContent = "Поле Y обязательно для заполнения";
    return;
  }

  const yValue = parseFloat(yStr);
  if (isNaN(yValue) || yValue < -5 || yValue > 5) {
    document.querySelector("#y-error").textContent = "Y должен быть числом от -5 до 5";
    return;
  }

  const rValue = parseFloat(formData.get("r-val"));
  const isHit = chekHit(xValue, yValue, rValue);
  const timestamp = Date.now();

  const resultItem = {
    xValue,
    yValue,
    rValue,
    isHit,
    timestamp,
  };
  historyPoints.push(resultItem);
  localStorage.setItem("hitHistory", JSON.stringify(historyPoints));
  addTabletRow(resultItem);

  console.log(yValue);
  console.log(chekHit(xValue, yValue, rValue));
  drawCanvas(resultItem);
});
checkboxGroup.addEventListener("change", (event) => {
  checkboxes.forEach((box) => {
    if (box != event.target) {
      box.checked = false;
    }
  });
});

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

function drawCanvas({ xValue, yValue, rValue }) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const pixelPerUnit = 40;
  const xPixels = xValue * pixelPerUnit;
  const yPixels = yValue * pixelPerUnit;
  const rPixels = rValue * pixelPerUnit;

  const rHalfPixels = rPixels / 2;

  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "rgba(52, 152, 219, 0.6)";
  ctx.fillRect(centerX, centerY - rPixels, rPixels, rPixels);

  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX, centerY - rHalfPixels);
  ctx.lineTo(centerX - rHalfPixels, centerY);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, rPixels, Math.PI / 2, Math.PI, false);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1.5;
  ctx.fillStyle = "#000000";
  ctx.font = "12px Arial";

  ctx.beginPath();
  ctx.moveTo(10, centerY);
  ctx.lineTo(width - 10, centerY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(centerX, 10);
  ctx.lineTo(centerX, height - 10);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width - 10, centerY);
  ctx.lineTo(width - 20, centerY - 5);
  ctx.lineTo(width - 20, centerY + 5);
  ctx.fill();
  ctx.fillText("x", width - 15, centerY - 10);

  ctx.beginPath();
  ctx.moveTo(centerX, 10);
  ctx.lineTo(centerX - 5, 20);
  ctx.lineTo(centerX + 5, 20);
  ctx.fill();
  ctx.fillText("y", centerX + 10, 15);

  ctx.lineWidth = 1;

  function drawMark(x, y, text, isX) {
    ctx.beginPath();
    if (isX) {
      ctx.moveTo(x, y - 5);
      ctx.lineTo(x, y + 5);
      ctx.stroke();
      ctx.fillText(text, x - 10, y + 15);
    } else {
      ctx.moveTo(x - 5, y);
      ctx.lineTo(x + 5, y);
      ctx.stroke();
      ctx.fillText(text, x + 8, y + 4);
    }
  }
  function drawCirclePoint(ctx, x, y, radius = 3, color = "black") {
    ctx.beginPath();
    ctx.arc(centerX + x, centerY - y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillText(`(${xValue},${yValue})`, centerX + x + 10, centerY - y + 10);
  }

  drawMark(centerX - rPixels, centerY, "-R", true);
  drawMark(centerX + rPixels, centerY, "R", true);
  drawMark(centerX - rPixels / 2, centerY, "-R/2", true);
  drawMark(centerX, centerY - rPixels / 2, "R/2", false);
  drawMark(centerX, centerY + rPixels / 2, "-R/2", false);
  drawMark(centerX, centerY + rPixels, "-R", false);
  drawMark(centerX, centerY - rPixels, "R", false);
  drawCirclePoint(ctx, xPixels, yPixels);
}

function chekHit(x, y, r) {
  if (x >= 0 && y >= 0) {
    return x <= r && y <= r;
  }
  if (x <= 0 && y >= 0) {
    return y <= r / 2 + x && x >= -r / 2;
  }
  if (x <= 0 && y <= 0) {
    return x ** 2 + y ** 2 <= r ** 2;
  }
}

function addTabletRow(item) {
  const tbody = document.querySelector("#result-body");
  const row = document.createElement("tr");
  const date = new Date(item.timestamp).toLocaleString("ru-RU");
  row.innerHTML = `
  <td>${item.xValue}</td>
  <td>${item.yValue}</td>
  <td>${item.rValue}</td>
  <td class="${item.isHit ? "hit-true" : "hit-false"}">${item.isHit ? "Да" : "Нет"}</td>
  <td>${date}</td>`;
  tbody.appendChild(row);
}

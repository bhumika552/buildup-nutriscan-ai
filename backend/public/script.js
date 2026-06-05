const imageInput = document.getElementById("image-input");
const goalSelect = document.getElementById("goal-select");
const dietSelect = document.getElementById("diet-select");
const cuisineSelect = document.getElementById("cuisine-select");
const dropArea = document.getElementById("drop-area");
const submitBtn = document.getElementById("submit-btn");
const statusEl = document.getElementById("status");
const previewEl = document.getElementById("preview");
const previewImage = document.getElementById("preview-image");
const previewName = document.getElementById("preview-name");
const previewSize = document.getElementById("preview-size");
const removeBtn = document.getElementById("remove-file");
const resultCard = document.getElementById("result-card");
const resultFood = document.getElementById("result-food");
const resultCalories = document.getElementById("result-calories");
const resultMeta = document.createElement("div");
resultMeta.className = "result-meta";
const resultGrid = resultCard.querySelector(".result-grid");
if (resultGrid) {
  resultCard.insertBefore(resultMeta, resultGrid);
}

let selectedFile = null;
let objectUrl = null;

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(1))} ${sizes[i]}`;
}

function setStatus(message, type = "info") {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
  statusEl.classList.remove("hidden");
}

function resetStatus() {
  statusEl.className = "status hidden";
  statusEl.textContent = "";
}

function renderRecommendations(items) {
  return items.map((item) => `<li>${item}</li>`).join("");
}

function setResult(data) {
  resultFood.textContent = `${data.food} · ${data.description}`;
  resultCalories.textContent = `${data.calories} kcal`;
  resultCard.classList.remove("hidden");

  const existingExtras = resultCard.querySelectorAll("[data-extra]");
  existingExtras.forEach((item) => item.remove());
  resultMeta.innerHTML = "";

  const preferenceMarkup = document.createElement("div");
  preferenceMarkup.innerHTML = `
    <div class="result-item" data-extra>
      <span class="result-key">Goal</span>
      <strong>${goalSelect.options[goalSelect.selectedIndex].text}</strong>
    </div>
    <div class="result-item" data-extra>
      <span class="result-key">Diet</span>
      <strong>${dietSelect.options[dietSelect.selectedIndex].text}</strong>
    </div>
    <div class="result-item" data-extra>
      <span class="result-key">Cuisine</span>
      <strong>${cuisineSelect.options[cuisineSelect.selectedIndex].text}</strong>
    </div>
  `;
  resultMeta.appendChild(preferenceMarkup);

  const extraMarkup = document.createElement("div");
  extraMarkup.innerHTML = `
    <div class="result-item" data-extra style="grid-column: span 2;">
      <span class="result-key">Goal advice</span>
      <strong>${data.goalAdvice}</strong>
    </div>
    <div class="result-item" data-extra style="grid-column: span 2;">
      <span class="result-key">Recommended foods</span>
      <ul class="recommendation-list">
        ${renderRecommendations(data.recommendations)}
      </ul>
    </div>
  `;

  resultCard.appendChild(extraMarkup);
}

function clearResult() {
  resultCard.classList.add("hidden");
  resultFood.textContent = "--";
  resultCalories.textContent = "--";
  const extras = resultCard.querySelectorAll("[data-extra]");
  extras.forEach((extra) => extra.remove());
  resultMeta.innerHTML = "";
}

function clearPreview() {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
  previewEl.classList.add("hidden");
  previewImage.src = "";
  previewName.textContent = "";
  previewSize.textContent = "";
  imageInput.value = "";
  selectedFile = null;
  submitBtn.disabled = true;
}

function showPreview(file) {
  if (!file) return;
  selectedFile = file;
  objectUrl = URL.createObjectURL(file);
  previewImage.src = objectUrl;
  previewName.textContent = file.name;
  previewSize.textContent = formatBytes(file.size);
  previewEl.classList.remove("hidden");
  submitBtn.disabled = false;
  resetStatus();
  clearResult();
}

function handleFile(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    setStatus("Please select a valid image file.", "error");
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    setStatus("Please use an image smaller than 10 MB.", "error");
    return;
  }
  showPreview(file);
}

imageInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  handleFile(file);
});

dropArea.addEventListener("click", () => {
  imageInput.click();
});

dropArea.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropArea.classList.add("drag-over");
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("drag-over");
});

dropArea.addEventListener("drop", (event) => {
  event.preventDefault();
  dropArea.classList.remove("drag-over");
  const [file] = event.dataTransfer.files;
  handleFile(file);
});

removeBtn.addEventListener("click", () => {
  clearPreview();
  resetStatus();
  clearResult();
});

submitBtn.addEventListener("click", async () => {
  if (!selectedFile) {
    setStatus("Please add an image before analyzing.", "error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Analyzing...";
  setStatus("Sending image to Buildup AI...", "info");
  clearResult();

  const payload = new FormData();
  payload.append("image", selectedFile);
  payload.append("goal", goalSelect.value);
  payload.append("diet", dietSelect.value);
  payload.append("cuisine", cuisineSelect.value);

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      body: payload
    });

    const data = await response.json();
    if (!response.ok) {
      const message = data.error || "Analysis failed. Please try again.";
      setStatus(message, "error");
      return;
    }

    setStatus("Food detected successfully.", "success");
    setResult(data);
  } catch (error) {
    console.error(error);
    setStatus("Cannot connect to the backend or AI service. Make sure both are running.", "error");
  } finally {
    submitBtn.disabled = !selectedFile;
    submitBtn.textContent = "Analyze now";
  }
});

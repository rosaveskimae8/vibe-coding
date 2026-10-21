const toggle = document.getElementById("toggle");
const status = document.getElementById("status");

function show(on) {
  toggle.checked = on;
  status.textContent = on ? "Включено — Shorts закрыты" : "Выключено — Shorts можно смотреть";
}

// Показываем текущее состояние (по умолчанию — включено)
chrome.storage.local.get({ enabled: true }, (data) => show(data.enabled));

// Сохраняем, когда нажали на переключатель
toggle.addEventListener("change", () => {
  chrome.storage.local.set({ enabled: toggle.checked });
  show(toggle.checked);
});

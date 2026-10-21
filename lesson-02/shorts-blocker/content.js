// Работает на каждой странице YouTube.
// Если открыта ссылка на Shorts и блокировка включена — перекидывает на главную.

let enabled = true; // по умолчанию включено

function isShorts() {
  return location.pathname.startsWith("/shorts");
}

function check() {
  if (enabled && isShorts()) {
    location.replace("https://www.youtube.com/");
  }
}

// Узнаём, включено ли расширение (если ещё не задавали — считаем, что включено)
chrome.storage.local.get({ enabled: true }, (data) => {
  enabled = data.enabled;
  check();
});

// Если переключили кнопку в окошке расширения — сразу применяем
chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    enabled = changes.enabled.newValue;
    check();
  }
});

// YouTube меняет страницы без перезагрузки, поэтому ловим его собственное событие…
document.addEventListener("yt-navigate-finish", check);
// …и на всякий случай проверяем адрес два раза в секунду
setInterval(check, 500);

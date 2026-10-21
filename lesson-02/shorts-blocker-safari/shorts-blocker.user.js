// ==UserScript==
// @name         Shorts Blocker
// @description  Не даёт смотреть YouTube Shorts: перекидывает на главную страницу
// @version      1.0
// @match        *://*.youtube.com/*
// @run-at       document-start
// ==/UserScript==

// Включать и выключать — переключателем у этого скрипта в окошке приложения Userscripts.

(function () {
  function check() {
    if (location.pathname.startsWith("/shorts")) {
      // origin — это www.youtube.com или m.youtube.com, смотря где ты сейчас
      location.replace(location.origin + "/");
    }
  }

  check();
  // YouTube меняет страницы без перезагрузки, поэтому проверяем адрес постоянно
  document.addEventListener("yt-navigate-finish", check);
  window.addEventListener("popstate", check);
  setInterval(check, 500);
})();

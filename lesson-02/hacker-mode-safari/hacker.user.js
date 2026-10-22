// ==UserScript==
// @name         Режим хакера
// @description  Кнопка 💻 в углу любой страницы превращает сайт в хакерский терминал
// @version      1.0
// @match        *://*/*
// @run-at       document-idle
// @noframes
// ==/UserScript==

// Нажми 💻 — включится режим хакера, нажми ещё раз — выключится.
// Совсем убрать кнопку: переключатель у этого скрипта в окошке Userscripts.

// Режим хакера: любой сайт становится чёрно-зелёным, сверху льётся «цифровой дождь»,
// а в терминале печатается «взлом». Всё понарошку — сайт на самом деле не меняется,
// просто перекрашивается у тебя на экране. Повторный запуск выключает режим.

if (!window.__toggleHacker) {
  window.__toggleHacker = function () {
    const old = document.getElementById("__hacker_style");
    if (old) {
      // Режим уже включён — выключаем
      old.remove();
      document.getElementById("__hacker_rain")?.remove();
      document.getElementById("__hacker_term")?.remove();
      cancelAnimationFrame(window.__hackerRaf);
      return;
    }

    // 1) Перекрашиваем страницу: чёрный фон, зелёный моноширинный текст
    const style = document.createElement("style");
    style.id = "__hacker_style";
    style.textContent = `
      html, body, body * {
        background-color: #000 !important;
        color: #00ff66 !important;
        border-color: #00aa44 !important;
        font-family: "Courier New", ui-monospace, monospace !important;
        text-shadow: 0 0 4px #00ff66 !important;
        box-shadow: none !important;
      }
      body img, body video, body svg, body picture, body canvas:not(#__hacker_rain) {
        filter: grayscale(1) sepia(1) hue-rotate(75deg) saturate(4) brightness(.8) !important;
      }
      a, a * { color: #66ffaa !important; text-decoration: underline !important; }
      @keyframes __blink { 50% { opacity: 0 } }
    `;
    document.documentElement.appendChild(style);

    // 2) «Цифровой дождь» из символов поверх страницы (полупрозрачный, кликам не мешает)
    const canvas = document.createElement("canvas");
    canvas.id = "__hacker_rain";
    canvas.style.cssText =
      "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;" +
      "z-index:2147483645;opacity:.35;background:transparent!important";
    document.documentElement.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const size = 16;
    let W, H, drops;
    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      drops = Array.from({ length: Math.ceil(W / size) }, () => Math.random() * -50);
    }
    resize();
    window.addEventListener("resize", resize);
    const chars = "アイウエオカキクケコサシスセソ0123456789ABCDEF<>/{}$#@";
    let last = 0;
    function rain(t) {
      if (!document.getElementById("__hacker_rain")) return;
      if (t - last > 50) {
        last = t;
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        ctx.globalCompositeOperation = "destination-out"; // постепенно стираем след
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = "source-over";
        ctx.font = size + "px monospace";
        drops.forEach((y, i) => {
          ctx.fillStyle = Math.random() < 0.1 ? "#ccffdd" : "#00ff66";
          ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * size, y * size);
          drops[i] = y * size > H && Math.random() > 0.97 ? 0 : y + 1;
        });
      }
      window.__hackerRaf = requestAnimationFrame(rain);
    }
    window.__hackerRaf = requestAnimationFrame(rain);

    // 3) Терминал, который «взламывает» текущий сайт
    const site = location.hostname || "localhost";
    const ip = Array.from({ length: 4 }, () => Math.floor(Math.random() * 255)).join(".");
    const lines = [
      "> подключение к " + site + " ...",
      "> IP найден: " + ip,
      "> обход файрвола ████████████ 100%",
      "> подбор пароля: " + "*".repeat(12),
      "> загрузка секретных файлов ...",
      "",
      "  ACCESS GRANTED  ",
    ];
    const term = document.createElement("div");
    term.id = "__hacker_term";
    term.style.cssText =
      "position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2147483646;" +
      "width:min(520px,90vw);padding:18px 22px;border:2px solid #00ff66;border-radius:8px;" +
      "background:rgba(0,0,0,.92)!important;color:#00ff66;text-shadow:0 0 4px #00ff66;font:16px/1.6 'Courier New',monospace;" +
      "white-space:pre-wrap;box-shadow:0 0 25px #00ff66!important;pointer-events:none;transition:opacity .6s";
    document.documentElement.appendChild(term);

    let li = 0, ci = 0;
    function type() {
      if (!document.getElementById("__hacker_term")) return;
      if (li >= lines.length) {
        // Мигаем ACCESS GRANTED и прячем терминал
        term.lastChild.style.cssText =
          "display:inline-block;background:#00ff66!important;color:#000!important;" +
          "font-weight:bold;font-size:22px;animation:__blink .5s step-end 4;text-shadow:none!important";
        setTimeout(() => (term.style.opacity = "0"), 2500);
        setTimeout(() => term.remove(), 3200);
        return;
      }
      if (ci === 0) term.appendChild(document.createElement("div"));
      const line = lines[li];
      term.lastChild.textContent = line.slice(0, ci + 1) + (ci + 1 < line.length ? "▌" : "");
      ci++;
      if (ci >= line.length) { li++; ci = 0; setTimeout(type, 350); }
      else setTimeout(type, 25 + Math.random() * 40);
    }
    type();
  };
}


// Кнопка 💻 в левом нижнем углу (справа уже живёт кнопка конфетти)
(function () {
  const btn = document.createElement("div");
  btn.textContent = "💻";
  btn.title = "Режим хакера";
  btn.style.cssText =
    "position:fixed;left:14px;bottom:14px;width:44px;height:44px;border-radius:50%;" +
    "background:#000;border:2px solid #00ff66;box-shadow:0 0 10px #00ff66;" +
    "display:flex;align-items:center;justify-content:center;font-size:22px;" +
    "cursor:pointer;z-index:2147483647;opacity:.7;user-select:none;-webkit-user-select:none";
  btn.addEventListener("click", () => window.__toggleHacker());
  document.documentElement.appendChild(btn);
})();

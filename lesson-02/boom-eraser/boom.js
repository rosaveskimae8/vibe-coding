// Ластик-взрыватель 💣
// Пока режим включён, любой кусок сайта, на который нажмёшь, трясётся, взрывается и исчезает.
// Ссылки и кнопки в это время не срабатывают — они тоже просто взрываются.
// Всё вернётся, если обновить страницу. Повторный запуск выключает режим.

if (!window.__toggleBoom) {
  window.__boomOn = false;

  const style = document.createElement("style");
  style.textContent = `
    @keyframes __boom_shake {
      0%,100% { transform: translate(0,0) rotate(0) }
      20% { transform: translate(-4px,2px) rotate(-2deg) }
      40% { transform: translate(4px,-2px) rotate(2deg) }
      60% { transform: translate(-3px,-3px) rotate(-1deg) }
      80% { transform: translate(3px,3px) rotate(1deg) }
    }
    .__boom_shaking { animation: __boom_shake .25s linear; outline: 3px solid #ff3b30 !important; }
    .__boom_mode, .__boom_mode * { cursor: crosshair !important; }
  `;
  document.documentElement.appendChild(style);

  // Подсказка сверху, что режим включён
  const banner = document.createElement("div");
  banner.textContent = "💣 Режим взрыва: нажимай на что угодно!";
  banner.style.cssText =
    "position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:2147483647;" +
    "background:#ff3b30;color:#fff;font:bold 15px system-ui,sans-serif;padding:8px 16px;" +
    "border-radius:20px;box-shadow:0 3px 12px rgba(0,0,0,.3);pointer-events:none;display:none";
  document.documentElement.appendChild(banner);

  function explode(el) {
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    // Большой 💥 в центре
    const bang = document.createElement("div");
    bang.textContent = "💥";
    bang.style.cssText =
      `position:fixed;left:${cx}px;top:${cy}px;font-size:20px;z-index:2147483647;pointer-events:none;` +
      "transform:translate(-50%,-50%) scale(.3);transition:transform .35s ease-out,opacity .35s ease-in .2s";
    document.documentElement.appendChild(bang);
    requestAnimationFrame(() => {
      bang.style.transform = "translate(-50%,-50%) scale(4)";
      bang.style.opacity = "0";
    });
    setTimeout(() => bang.remove(), 700);

    // Осколки разлетаются во все стороны
    const colors = ["#ff3b30", "#ff9500", "#ffcc00", "#8e8e93", "#333"];
    for (let i = 0; i < 26; i++) {
      const bit = document.createElement("div");
      const s = 4 + Math.random() * 8;
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 140;
      bit.style.cssText =
        `position:fixed;left:${cx + (Math.random() - .5) * r.width}px;top:${cy + (Math.random() - .5) * r.height}px;` +
        `width:${s}px;height:${s}px;background:${colors[i % colors.length]};border-radius:${Math.random() < .5 ? "50%" : "2px"};` +
        "z-index:2147483647;pointer-events:none;transition:transform .7s cubic-bezier(.1,.7,.3,1),opacity .7s";
      document.documentElement.appendChild(bit);
      requestAnimationFrame(() => {
        bit.style.transform =
          `translate(${Math.cos(angle) * dist}px,${Math.sin(angle) * dist + 40}px) rotate(${Math.random() * 720}deg)`;
        bit.style.opacity = "0";
      });
      setTimeout(() => bit.remove(), 800);
    }

    // Сам кусок сайта сжимается и исчезает
    el.style.transition = "transform .3s ease-in, opacity .3s ease-in, filter .3s";
    el.style.transform = "scale(1.15)";
    el.style.filter = "blur(3px) brightness(2)";
    el.style.opacity = "0";
    setTimeout(() => (el.style.visibility = "hidden"), 300);
  }

  function onClick(e) {
    if (!window.__boomOn) return;
    const el = e.target;
    // Свои кнопки (💣, 💻, 🎉) висят прямо в <html>, а не в <body> — их не взрываем
    if (!document.body.contains(el)) return;
    if (el === document.body || el === document.documentElement) return;
    e.preventDefault();
    e.stopPropagation();
    el.classList.add("__boom_shaking");
    setTimeout(() => {
      el.classList.remove("__boom_shaking");
      explode(el);
    }, 250);
  }
  // capture: true — ловим нажатие раньше, чем сам сайт, чтобы ссылки не открывались
  document.addEventListener("click", onClick, true);

  window.__toggleBoom = function () {
    window.__boomOn = !window.__boomOn;
    document.documentElement.classList.toggle("__boom_mode", window.__boomOn);
    banner.style.display = window.__boomOn ? "block" : "none";
    return window.__boomOn;
  };
}

window.__toggleBoom();

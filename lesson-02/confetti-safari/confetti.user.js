// ==UserScript==
// @name         Конфетти
// @description  Кнопка 🎉 в углу любой страницы — нажми, и полетит конфетти с фруктами
// @version      1.0
// @match        *://*/*
// @run-at       document-idle
// @noframes
// ==/UserScript==

// Включать и выключать — переключателем у этого скрипта в окошке приложения Userscripts.

// Запускает конфетти на текущей странице.
// Если скрипт вставили на страницу второй раз — функция уже есть, просто запускаем её снова.

if (!window.__shootConfetti) {
  window.__shootConfetti = function () {
    const colors = ["#ff4757", "#ffa502", "#2ed573", "#1e90ff", "#a55eea", "#ff6b81", "#eccc68"];
    const emojis = ["🎉", "🍓", "🍌", "🍉", "🍒", "⭐", "🍍"];

    // Прозрачный холст поверх всей страницы. Он не мешает кликать по сайту.
    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483647";
    document.documentElement.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const rand = (a, b) => a + Math.random() * (b - a);
    const pieces = [];

    // Два залпа из нижних углов, навстречу друг другу
    function burst(x, direction) {
      for (let i = 0; i < 90; i++) {
        const up = rand(0.65, 1.35); // насколько круто вверх
        const angle = direction > 0 ? -up : -Math.PI + up;
        const speed = rand(9, 19);
        pieces.push(makePiece(x, H, Math.cos(angle) * speed, Math.sin(angle) * speed));
      }
    }

    function makePiece(x, y, vx, vy) {
      const isEmoji = Math.random() < 0.12; // иногда вылетает фрукт
      return {
        x, y, vx, vy,
        w: rand(6, 11),
        h: rand(10, 16),
        rot: rand(0, Math.PI * 2),
        spin: rand(-0.3, 0.3),
        wobble: rand(0, Math.PI * 2),
        color: colors[Math.floor(Math.random() * colors.length)],
        emoji: isEmoji ? emojis[Math.floor(Math.random() * emojis.length)] : null,
      };
    }

    burst(0, 1);
    burst(W, -1);
    // плюс немного «дождя» сверху
    for (let i = 0; i < 60; i++) {
      pieces.push(makePiece(rand(0, W), rand(-H * 0.5, -10), rand(-1, 1), rand(1, 3)));
    }

    const start = performance.now();

    function frame(now) {
      ctx.clearRect(0, 0, W, H);
      let alive = 0;
      for (const p of pieces) {
        p.vy += 0.35;          // гравитация
        p.vx *= 0.985;         // сопротивление воздуха
        p.vy = Math.min(p.vy, 6);
        p.wobble += 0.1;
        p.x += p.vx + Math.sin(p.wobble) * 0.6;
        p.y += p.vy;
        p.rot += p.spin;
        if (p.y < H + 30) alive++;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.emoji) {
          ctx.font = "22px serif";
          ctx.fillText(p.emoji, -11, 8);
        } else {
          ctx.fillStyle = p.color;
          // «переворот» бумажки: ширина меняется синусом
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w * Math.abs(Math.cos(p.wobble)), p.h);
        }
        ctx.restore();
      }
      if (alive > 0 && now - start < 7000) {
        requestAnimationFrame(frame);
      } else {
        canvas.remove();
      }
    }
    requestAnimationFrame(frame);
  };
}


// Маленькая круглая кнопка 🎉 в правом нижнем углу
(function () {
  const btn = document.createElement("div");
  btn.textContent = "🎉";
  btn.title = "Конфетти!";
  btn.style.cssText =
    "position:fixed;right:14px;bottom:14px;width:44px;height:44px;border-radius:50%;" +
    "background:rgba(255,255,255,.85);box-shadow:0 2px 8px rgba(0,0,0,.25);" +
    "display:flex;align-items:center;justify-content:center;font-size:24px;" +
    "cursor:pointer;z-index:2147483646;opacity:.6;user-select:none;-webkit-user-select:none";
  btn.addEventListener("click", () => window.__shootConfetti());
  btn.addEventListener("mouseenter", () => (btn.style.opacity = "1"));
  btn.addEventListener("mouseleave", () => (btn.style.opacity = ".6"));
  document.body.appendChild(btn);
})();

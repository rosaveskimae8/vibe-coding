// ==UserScript==
// @name         Утиный режим
// @description  Кнопка 🦆 в углу выпускает на сайт утку, которая крякает и утаскивает куски страницы
// @version      1.0
// @match        *://*/*
// @run-at       document-idle
// @noframes
// ==/UserScript==

// Утиный режим 🦆
// По сайту гуляет утка: крякает, а иногда хватает кусок сайта и утаскивает его за край экрана.
// Нажми на утку — она крякнет и подпрыгнет. Повторный запуск убирает утку.
// Утащенное вернётся, если обновить страницу.

if (!window.__toggleDuck) {
  let duck = null, bubble = null, raf = 0, audio = null;
  let x, y, tx, ty, mode, target, carried, carriedOff, nextSteal, nextQuack, facingRight = false, t0 = 0;
  const SPEED = 2.2;

  // ---------- Звук «кря», нарисованный синтезатором (без файлов) ----------
  function quackSound() {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === "suspended") audio.resume();
      const now = audio.currentTime;
      for (let k = 0; k < 2; k++) {
        const start = now + k * 0.22;
        const osc = audio.createOscillator();
        const filter = audio.createBiquadFilter();
        const gain = audio.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(620, start);
        osc.frequency.exponentialRampToValueAtTime(330, start + 0.16);
        filter.type = "bandpass";
        filter.frequency.value = 1300;
        filter.Q.value = 3;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.5, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
        osc.connect(filter).connect(gain).connect(audio.destination);
        osc.start(start);
        osc.stop(start + 0.2);
      }
    } catch (e) { /* без звука — тоже смешно */ }
  }

  function quack(text) {
    quackSound();
    bubble.textContent = text || ["Кря!", "Кря-кря!", "КРЯ!!", "кря?", "Кря 😎"][Math.floor(Math.random() * 5)];
    bubble.style.opacity = "1";
    clearTimeout(bubble._t);
    bubble._t = setTimeout(() => (bubble.style.opacity = "0"), 900);
  }

  // ---------- Что можно утащить ----------
  function findLoot() {
    const W = innerWidth, H = innerHeight;
    const list = [...document.body.querySelectorAll("img, svg, button, a, h1, h2, h3, p, li, span, input, video")]
      .filter((el) => {
        if (el.style.visibility === "hidden") return false;
        const r = el.getBoundingClientRect();
        return r.width > 20 && r.height > 12 && r.width < 420 && r.height < 280 &&
               r.top > 40 && r.bottom < H - 20 && r.left > 0 && r.right < W;
      });
    return list[Math.floor(Math.random() * list.length)] || null;
  }

  function randomSpot() {
    tx = 40 + Math.random() * (innerWidth - 80);
    ty = innerHeight * 0.35 + Math.random() * (innerHeight * 0.55);
  }

  // ---------- Главный цикл ----------
  function step(t) {
    raf = requestAnimationFrame(step);
    if (!t0) t0 = t;

    if (mode === "walk" && t > nextSteal) {
      const el = findLoot();
      if (el) { target = el; mode = "hunt"; quack("👀"); }
      else nextSteal = t + 3000;
    }

    if (mode === "hunt") {
      if (!target.isConnected) { mode = "walk"; nextSteal = t + 4000; return; }
      const r = target.getBoundingClientRect(); // пересчитываем — вдруг страницу прокрутили
      tx = r.left + r.width / 2;
      ty = r.bottom + 10;
    }

    const dx = tx - x, dy = ty - y, dist = Math.hypot(dx, dy);
    if (dist > 3) {
      const sp = mode === "escape" ? SPEED * 1.8 : SPEED;
      x += (dx / dist) * Math.min(sp, dist);
      y += (dy / dist) * Math.min(sp, dist);
      if (Math.abs(dx) > 1) facingRight = dx > 0;
    } else {
      arrive(t);
    }

    if (mode === "walk" && t > nextQuack) {
      quack();
      nextQuack = t + 4000 + Math.random() * 6000;
    }

    // Рисуем утку: покачивается при ходьбе, смотрит туда, куда идёт
    const wobble = Math.sin(t / 90) * 10;
    duck.style.left = x + "px";
    duck.style.top = y + "px";
    duck.style.transform =
      `translate(-50%,-100%) scaleX(${facingRight ? -1 : 1}) rotate(${dist > 3 ? wobble : 0}deg)`;
    bubble.style.left = x + "px";
    bubble.style.top = y - 92 + "px";

    if (carried) {
      carried.style.left = x + carriedOff.x * (facingRight ? -1 : 1) + "px";
      carried.style.top = y + carriedOff.y + "px";
      carried.style.transform = `rotate(${Math.sin(t / 120) * 6}deg)`;
    }
  }

  function arrive(t) {
    if (mode === "walk") {
      randomSpot();
    } else if (mode === "hunt") {
      // Хватаем! Делаем копию куска сайта, а оригинал прячем
      const r = target.getBoundingClientRect();
      carried = target.cloneNode(true);
      carried.style.cssText =
        `position:fixed;margin:0;width:${r.width}px;height:${r.height}px;z-index:2147483646;` +
        "pointer-events:none;transition:none;box-sizing:border-box;";
      document.documentElement.appendChild(carried);
      carriedOff = { x: -r.width - 10, y: -r.height + 10 };
      target.style.visibility = "hidden";
      quack("Моё! 😈");
      // Убегаем к ближайшему краю
      tx = x < innerWidth / 2 ? -r.width - 120 : innerWidth + r.width + 120;
      ty = y;
      mode = "escape";
    } else if (mode === "escape") {
      carried.remove();
      carried = null;
      // Возвращаемся с той же стороны
      mode = "walk";
      x = x < 0 ? -40 : innerWidth + 40;
      randomSpot();
      nextSteal = t + 5000 + Math.random() * 7000;
    }
  }

  function start() {
    duck = document.createElement("div");
    duck.textContent = "🦆";
    duck.style.cssText =
      "position:fixed;z-index:2147483647;font-size:52px;line-height:1;cursor:pointer;" +
      "user-select:none;-webkit-user-select:none;filter:drop-shadow(0 4px 3px rgba(0,0,0,.3));";
    bubble = document.createElement("div");
    bubble.style.cssText =
      "position:fixed;z-index:2147483647;transform:translateX(-50%);background:#fff;color:#222;" +
      "font:bold 16px system-ui,sans-serif;padding:4px 10px;border-radius:12px;border:2px solid #222;" +
      "pointer-events:none;opacity:0;transition:opacity .2s;white-space:nowrap";
    document.documentElement.append(duck, bubble);

    // Нажатие на утку: кря и прыжок
    duck.addEventListener("click", (e) => {
      e.stopPropagation();
      quack();
      duck.animate(
        [{ marginTop: "0px" }, { marginTop: "-40px" }, { marginTop: "0px" }],
        { duration: 400, easing: "ease-out" }
      );
    });

    x = -40;
    y = innerHeight * 0.7;
    mode = "walk";
    randomSpot();
    const now = performance.now();
    nextSteal = now + 4000;
    nextQuack = now + 1500;
    raf = requestAnimationFrame(step);
    quack("Кря! Я пришла 🦆");
  }

  function stop() {
    cancelAnimationFrame(raf);
    duck.remove(); bubble.remove();
    if (carried) carried.remove();
    duck = bubble = carried = null;
  }

  window.__toggleDuck = function () {
    if (duck) { stop(); return false; }
    start();
    return true;
  };
}


// Кнопка 🦆 внизу слева (рядом с 💻 и 💣)
(function () {
  const btn = document.createElement("div");
  btn.textContent = "🦆";
  btn.title = "Утиный режим";
  const base =
    "position:fixed;left:126px;bottom:14px;width:44px;height:44px;border-radius:50%;" +
    "display:flex;align-items:center;justify-content:center;font-size:22px;cursor:pointer;" +
    "z-index:2147483647;user-select:none;-webkit-user-select:none;";
  const off = base + "background:rgba(255,255,255,.85);box-shadow:0 2px 8px rgba(0,0,0,.25);opacity:.7";
  const on = base + "background:#ffd60a;box-shadow:0 0 14px #ffd60a";
  btn.style.cssText = off;
  btn.addEventListener("click", () => {
    btn.style.cssText = window.__toggleDuck() ? on : off;
  });
  document.documentElement.appendChild(btn);
})();

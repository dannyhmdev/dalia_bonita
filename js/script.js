const scene = document.getElementById("scene");
const startButton = document.getElementById("startButton");
const music = document.getElementById("backgroundMusic");
const musicControl = document.getElementById("musicControl");

const bouquetCanvas = document.getElementById("bouquetCanvas");
const bouquetSource = document.getElementById("bouquetSource");

let started = false;
let bouquetReady = false;
let bouquetAnimationStarted = false;
let bouquetAnimationStart = 0;

/* ============================================================
   RAMO: EFECTO DE DIBUJO DESDE CERO
   ============================================================

   No se intenta adivinar la forma del ramo con coordenadas.
   Se usa el PNG real como fuente y se genera una máscara de
   pintura sobre él. La máscara avanza con varias pinceladas
   irregulares de abajo hacia arriba, por lo que TODO el ramo
   termina apareciendo y no puede quedar invisible por errores
   de coordenadas.
*/

const ctx = bouquetCanvas.getContext("2d");
const sourceCanvas = document.createElement("canvas");
const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
const maskCanvas = document.createElement("canvas");
const maskCtx = maskCanvas.getContext("2d");

const W = 544;
const H = 750;

sourceCanvas.width = W;
sourceCanvas.height = H;
maskCanvas.width = W;
maskCanvas.height = H;
bouquetCanvas.width = W;
bouquetCanvas.height = H;

let imageData = null;
let revealMap = null;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function easeInOut(v) {
  return v < 0.5
    ? 2 * v * v
    : 1 - Math.pow(-2 * v + 2, 2) / 2;
}

/*
 * Cada píxel visible recibe un instante de revelado.
 * La parte inferior se pinta primero y la parte superior después.
 * Las ondas hacen que el borde parezca una pincelada manual.
 */
function createRevealMap() {
  const data = imageData.data;
  revealMap = new Float32Array(W * H);

  for (let y = 0; y < H; y++) {
    const vertical = 1 - y / (H - 1);

    for (let x = 0; x < W; x++) {
      const p = (y * W + x) * 4;
      const alpha = data[p + 3];
      const index = y * W + x;

      if (alpha < 8) {
        revealMap[index] = 2;
        continue;
      }

      /* Pincel irregular: diferentes ondas y pequeñas variaciones. */
      const wave1 = Math.sin(x * 0.040 + y * 0.019) * 0.055;
      const wave2 = Math.sin(x * 0.095 - y * 0.031) * 0.025;
      const wave3 = Math.sin((x + y) * 0.17) * 0.012;

      /* Algunas zonas del centro se descubren ligeramente antes. */
      const centerBias =
        (1 - Math.abs(x - W / 2) / (W / 2)) * 0.025;

      revealMap[index] = clamp(
        vertical + wave1 + wave2 + wave3 - centerBias,
        0,
        1
      );
    }
  }
}

function prepareBouquet() {
  if (bouquetReady || !bouquetSource.naturalWidth) return;

  sourceCtx.clearRect(0, 0, W, H);
  sourceCtx.drawImage(bouquetSource, 0, 0, W, H);

  imageData = sourceCtx.getImageData(0, 0, W, H);
  createRevealMap();
  bouquetReady = true;

  drawBouquet(0);
}

function drawBouquet(progress) {
  if (!bouquetReady) return;

  const pixels = imageData.data;
  const output = ctx.createImageData(W, H);
  const out = output.data;

  /*
   * La zona de transición funciona como una brocha con borde suave.
   * El ramo se va pintando, no se hace un simple opacity fade.
   */
  const brushSoftness = 0.045;
  const limit = progress + brushSoftness;

  maskCtx.clearRect(0, 0, W, H);
  maskCtx.fillStyle = "white";

  /*
   * Dibujamos una línea de pincel muy ancha que sigue el borde
   * irregular de revelado. Esto añade la sensación visual de que
   * alguien está pasando un pincel por el ramo.
   */
  const front = clamp(progress, 0, 1);
  const yFront = H - front * H;

  maskCtx.beginPath();
  maskCtx.moveTo(0, yFront + 35);

  for (let x = 0; x <= W; x += 12) {
    const y =
      yFront +
      Math.sin(x * 0.045 + front * 9) * 18 +
      Math.sin(x * 0.12 - front * 15) * 8;
    maskCtx.lineTo(x, y);
  }

  maskCtx.lineTo(W, H + 40);
  maskCtx.lineTo(0, H + 40);
  maskCtx.closePath();
  maskCtx.fill();

  /* Revelado por píxel, con borde suave. */
  for (let i = 0, p = 0; i < revealMap.length; i++, p += 4) {
    const alpha = pixels[p + 3];

    if (alpha === 0 || revealMap[i] > limit) {
      continue;
    }

    const local = clamp(
      (limit - revealMap[i]) / brushSoftness,
      0,
      1
    );

    out[p] = pixels[p];
    out[p + 1] = pixels[p + 1];
    out[p + 2] = pixels[p + 2];
    out[p + 3] = Math.round(alpha * local);
  }

  ctx.clearRect(0, 0, W, H);
  ctx.putImageData(output, 0, 0);
}

function animateBouquet(timestamp) {
  if (!bouquetAnimationStarted) return;

  /* 6.5 segundos: suficientemente lento para ver cómo se forma. */
  const duration = 6500;
  const elapsed = timestamp - bouquetAnimationStart;
  const raw = clamp(elapsed / duration, 0, 1);
  const progress = easeInOut(raw);

  drawBouquet(progress);

  if (raw < 1) {
    requestAnimationFrame(animateBouquet);
  } else {
    /* Garantía: al final el ramo queda 100 % visible. */
    drawBouquet(1);
  }
}

function startBouquetDrawing() {
  if (bouquetAnimationStarted) return;

  /* La imagen puede haber cargado antes de este momento. */
  if (!bouquetReady) prepareBouquet();
  if (!bouquetReady) return;

  bouquetAnimationStarted = true;
  bouquetAnimationStart = performance.now();
  requestAnimationFrame(animateBouquet);
}

/* Soluciona el caso en el que el navegador ya cargó el PNG. */
bouquetSource.addEventListener("load", prepareBouquet);

if (bouquetSource.complete && bouquetSource.naturalWidth > 0) {
  prepareBouquet();
}

/* ============================================================
   INICIO
   ============================================================ */

function startExperience() {
  if (started) return;
  started = true;

  music.volume = 0.55;

  /*
   * La cortina amarilla termina de subir alrededor de 10.1 s.
   * Esperamos un poco para que el ramo empiece a construirse
   * cuando la escena rosa ya está visible.
   */
  window.setTimeout(startBouquetDrawing, 10150);

  music.play().catch(() => {});

  startButton.classList.add("is-hidden");
  scene.classList.add("playing");

  musicControl.setAttribute("aria-hidden", "false");
  musicControl.classList.add("visible");

  window.setTimeout(() => {
    musicControl.classList.remove("visible");
  }, 2600);
}

startButton.addEventListener("click", startExperience);

startButton.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    startExperience();
  }
});

musicControl.addEventListener("click", (event) => {
  event.stopPropagation();

  if (music.paused) {
    music.play().catch(() => {});
    musicControl.querySelector(".music-note").textContent = "♪";
  } else {
    music.pause();
    musicControl.querySelector(".music-note").textContent = "Ⅱ";
  }

  musicControl.classList.add("visible");
  window.clearTimeout(musicControl.hideTimer);

  musicControl.hideTimer = window.setTimeout(() => {
    musicControl.classList.remove("visible");
  }, 1600);
});

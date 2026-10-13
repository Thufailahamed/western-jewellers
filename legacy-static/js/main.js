// Western Jewellers — interactions & choreography
import { createScene, renderStudio } from "./scene.js";

const { gsap, ScrollTrigger, Lenis } = window;
gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

document.querySelector(".year").textContent = new Date().getFullYear();

/* ---------------------------------------------------------- Smooth scroll */
let lenis = null;
if (!reduced && Lenis) {
  lenis = new Lenis({ duration: 1.25, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}

const scrollTo = (target) => {
  if (lenis) lenis.scrollTo(target, { duration: 1.8, offset: 0 });
  else (typeof target === "string" ? $(target) : target)?.scrollIntoView({ behavior: "smooth" });
};

$$('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length < 2 && id !== "#") return;
    const el = id === "#" || id === "#top" ? document.body : $(id);
    if (!el) return;
    e.preventDefault();
    closeMenu();
    scrollTo(id === "#top" ? 0 : el);
  });
});

/* ---------------------------------------------------------- WebGL */
let gl = null;
try {
  gl = createScene($(".gl"));
} catch (err) {
  console.warn("WebGL unavailable", err);
  $(".gl").remove();
}

function loadStudio() {
  if (!gl) return;
  try {
    const shots = renderStudio(gl.mats);
    $$("img[data-piece]").forEach((img) => {
      const src = shots[img.dataset.piece];
      if (!src) return;
      img.onload = () => img.classList.add("is-ready");
      img.src = src;
    });
  } catch (err) {
    console.warn("Studio render failed", err);
  }
}

/* ---------------------------------------------------------- Split words */
$$(".split-words").forEach((el) => {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(" ");
});

/* ---------------------------------------------------------- Loader */
function runLoader() {
  return new Promise((resolve) => {
    const count = $(".loader__count");
    const bar = $(".loader__bar span");
    const p = { v: 0 };
    const tl = gsap.timeline({ onComplete: resolve });
    tl.fromTo(".loader__mark span", { yPercent: 110 }, { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.08 }, 0.1)
      .to(p, {
        v: 100, duration: reduced ? 0.4 : 1.9, ease: "power3.inOut",
        onUpdate: () => {
          count.textContent = String(Math.round(p.v)).padStart(3, "0");
          bar.style.transform = `scaleX(${p.v / 100})`;
        },
      }, 0.2);
  });
}

function exitLoader() {
  const tl = gsap.timeline();
  tl.to(".loader__mark span", { yPercent: -110, duration: 0.8, ease: "expo.in", stagger: 0.05 })
    .to(".loader__bar, .loader__meta", { opacity: 0, duration: 0.4 }, "<")
    .to(".loader", { clipPath: "inset(0 0 100% 0)", duration: 1.2, ease: "expo.inOut" }, "-=0.2")
    .set(".loader", { display: "none" })
    .add(() => {
      document.body.classList.remove("is-loading");
      lenis?.start();
    }, "-=0.6")
    .from(".hero__title .line > span", { yPercent: 110, duration: 1.4, ease: "expo.out", stagger: 0.1 }, "-=0.9")
    .to(".hero .reveal", { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.1 }, "-=1.1")
    .from(".hero__meta .eyebrow, .nav > *", { opacity: 0, y: -12, duration: 1, ease: "expo.out", stagger: 0.04 }, "<");

  if (gl) {
    tl.fromTo(gl.state, { scale: 0.2, ry: -2.6, y: -0.3 }, { scale: 1, ry: 0, y: 0, duration: 2.4, ease: "expo.out" }, 1.0);
  }
  return tl;
}

/* ---------------------------------------------------------- Ring choreography */
function ringTimeline() {
  if (!gl) return;
  const s = gl.state;
  const mm = gsap.matchMedia();

  mm.add({ desktop: "(min-width: 1025px) and (orientation: landscape)", mobile: "(max-width: 1024px), (orientation: portrait)" }, (ctx) => {
    const { mobile } = ctx.conditions;

    // Hero → Manifesto: ring drifts right and settles beside the text.
    gsap.timeline({
      scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "top 20%", scrub: 1.2 },
    })
      .to(s, { x: mobile ? 0.45 : 0.58, y: mobile ? 0.74 : 0.05, scale: mobile ? 0.48 : 0.72, rz: -0.35, rx: 0.9, ease: "none" });

    // Into Signature: ring returns, larger, laid back to show the stone.
    gsap.timeline({
      scrollTrigger: { trigger: ".signature", start: "top bottom", end: "center center", scrub: 1.2 },
    })
      .fromTo(s, { x: -0.2, y: 0.5, scale: 0.8, rz: 0.4, rx: 0.2 }, { x: mobile ? 0 : 0.26, y: mobile ? 0.05 : -0.04, scale: mobile ? 1.05 : 1.15, rz: -0.12, rx: 0.5, ease: "none", immediateRender: false });

    gsap.timeline({
      scrollTrigger: { trigger: ".signature", start: "center center", end: "bottom top", scrub: 1.2 },
    })
      .to(s, { rx: 0.8, rz: -0.3, y: mobile ? -0.4 : -0.5, ease: "none" });
  });

  // Skip rendering while opaque sections cover the viewport.
  const hideBetween = (trigger, endTrigger, end) =>
    ScrollTrigger.create({
      trigger, start: "top top", endTrigger, end,
      onToggle: (self) => gsap.to(s, { visible: self.isActive ? 0 : 1, duration: 0.3, overwrite: "auto" }),
    });
  hideBetween(".collections", ".craft", "bottom bottom");
  hideBetween(".numbers", ".footer", "bottom bottom");
}

/* ---------------------------------------------------------- Section animations */
function sections() {
  // Hero parallax out.
  gsap.to(".hero__title .line:nth-child(1)", { xPercent: -8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero__title .line:nth-child(2)", { xPercent: 6, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero__title .line:nth-child(3)", { xPercent: -4, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero__title, .hero__foot, .hero__meta", { opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "40% top", end: "bottom top", scrub: true } });

  // Marquee: constant drift that speeds up with scroll velocity.
  const track = $(".marquee__track");
  const loop = gsap.to(track, { xPercent: -50, duration: 32, ease: "none", repeat: -1 });
  if (lenis) {
    lenis.on("scroll", ({ velocity }) => {
      const v = gsap.utils.clamp(-6, 6, velocity / 6);
      gsap.to(loop, { timeScale: 1 + Math.abs(v) * 1.6, duration: 0.2, overwrite: true });
      gsap.to(loop, { timeScale: 1, duration: 1.2, delay: 0.2, overwrite: false });
    });
  }

  // Word-by-word reveals.
  $$(".split-words").forEach((el) => {
    gsap.to($$(".w", el), {
      opacity: 1, ease: "none", stagger: 0.1,
      scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true },
    });
  });
  gsap.from(".manifesto__sign", { opacity: 0, y: 20, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".manifesto__sign", start: "top 90%" } });

  // Horizontal collections.
  const pin = $(".collections__pin");
  const strip = $(".collections__track");
  const dist = () => Math.max(0, strip.scrollWidth - window.innerWidth);
  const horiz = gsap.to(strip, {
    x: () => -dist(), ease: "none",
    scrollTrigger: {
      trigger: pin, start: "top top", end: () => "+=" + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
      onUpdate: (self) => { $(".collections__progress span").style.transform = `scaleX(${self.progress})`; },
    },
  });
  $$(".card").forEach((card) => {
    gsap.fromTo($(".card__media", card), { clipPath: "inset(18% 0 0 0)" }, {
      clipPath: "inset(0% 0 0 0)", ease: "none",
      scrollTrigger: { trigger: card, containerAnimation: horiz, start: "left right", end: "center center", scrub: true },
    });
  });
  gsap.from(".collections__head .h2", { yPercent: 40, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".collections", start: "top 70%" } });

  // Craft steps.
  const current = $(".craft__current");
  $$(".step").forEach((step, i) => {
    ScrollTrigger.create({
      trigger: step, start: "top 60%", end: "bottom 60%",
      onToggle: (self) => {
        step.classList.toggle("is-active", self.isActive);
        if (self.isActive) {
          gsap.fromTo(current, { yPercent: self.direction > 0 ? 40 : -40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: "expo.out" });
          current.textContent = String(i + 1).padStart(2, "0");
        }
      },
    });
  });

  // Headline reveals.
  $$(".craft .h2, .appointment .h2").forEach((h) => {
    gsap.from(h, { yPercent: 30, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: h, start: "top 85%" } });
  });

  // Signature.
  gsap.from(".signature .display .line > span", {
    yPercent: 110, duration: 1.4, ease: "expo.out", stagger: 0.12,
    scrollTrigger: { trigger: ".signature", start: "top 55%" },
  });
  gsap.from(".specs > div", {
    opacity: 0, y: 24, duration: 1, ease: "expo.out", stagger: 0.08,
    scrollTrigger: { trigger: ".specs", start: "top 85%" },
  });

  // Numbers.
  $$(".stat__n").forEach((n) => {
    const to = +n.dataset.count;
    const o = { v: 0 };
    gsap.to(o, {
      v: to, duration: 2.2, ease: "power3.out",
      scrollTrigger: { trigger: n, start: "top 85%" },
      onUpdate: () => { n.textContent = Math.round(o.v); },
    });
  });
  gsap.from(".stat", { opacity: 0, y: 30, duration: 1.2, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: ".numbers", start: "top 75%" } });

  // Footer wordmark rises.
  gsap.from(".footer__mark > *", { yPercent: 100, duration: 1.6, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: ".footer__mark", start: "top 95%" } });

  // Nav hide on scroll down.
  const nav = $(".nav");
  let last = 0;
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle("is-hidden", y > 200 && y > last && !document.body.classList.contains("menu-open"));
      last = y;
    },
  });
}

/* ---------------------------------------------------------- Cursor & magnetic */
function cursor() {
  if (isTouch) return;
  const c = $(".cursor");
  const label = $(".cursor__label");
  const xTo = gsap.quickTo(c, "x", { duration: 0.45, ease: "power3" });
  const yTo = gsap.quickTo(c, "y", { duration: 0.45, ease: "power3" });
  window.addEventListener("pointermove", (e) => { xTo(e.clientX); yTo(e.clientY); });

  document.addEventListener("pointerover", (e) => {
    const labelled = e.target.closest("[data-cursor]");
    const hov = e.target.closest("a, button, label, input, textarea");
    c.classList.toggle("is-label", !!labelled);
    c.classList.toggle("is-hover", !labelled && !!hov);
    if (labelled) label.textContent = labelled.dataset.cursor;
  });
  document.addEventListener("pointerleave", () => gsap.to(c, { opacity: 0, duration: 0.3 }));
  document.addEventListener("pointerenter", () => gsap.to(c, { opacity: 1, duration: 0.3 }));

  $$("[data-magnetic]").forEach((el) => {
    const xm = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
    const ym = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      xm((e.clientX - r.left - r.width / 2) * 0.3);
      ym((e.clientY - r.top - r.height / 2) * 0.4);
    });
    el.addEventListener("pointerleave", () => { xm(0); ym(0); });
  });
}

/* ---------------------------------------------------------- Menu */
const burger = $(".nav__burger");
const menu = $(".menu");
function closeMenu() {
  if (!menu.classList.contains("is-open")) return;
  menu.classList.remove("is-open");
  menu.setAttribute("aria-hidden", "true");
  burger.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
  lenis?.start();
}
burger.addEventListener("click", () => {
  const open = !menu.classList.contains("is-open");
  if (!open) return closeMenu();
  menu.classList.add("is-open");
  menu.setAttribute("aria-hidden", "false");
  burger.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-open");
  lenis?.stop();
  gsap.fromTo(".menu__links a", { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: 0.06, delay: 0.25 });
});
window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

/* ---------------------------------------------------------- Forms */
const form = $(".form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const note = $(".form__note", form);
  let ok = true;
  $$("input[required]", form).forEach((input) => {
    const valid = input.value.trim() && input.checkValidity();
    input.closest(".field").classList.toggle("is-error", !valid);
    if (!valid) ok = false;
  });
  if (!ok) { note.textContent = "Please add your name and a valid email."; return; }
  const name = form.name.value.trim().split(" ")[0];
  note.textContent = `Thank you, ${name}. We'll be in touch within one working day.`;
  form.reset();
});
$(".footer__news").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("input", e.currentTarget);
  if (!input.value.includes("@")) { input.focus(); return; }
  input.value = "";
  input.placeholder = "Thank you — you're on the list.";
});

/* ---------------------------------------------------------- Boot */
(async function boot() {
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  gl?.start();
  await Promise.all([runLoader(), fonts]);
  loadStudio();
  sections(); // creates the collections pin first so later triggers account for its spacing
  ringTimeline();
  cursor();
  ScrollTrigger.refresh();
  exitLoader();
})();

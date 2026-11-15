// Progressive enhancement: submit forms to Formspree via fetch and show a status line.
// Without JS the forms still work as normal POSTs (Formspree shows its own thank-you page).
document.querySelectorAll("form[data-formspree]").forEach((form) => {
  const status = form.querySelector(".status");
  const btn = form.querySelector("button[type=submit]");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (form.action.includes("FORM_ID")) {
      status.textContent = form.dataset.unset;
      status.className = "status err";
      return;
    }
    btn.disabled = true;
    status.className = "status";
    status.textContent = "…";
    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      status.textContent = form.dataset.ok;
    } catch (err) {
      status.textContent = form.dataset.fail;
      status.className = "status err";
    } finally {
      btn.disabled = false;
    }
  });
});

// Buttons and tiles with data-topic preselect the contact form topic (Join / Sponsor / Book).
// Picking a topic also pre-writes a short draft into the message, unless the visitor already typed their own.
const topicSelect = document.querySelector('#join select[name="topic"]');
const message = document.querySelector('#join textarea[name="message"]');
const choices = document.querySelectorAll(".choice");
const drafts = topicSelect ? [...topicSelect.options].map((o) => o.dataset.msg || "") : [];
const applyTopic = (topic) => {
  topicSelect.value = topic;
  choices.forEach((c) => c.classList.toggle("on", c.dataset.topic === topic));
  if (message && (!message.value.trim() || drafts.includes(message.value))) {
    message.value = topicSelect.selectedOptions[0].dataset.msg || "";
  }
};
if (topicSelect) {
  document.querySelectorAll("[data-topic]").forEach((el) => {
    el.addEventListener("click", () => applyTopic(el.dataset.topic));
  });
  topicSelect.addEventListener("change", () => applyTopic(topicSelect.value));
  // Put the cursor at the end of the draft so people can type straight away (not on touch, where it would pop the keyboard).
  if (matchMedia("(hover: hover)").matches) choices.forEach((c) => c.addEventListener("click", () => setTimeout(() => {
    message.focus({ preventScroll: true });
    message.setSelectionRange(message.value.length, message.value.length);
  }, 400)));
}

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Windows fade up as they scroll into view.
const wins = document.querySelectorAll("section:not(.hero) .win");
if (reduced || !("IntersectionObserver" in window)) {
  wins.forEach((w) => w.classList.add("in"));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  wins.forEach((w) => io.observe(w));
}

// Snap: when scrolling stops near a window, settle it under the header (the hero settles at the very top).
// Points ahead in the scroll direction win from further away; points behind only pull back when close.
// Inside a long window with no edge nearby nothing happens, and never while someone is typing.
(() => {
  const wins = [...document.querySelectorAll("main .win")];
  const line = 80; // matches scroll-padding-top in style.css
  let lastY = window.scrollY, dir = 0, timer, busy = false;
  const points = () => wins.map((w, i) => (i === 0 ? 0 : w.getBoundingClientRect().top + window.scrollY - line));
  const snap = () => {
    if (busy || document.activeElement.matches("input, textarea, select")) return;
    const y = window.scrollY, vh = window.innerHeight;
    let best = null;
    for (const p of points()) {
      const d = p - y;
      if (Math.abs(d) < 2) return;
      const ahead = Math.sign(d) === dir;
      if (Math.abs(d) < vh * (ahead ? 0.6 : 0.25) && (best === null || Math.abs(d) < Math.abs(best))) best = d;
    }
    if (best === null) return;
    busy = true;
    window.scrollTo({ top: y + best, behavior: reduced ? "auto" : "smooth" });
    setTimeout(() => (busy = false), 650);
  };
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (y !== lastY) dir = y > lastY ? 1 : -1;
    lastY = y;
    clearTimeout(timer);
    timer = setTimeout(snap, 110);
  }, { passive: true });
})();

// A few green pixels drifting up behind the windows.
if (!reduced) {
  for (let k = 0; k < 14; k++) {
    const p = document.createElement("span");
    p.className = "px";
    p.setAttribute("aria-hidden", "true");
    p.style.left = Math.random() * 100 + "vw";
    p.style.width = p.style.height = 2 + Math.floor(Math.random() * 3) * 2 + "px";
    p.style.animationDuration = 10 + Math.random() * 12 + "s";
    p.style.animationDelay = -Math.random() * 16 + "s";
    document.body.appendChild(p);
  }
}

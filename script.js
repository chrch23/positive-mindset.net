const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const nav = document.querySelector("[data-nav]");
const backToTop = document.querySelector("[data-back-to-top]");

function updateScrollState() {
  header?.classList.toggle("scrolled", window.scrollY > 10);
  backToTop?.classList.toggle("visible", window.scrollY > 650);
}

window.addEventListener("scroll", updateScrollState, {passive: true});
updateScrollState();

menuButton?.addEventListener("click", () => {
  const open = nav?.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(Boolean(open)));
});

nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");
}));

document.querySelectorAll("[data-year]").forEach((node) => { node.textContent = new Date().getFullYear(); });

window.observeReveals = function observeReveals() {
  const nodes = document.querySelectorAll(".reveal:not([data-observed])");
  if (!("IntersectionObserver" in window)) {
    nodes.forEach((node) => node.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.08});
  nodes.forEach((node) => { node.dataset.observed = "true"; observer.observe(node); });
};

window.observeReveals();

const APPS = [
  {
    name: "Flourish",
    subtitle: "Affirmations · Wellbeing",
    appStoreId: "1613148062",
    appStoreUrl: "https://apps.apple.com/us/app/flourish-daily-affirmations/id1613148062",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.positivemindset.apps.flourish&pli=1",
    description: "A personalized affirmation product with streaks, widgets, reminders, collections, custom content, themes and cloud synchronization.",
    details: ["Full iOS product lifecycle, interface, persistence and releases", "RevenueCat, AdMob, Firebase Analytics, A/B testing and in-app messaging", "20+ localizations, widgets, alternative icons and sharing flows", "Native Kotlin Android app after an earlier Flutter prototype"],
    tags: ["Swift", "UIKit", "SwiftUI", "Core Data", "CloudKit", "Widgets", "Kotlin"]
  },
  {
    name: "QuoteUp",
    subtitle: "Motivation · Daily quotes",
    appStoreId: "1613717356",
    appStoreUrl: "https://apps.apple.com/us/app/quoteup-daily-motivation/id1613717356",
    description: "A focused daily motivation experience built around uplifting quotes and short moments of momentum."
  },
  {
    name: "MyVocab",
    subtitle: "Vocabulary · Learning",
    appStoreId: "1614457796",
    appStoreUrl: "https://apps.apple.com/us/app/myvocab-learn-new-words/id1614457796",
    description: "A multilingual vocabulary product with daily discovery, pronunciation, definitions, examples, reminders, widgets and personal word collections.",
    details: ["Daily discovery and repeatable learning flows", "Pronunciation, definitions, examples and categories", "Personal collections, reminders and widgets", "Localization and offline data"],
    tags: ["UIKit", "Core Data", "Notifications", "Localization", "Widgets"]
  },
  {
    name: "Factly",
    subtitle: "Knowledge · Discovery",
    appStoreId: "1614132181",
    appStoreUrl: "https://apps.apple.com/us/app/factly-learn-something-new/id1614132181",
    description: "Interesting facts and useful knowledge delivered in a light, accessible format."
  },
  {
    name: "Jokio",
    subtitle: "Humor · Entertainment",
    appStoreId: "1615177330",
    appStoreUrl: "https://apps.apple.com/us/app/jokio-funny-jokes/id1615177330",
    description: "Quick entertainment through a simple stream of jokes and light everyday content."
  },
  {
    name: "Bliss",
    subtitle: "Meditation · Sleep",
    appStoreId: "6449584852",
    appStoreUrl: "https://apps.apple.com/us/app/bliss-meditation-sleep/id6449584852",
    description: "A guided mindfulness product with meditations, breathing exercises, sleep stories, ambient audio, structured plans, statistics and offline playback.",
    details: ["Audio streaming and reliable offline downloads", "Cloud-managed content and Firebase integration", "Meditations, sleep stories, breathing and ambient audio", "Analytics, subscriptions and personal progress"],
    tags: ["Audio Streaming", "Downloads", "Firebase", "Analytics", "Subscriptions"]
  },
  {
    name: "Nova",
    subtitle: "Microlearning · Daily growth",
    appStoreId: "6744055041",
    appStoreUrl: "https://apps.apple.com/us/app/nova-daily-microlearning/id6744055041",
    description: "An original microlearning product with bite-sized lessons, topic journeys, quizzes, streaks, reminders, saved content and offline access.",
    details: ["Product concept, interface and release from the ground up", "100+ bite-sized lessons and topic-based journeys", "Quizzes, streaks, reminders and saved content", "Offline data and subscription flows"],
    tags: ["Product Design", "UIKit", "Offline Data", "Subscriptions", "Content"]
  }
];

const cache = new Map();

function jsonp(url) {
  return new Promise((resolve, reject) => {
    const callback = `pm_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const timeout = setTimeout(() => finish(new Error("timeout")), 10000);
    function finish(error, data) {
      clearTimeout(timeout);
      delete window[callback];
      script.remove();
      error ? reject(error) : resolve(data);
    }
    window[callback] = (data) => finish(null, data);
    script.onerror = () => finish(new Error("request failed"));
    script.src = `${url}${url.includes("?") ? "&" : "?"}callback=${callback}`;
    document.body.appendChild(script);
  });
}

async function metadata(id) {
  if (!cache.has(id)) {
    cache.set(id, jsonp(`https://itunes.apple.com/lookup?id=${id}&country=us`).then((data) => data?.results?.[0] || null));
  }
  return cache.get(id);
}

function storeLink(label, url) {
  return `<a class="button button-secondary" href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
}

function screen(src, alt) {
  if (!src) return `<div class="screen"><div class="placeholder">Preview</div></div>`;
  return `<div class="screen"><img src="${src}" alt="${alt}" loading="lazy"></div>`;
}

async function loadApp(app) {
  try {
    const data = await metadata(app.appStoreId);
    return {...app, icon: data?.artworkUrl512 || data?.artworkUrl100 || "/logo.svg", screens: (data?.screenshotUrls || []).slice(0, 3)};
  } catch {
    return {...app, icon: "/logo.svg", screens: []};
  }
}

function featuredProject(app, index) {
  const details = (app.details || []).map((item) => `<li>${item}</li>`).join("");
  const tags = (app.tags || []).map((tag) => `<span>${tag}</span>`).join("");
  return `
    <article class="featured-project reveal">
      <div class="project-copy">
        <p class="project-label">${app.subtitle}</p>
        <h3>${app.name}</h3>
        <p>${app.description}</p>
        ${details ? `<ul class="project-points">${details}</ul>` : ""}
        ${tags ? `<div class="project-tags">${tags}</div>` : ""}
        <div class="store-links">${storeLink("App Store", app.appStoreUrl)}${app.playStoreUrl ? storeLink("Google Play", app.playStoreUrl) : ""}</div>
      </div>
      <div class="screens">${[0,1,2].map((i) => screen(app.screens[i], `${app.name} screenshot ${i+1}`)).join("")}</div>
    </article>`;
}

async function renderHero(data) {
  const collage = document.querySelector("[data-hero-collage]");
  if (!collage) return;
  const choices = [["Flourish",0],["MyVocab",0],["Nova",0]];
  collage.innerHTML = choices.map(([name, n], i) => {
    const app = data.find((item) => item.name === name);
    const src = app?.screens?.[n];
    return `<div class="hero-shot hero-shot-${String.fromCharCode(97+i)}">${src ? `<img src="${src}" alt="${name} app interface">` : `<div class="placeholder">Preview</div>`}</div>`;
  }).join("");
}

async function renderStudio() {
  const featured = document.querySelector("[data-studio-featured]");
  const compact = document.querySelector("[data-studio-compact]");
  const collage = document.querySelector("[data-hero-collage]");
  if (!featured && !compact && !collage) return;
  const data = await Promise.all(APPS.map(loadApp));
  await renderHero(data);
  const featuredNames = ["Flourish", "MyVocab", "Nova", "Bliss"];
  const selected = featuredNames.map((name) => data.find((app) => app.name === name)).filter(Boolean);
  if (featured) featured.innerHTML = selected.map(featuredProject).join("");
  if (compact) {
    compact.innerHTML = data.filter((app) => !featuredNames.includes(app.name)).map((app) => `
      <a class="compact-app" href="${app.appStoreUrl}" target="_blank" rel="noopener noreferrer">
        <img src="${app.icon}" alt="${app.name} icon" loading="lazy">
        <span><strong>${app.name}</strong><small>${app.subtitle}</small></span><span class="text-link">App Store</span>
      </a>`).join("");
  }
  window.observeReveals?.();
}

async function renderCatalog() {
  const grid = document.querySelector("[data-app-catalog]");
  if (!grid) return;
  const data = await Promise.all(APPS.map(loadApp));
  grid.innerHTML = data.map((app, index) => `
    <article class="catalog-card reveal">
      <div class="catalog-copy">
        <div class="catalog-head"><img src="${app.icon}" alt="${app.name} icon" loading="lazy"><div><p class="project-label">${app.subtitle}</p><h2>${app.name}</h2></div></div>
        <p>${app.description}</p>
        <div class="store-links">${storeLink("App Store", app.appStoreUrl)}${app.playStoreUrl ? storeLink("Google Play", app.playStoreUrl) : ""}</div>
      </div>
      <div class="screens">${[0,1,2].map((i) => screen(app.screens[i], `${app.name} screenshot ${i+1}`)).join("")}</div>
    </article>`).join("");
  window.observeReveals?.();
}

renderStudio();
renderCatalog();

const APPS = [
  {
    name: "Flourish",
    subtitle: "Affirmations · Wellbeing",
    appStoreId: "1613148062",
    appStoreUrl: "https://apps.apple.com/us/app/flourish-daily-affirmations/id1613148062",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.positivemindset.apps.flourish&pli=1",
    description:
      "Daily affirmations for positive thinking, self-worth, gratitude and emotional resilience.",
  },
  {
    name: "QuoteUp",
    subtitle: "Motivation · Daily quotes",
    appStoreId: "1613717356",
    appStoreUrl: "https://apps.apple.com/us/app/quoteup-daily-motivation/id1613717356",
    description:
      "A focused daily motivation experience built around uplifting quotes and short moments of momentum.",
  },
  {
    name: "MyVocab",
    subtitle: "Vocabulary · Learning",
    appStoreId: "1614457796",
    appStoreUrl: "https://apps.apple.com/us/app/myvocab-learn-new-words/id1614457796",
    description:
      "Short, repeatable sessions that help users expand vocabulary and retain new words.",
  },
  {
    name: "Factly",
    subtitle: "Knowledge · Discovery",
    appStoreId: "1614132181",
    appStoreUrl: "https://apps.apple.com/us/app/factly-learn-something-new/id1614132181",
    description:
      "Interesting facts and useful knowledge delivered in a light, accessible format.",
  },
  {
    name: "Jokio",
    subtitle: "Humor · Entertainment",
    appStoreId: "1615177330",
    appStoreUrl: "https://apps.apple.com/us/app/jokio-funny-jokes/id1615177330",
    description:
      "Quick entertainment through a simple stream of jokes and light everyday content.",
  },
  {
    name: "Bliss",
    subtitle: "Meditation · Sleep",
    appStoreId: "6449584852",
    appStoreUrl: "https://apps.apple.com/us/app/bliss-meditation-sleep/id6449584852",
    description:
      "A meditation and sleep product with audio streaming, offline downloads, cloud-backed content and Firebase integration.",
  },
  {
    name: "Nova",
    subtitle: "Microlearning · Daily growth",
    appStoreId: "6744055041",
    appStoreUrl: "https://apps.apple.com/us/app/nova-daily-microlearning/id6744055041",
    description:
      "Practical microlearning designed to fit personal development into everyday life.",
  },
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
    cache.set(
      id,
      jsonp(`https://itunes.apple.com/lookup?id=${id}&country=us`).then(
        (data) => data?.results?.[0] || null,
      ),
    );
  }

  return cache.get(id);
}

function storeLink(label, url) {
  return `
    <a
      class="button button-secondary"
      href="${url}"
      target="_blank"
      rel="noopener noreferrer"
    >
      ${label}
    </a>
  `;
}

function screen(src, alt) {
  if (!src) {
    return `
      <div class="screen">
        <div class="placeholder">Preview</div>
      </div>
    `;
  }

  return `
    <div class="screen">
      <img src="${src}" alt="${alt}" loading="lazy">
    </div>
  `;
}

async function loadApp(app) {
  try {
    const appMetadata = await metadata(app.appStoreId);

    return {
      ...app,
      icon: appMetadata?.artworkUrl512 || appMetadata?.artworkUrl100 || "/logo.svg",
      screens: (appMetadata?.screenshotUrls || []).slice(0, 3),
    };
  } catch {
    return {
      ...app,
      icon: "/logo.svg",
      screens: [],
    };
  }
}

function featuredProject(app) {
  return `
    <article class="featured-project reveal">
      <div class="project-copy">
        <p class="project-label">Selected product</p>
        <h3>${app.name}</h3>
        <p>${app.description}</p>
        <div class="store-links">
          ${storeLink("App Store", app.appStoreUrl)}
          ${app.playStoreUrl ? storeLink("Google Play", app.playStoreUrl) : ""}
        </div>
      </div>

      <div class="screens">
        ${[0, 1, 2]
          .map((index) => screen(app.screens[index], `${app.name} screenshot ${index + 1}`))
          .join("")}
      </div>
    </article>
  `;
}

async function renderStudio() {
  const featured = document.querySelector("[data-studio-featured]");
  const compact = document.querySelector("[data-studio-compact]");

  if (!featured && !compact) {
    return;
  }

  const data = await Promise.all(APPS.map(loadApp));
  const featuredNames = ["Flourish", "MyVocab", "Nova", "Bliss"];
  const selectedApps = featuredNames.map((name) => data.find((app) => app.name === name));

  if (featured) {
    featured.innerHTML = selectedApps.map(featuredProject).join("");
  }

  if (compact) {
    const remainingApps = data.filter((app) => !featuredNames.includes(app.name));

    compact.innerHTML = remainingApps
      .map(
        (app) => `
          <a
            class="compact-app"
            href="${app.appStoreUrl}"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="${app.icon}" alt="${app.name} icon" loading="lazy">
            <span>
              <strong>${app.name}</strong>
              <small>${app.subtitle}</small>
            </span>
            <span class="text-link">App Store</span>
          </a>
        `,
      )
      .join("");
  }

  window.observeReveals?.();
}

async function renderCatalog() {
  const grid = document.querySelector("[data-app-catalog]");

  if (!grid) {
    return;
  }

  const data = await Promise.all(APPS.map(loadApp));

  grid.innerHTML = data
    .map(
      (app) => `
        <article class="catalog-card reveal">
          <div class="catalog-head">
            <img src="${app.icon}" alt="${app.name} icon" loading="lazy">
            <div>
              <p class="project-label">${app.subtitle}</p>
              <h2>${app.name}</h2>
            </div>
          </div>

          <p>${app.description}</p>

          <div class="screens">
            ${[0, 1, 2]
              .map((index) => screen(app.screens[index], `${app.name} screenshot ${index + 1}`))
              .join("")}
          </div>

          <div class="store-links">
            ${storeLink("App Store", app.appStoreUrl)}
            ${app.playStoreUrl ? storeLink("Google Play", app.playStoreUrl) : ""}
          </div>
        </article>
      `,
    )
    .join("");

  window.observeReveals?.();
}

renderStudio();
renderCatalog();

const APPS = [
  {
    name: 'Flourish',
    subtitle: 'Affirmations · Wellbeing',
    appStoreId: '1613148062',
    appStoreUrl: 'https://apps.apple.com/us/app/flourish-daily-affirmations/id1613148062',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.positivemindset.apps.flourish&pli=1',
    description:
      'A calm affirmations app designed to support positive thinking, self-worth, gratitude, and daily emotional resilience.'
  },
  {
    name: 'QuoteUp',
    subtitle: 'Motivation · Daily quotes',
    appStoreId: '1613717356',
    appStoreUrl: 'https://apps.apple.com/us/app/quoteup-daily-motivation/id1613717356',
    description:
      'Daily motivation in a focused format, helping users stay inspired with uplifting quotes and short moments of momentum.'
  },
  {
    name: 'MyVocab',
    subtitle: 'Vocabulary · Learning',
    appStoreId: '1614457796',
    appStoreUrl: 'https://apps.apple.com/us/app/myvocab-learn-new-words/id1614457796',
    description:
      'A compact vocabulary-building app created for learners who want to expand their word knowledge through short, repeatable sessions.'
  },
  {
    name: 'Factly',
    subtitle: 'Knowledge · Discovery',
    appStoreId: '1614132181',
    appStoreUrl: 'https://apps.apple.com/us/app/factly-learn-something-new/id1614132181',
    description:
      'An everyday learning app for discovering interesting facts and useful knowledge in a light, accessible format.'
  },
  {
    name: 'Jokio',
    subtitle: 'Humor · Entertainment',
    appStoreId: '1615177330',
    appStoreUrl: 'https://apps.apple.com/us/app/jokio-funny-jokes/id1615177330',
    description:
      'A simple humor app built for quick entertainment, offering a stream of jokes and light content for everyday enjoyment.'
  },
  {
    name: 'Bliss',
    subtitle: 'Meditation · Sleep',
    appStoreId: '6449584852',
    appStoreUrl: 'https://apps.apple.com/us/app/bliss-meditation-sleep/id6449584852',
    description:
      'A minimalist meditation and sleep companion focused on relaxation, calm routines, and better daily recovery.'
  },
  {
    name: 'Nova',
    subtitle: 'Microlearning · Daily growth',
    appStoreId: '6744055041',
    appStoreUrl: 'https://apps.apple.com/us/app/nova-daily-microlearning/id6744055041',
    description:
      'A microlearning experience designed to make personal development and practical learning easy to fit into everyday life.'
  }
];

const appsGrid = document.getElementById('apps-grid');
const template = document.getElementById('app-card-template');
const year = document.getElementById('year');
year.textContent = new Date().getFullYear();

appsGrid.innerHTML = '<p class="loading-state">Loading app previews…</p>';

function jsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = `pm_cb_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Request timed out'));
    }, 12000);

    function cleanup() {
      clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('JSONP request failed'));
    };

    const separator = url.includes('?') ? '&' : '?';
    script.src = `${url}${separator}callback=${callbackName}`;
    document.body.appendChild(script);
  });
}

async function fetchAppMetadata(appStoreId) {
  const url = `https://itunes.apple.com/lookup?id=${appStoreId}&country=us`;
  const data = await jsonp(url);
  return data?.results?.[0] || null;
}

function createStoreLink(label, href) {
  const a = document.createElement('a');
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.className = 'store-link';
  a.textContent = label;
  return a;
}

function createScreen(src, alt) {
  const frame = document.createElement('div');
  frame.className = 'screen-frame';
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.loading = 'lazy';
  frame.appendChild(img);
  return frame;
}

function fallbackScreens() {
  return Array.from({ length: 3 }).map((_, index) => {
    const frame = document.createElement('div');
    frame.className = 'screen-frame';
    frame.innerHTML = `<div style="height:100%;display:grid;place-items:center;padding:20px;text-align:center;color:#9fb0c4;font-size:0.95rem;line-height:1.5;">Preview ${index + 1}</div>`;
    return frame;
  });
}

async function renderApps() {
  appsGrid.innerHTML = '';

  for (const app of APPS) {
    const fragment = template.content.cloneNode(true);
    const card = fragment.querySelector('.app-card');
    const icon = fragment.querySelector('.app-icon');
    const title = fragment.querySelector('.app-title');
    const kicker = fragment.querySelector('.app-kicker');
    const description = fragment.querySelector('.app-description');
    const links = fragment.querySelector('.app-links');
    const screensRow = fragment.querySelector('.screens-row');

    title.textContent = app.name;
    kicker.textContent = app.subtitle;
    description.textContent = app.description;
    icon.alt = `${app.name} app icon`;

    links.appendChild(createStoreLink('App Store', app.appStoreUrl));
    if (app.playStoreUrl) {
      links.appendChild(createStoreLink('Google Play', app.playStoreUrl));
    }

    try {
      const metadata = await fetchAppMetadata(app.appStoreId);
      if (metadata?.artworkUrl512 || metadata?.artworkUrl100) {
        icon.src = metadata.artworkUrl512 || metadata.artworkUrl100;
      }

      const shots = (metadata?.screenshotUrls || []).slice(0, 3);
      if (shots.length) {
        shots.forEach((src, index) => {
          screensRow.appendChild(createScreen(src, `${app.name} screenshot ${index + 1}`));
        });
      } else {
        fallbackScreens().forEach((el) => screensRow.appendChild(el));
      }
    } catch (error) {
      fallbackScreens().forEach((el) => screensRow.appendChild(el));
      icon.src = 'logo.svg';
    }

    appsGrid.appendChild(fragment);
  }

  observeReveals();
}

function observeReveals() {
  const items = document.querySelectorAll('.reveal');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smallScreen = window.innerWidth < 820;

  if (reducedMotion || smallScreen) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach((item) => observer.observe(item));
}

renderApps().then(observeReveals);

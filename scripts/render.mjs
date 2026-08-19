// Fetches live GitHub data, renders every card in both themes into assets/.
// No dependencies, no third-party image services: Node 20 fetch + the GitHub APIs.
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { THEMES } from './theme.mjs';
import { weeklyCommits } from './commits.mjs';
import { hero } from './cards/hero.mjs';
import { stats } from './cards/stats.mjs';
import { langs } from './cards/langs.mjs';
import { pulse } from './cards/pulse.mjs';
import { stack3d } from './cards/stack3d.mjs';

const USER = process.env.GH_USER || 'stavthal';
const TOKEN = process.env.GITHUB_TOKEN;
const OUT = new URL('../assets/', import.meta.url);

const QUERY = `
query($login: String!) {
  viewer { login }
  user(login: $login) {
    createdAt
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: {field: PUSHED_AT, direction: DESC}) {
      totalCount
      nodes {
        pushedAt
        languages(first: 12, orderBy: {field: SIZE, direction: DESC}) {
          edges { size node { name color } }
        }
      }
    }
  }
}`;

async function fetchProfile() {
  if (!TOKEN) throw new Error('GITHUB_TOKEN is required.');
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: QUERY, variables: { login: USER } }),
  });
  if (!res.ok) throw new Error(`GitHub GraphQL ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

function shape(u, weeks) {
  const bytes = new Map();
  for (const r of u.repositories.nodes) {
    for (const e of r.languages.edges) {
      const cur = bytes.get(e.node.name) || { name: e.node.name, color: e.node.color, size: 0 };
      cur.size += e.size;
      bytes.set(e.node.name, cur);
    }
  }
  const languages = [...bytes.values()].sort((a, b) => b.size - a.size);
  const totals = weeks.map((w) => w.total);
  const sum = totals.reduce((a, b) => a + b, 0);
  const activeSince = Date.now() - 180 * 864e5;
  const month = (iso) => new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

  return {
    years: Math.max(1, Math.round((Date.now() - new Date(u.createdAt)) / 3.156e10)),
    repoCount: u.repositories.totalCount,
    activeRepos: u.repositories.nodes.filter((r) => r.pushedAt && Date.parse(r.pushedAt) > activeSince).length,
    langCount: languages.length,
    languages,
    weeks,
    commitsYear: sum,
    peakWeek: Math.max(0, ...totals),
    avgWeek: Math.round(sum / Math.max(1, totals.length)),
    activeWeeks: totals.filter((n) => n > 0).length,
    calStart: month(weeks[0].firstDay),
    calEnd: month(weeks[weeks.length - 1].firstDay),
    stamp: new Date().toISOString().slice(0, 10),
  };
}

const CARDS = { hero, stats, langs, pulse, stack3d };

// The weekly histogram costs ~2 minutes of paced search calls, so local iteration on the
// card designs can reuse the last result via RENDER_CACHE=1. CI always fetches fresh.
const CACHE = new URL('../.cache/weeks.json', import.meta.url);
const cached = process.env.RENDER_CACHE && existsSync(CACHE)
  ? JSON.parse(readFileSync(CACHE, 'utf8'))
  : null;

const [{ viewer, user }, weeks] = await Promise.all([
  fetchProfile(),
  cached ?? weeklyCommits(TOKEN, USER),
]);

if (process.env.RENDER_CACHE && !cached) {
  mkdirSync(new URL('../.cache/', import.meta.url), { recursive: true });
  writeFileSync(CACHE, JSON.stringify(weeks));
}

// A token that is not the profile owner still answers, but only ever sees public repos —
// so it renders a quietly smaller, wrong profile. That is the failure worth refusing.
if (viewer.login.toLowerCase() !== USER.toLowerCase()) {
  throw new Error(`token belongs to "${viewer.login}", not "${USER}" — it can only see public `
    + 'repositories. Set a METRICS_TOKEN secret (classic PAT, repo + read:user scopes).');
}

const data = shape(user, weeks);

// Second net: even an owner token can be scoped too narrowly. Compare against the numbers
// last committed and refuse a material regression rather than overwrite good cards.
const prevPath = new URL('data.json', OUT);
if (existsSync(prevPath)) {
  const prev = JSON.parse(readFileSync(prevPath, 'utf8'));
  const shrunk = ['repoCount', 'langCount', 'commitsYear']
    .filter((k) => prev[k] && data[k] < prev[k] * 0.9)
    .map((k) => `${k} ${prev[k]} -> ${data[k]}`);
  if (shrunk.length) {
    throw new Error(`refusing to render from thinner data than last time (${shrunk.join(', ')}).`);
  }
}

mkdirSync(OUT, { recursive: true });
for (const [name, render] of Object.entries(CARDS)) {
  for (const theme of Object.values(THEMES)) {
    writeFileSync(new URL(`${name}-${theme.id}.svg`, OUT), render(theme, data));
  }
}
writeFileSync(new URL('data.json', OUT), JSON.stringify({
  repoCount: data.repoCount, langCount: data.langCount,
  commitsYear: data.commitsYear, stamp: data.stamp,
}, null, 2) + '\n');

console.log(`rendered ${Object.keys(CARDS).length * 2} cards`, {
  commits: data.commitsYear, peakWeek: data.peakWeek, avgWeek: data.avgWeek,
  repos: data.repoCount, langs: data.langCount,
});

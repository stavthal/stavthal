// Fetches live GitHub data, renders every card in both themes into assets/.
// No dependencies, no third-party image services: Node 20 fetch + the GitHub GraphQL API.
import { writeFileSync, mkdirSync } from 'node:fs';
import { THEMES } from './theme.mjs';
import { hero } from './cards/hero.mjs';
import { stats } from './cards/stats.mjs';
import { langs } from './cards/langs.mjs';
import { pulse } from './cards/pulse.mjs';

const USER = process.env.GH_USER || 'stavthal';
const TOKEN = process.env.GITHUB_TOKEN;
const OUT = new URL('../assets/', import.meta.url);

const QUERY = `
query($login: String!) {
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
    contributionsCollection {
      totalCommitContributions
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks { firstDay contributionDays { contributionCount } }
      }
    }
  }
}`;

async function fetchData() {
  if (!TOKEN) throw new Error('GITHUB_TOKEN is required (repo-scoped read is enough).');
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: QUERY, variables: { login: USER } }),
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data.user;
}

function shape(u) {
  const repos = u.repositories.nodes;
  const bytes = new Map();
  for (const r of repos) {
    for (const e of r.languages.edges) {
      const cur = bytes.get(e.node.name) || { name: e.node.name, color: e.node.color, size: 0 };
      cur.size += e.size;
      bytes.set(e.node.name, cur);
    }
  }
  const languages = [...bytes.values()].sort((a, b) => b.size - a.size);

  const cal = u.contributionsCollection.contributionCalendar;
  const weeks = cal.weeks.map((w) => {
    // Pad short leading/trailing weeks to 7 so the heatmap grid stays rectangular.
    const days = w.contributionDays.map((d) => d.contributionCount);
    while (days.length < 7) days.push(0);
    return { firstDay: w.firstDay, days, total: days.reduce((s, n) => s + n, 0) };
  });

  const flat = weeks.flatMap((w) => w.days);
  const streaks = flat.reduce((acc, n) => {
    acc.run = n > 0 ? acc.run + 1 : 0;
    acc.longest = Math.max(acc.longest, acc.run);
    return acc;
  }, { run: 0, longest: 0 });

  const cutoff = Date.now() - 180 * 864e5;
  const fmt = (iso) => new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

  return {
    years: Math.max(1, Math.round((Date.now() - new Date(u.createdAt)) / 3.156e10)),
    repoCount: u.repositories.totalCount,
    activeRepos: repos.filter((r) => r.pushedAt && Date.parse(r.pushedAt) > cutoff).length,
    langCount: languages.length,
    languages,
    commitsYear: u.contributionsCollection.totalCommitContributions
      + u.contributionsCollection.restrictedContributionsCount,
    weeks,
    calTotal: cal.totalContributions,
    peakDay: Math.max(0, ...flat),
    longestStreak: streaks.longest,
    currentStreak: streaks.run,
    calStart: fmt(weeks[0].firstDay),
    calEnd: fmt(weeks[weeks.length - 1].firstDay),
    stamp: new Date().toISOString().slice(0, 10),
  };
}

const CARDS = { hero, stats, langs, pulse };

const user = await fetchData();
const data = shape(user);

// A token without access to private repos still returns a valid-but-empty response.
// Refuse to overwrite good cards with a hollow one — CI needs a PAT, not GITHUB_TOKEN.
const thin = [
  data.repoCount === 0 && 'no repositories',
  data.languages.length === 0 && 'no language bytes',
  data.calTotal === 0 && 'no contributions',
].filter(Boolean);
if (thin.length) {
  throw new Error(`refusing to render from thin data (${thin.join(', ')}) — `
    + 'the token likely lacks repo/read:user scope for private contributions.');
}
mkdirSync(OUT, { recursive: true });

for (const [name, render] of Object.entries(CARDS)) {
  for (const theme of Object.values(THEMES)) {
    const file = new URL(`${name}-${theme.id}.svg`, OUT);
    writeFileSync(file, render(theme, data));
  }
}
console.log(`rendered ${Object.keys(CARDS).length * 2} cards`, {
  commits: data.commitsYear, repos: data.repoCount, langs: data.langCount, weeks: data.weeks.length,
});

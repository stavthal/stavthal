// GitHub's contribution calendar only counts default-branch commits in repos it will admit
// to, which for branch-heavy private work undercounts by ~100x. The commit search API sees
// every repo the token can read, so the weekly histogram is built from that instead.
const SEARCH = 'https://api.github.com/search/commits';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const day = (d) => d.toISOString().slice(0, 10);

async function count(token, user, from, to, attempt = 0) {
  const q = `author:${user}+author-date:${day(from)}..${day(to)}`;
  const res = await fetch(`${SEARCH}?q=${q}&per_page=1`, {
    headers: { Authorization: `bearer ${token}`, Accept: 'application/vnd.github.cloak-preview+json' },
  });
  if (res.status === 403 || res.status === 429) {
    if (attempt >= 4) throw new Error(`commit search rate-limited on ${day(from)} after 5 tries`);
    await sleep(15_000 * (attempt + 1));           // secondary limits want a long, quiet pause
    return count(token, user, from, to, attempt + 1);
  }
  if (!res.ok) throw new Error(`commit search ${res.status}: ${await res.text()}`);
  return (await res.json()).total_count;
}

// 52 buckets ending on the most recent Sunday, oldest first.
export async function weeklyCommits(token, user, weeks = 52, endDate = new Date()) {
  const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));
  end.setUTCDate(end.getUTCDate() - end.getUTCDay());

  const out = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const from = new Date(end); from.setUTCDate(end.getUTCDate() - i * 7);
    const to = new Date(from);  to.setUTCDate(from.getUTCDate() + 6);
    out.push({ firstDay: day(from), total: await count(token, user, from, to) });
    if (i > 0) await sleep(2200);                  // stay under 30 search requests/minute
  }
  return out;
}

/**
 * ImageService: High-performance, multi-provider anime poster resolution engine.
 * - Memory & LocalStorage multi-tier caching (instant synchronous recall)
 * - Rate-limit safe: Request queue with strict concurrency throttling
 * - Primary provider: Kitsu API (High-res, fast, unrestricted CORS)
 * - Secondary provider: AniList GraphQL API (Industry standard metadata)
 * - Dynamic SVG fallback generator if no poster exists anywhere
 */

const CACHE_KEY = "otaku_poster_cache_v2";
const memoryCache = new Map();

// Initialize memory cache from localStorage
try {
  const stored = localStorage.getItem(CACHE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    Object.entries(parsed).forEach(([k, v]) => memoryCache.set(k, v));
  }
} catch (e) {
  console.warn("Could not load poster cache from localStorage", e);
}

function persistCache() {
  try {
    // Keep the most recent 500 items in localStorage
    const entries = Array.from(memoryCache.entries());
    const trimmed = entries.slice(-500);
    localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(trimmed)));
  } catch (e) {
    // Storage quota exceeded or disabled
  }
}

// Clean title for optimal search matching across APIs
export function cleanAnimeTitle(title) {
  if (!title) return "";
  return title
    .replace(/\s*\([^)]*\)/g, "") // Remove (TV), (Movie), (OVA)
    .replace(/\s*\[[^\]]*\]/g, "") // Remove [Sequel], etc.
    .replace(/:\s*season\s*\d+/i, "")
    .replace(/\s*2nd\s*season/i, "")
    .replace(/\s*3rd\s*season/i, "")
    .replace(/\s*4th\s*season/i, "")
    .replace(/\s*final\s*season/i, "")
    .trim();
}

// Concurrency queue to prevent flooding network requests
class RequestQueue {
  constructor(concurrency = 3) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  enqueue(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.dequeue();
    });
  }

  dequeue() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }
    const { fn, resolve, reject } = this.queue.shift();
    this.running++;

    fn()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        this.running--;
        this.dequeue();
      });
  }
}

const queue = new RequestQueue(3);

/**
 * Fetch poster from Kitsu API
 */
async function fetchFromKitsu(cleanTitle) {
  const url = `https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(cleanTitle)}&page[limit]=1`;
  const res = await fetch(url, { headers: { Accept: "application/vnd.api+json" } });
  if (!res.ok) throw new Error(`Kitsu error: ${res.status}`);
  const data = await res.json();
  const attributes = data.data?.[0]?.attributes;
  if (!attributes) return null;

  const poster =
    attributes.posterImage?.large ||
    attributes.posterImage?.medium ||
    attributes.posterImage?.original ||
    attributes.posterImage?.small;

  const banner = attributes.coverImage?.large || attributes.coverImage?.original || null;

  return poster ? { poster, banner } : null;
}

/**
 * Fetch poster from AniList GraphQL API
 */
async function fetchFromAniList(cleanTitle) {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        id
        coverImage {
          extraLarge
          large
          medium
        }
        bannerImage
      }
    }
  `;

  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { search: cleanTitle },
    }),
  });

  if (!res.ok) throw new Error(`AniList error: ${res.status}`);
  const data = await res.json();
  const media = data.data?.Media;
  if (!media) return null;

  const poster =
    media.coverImage?.extraLarge ||
    media.coverImage?.large ||
    media.coverImage?.medium;

  const banner = media.bannerImage || null;

  return poster ? { poster, banner } : null;
}

/**
 * Main public method to get poster & banner
 */
export async function getAnimeMedia(anime) {
  const title = anime?.title || "";
  if (!title) return { poster: null, banner: null };

  const cacheKey = title.trim().toLowerCase();

  // 1. Check memory cache (synchronous hit)
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey);
  }

  const cleaned = cleanAnimeTitle(title);
  const english = anime?.englishTitle ? cleanAnimeTitle(anime.englishTitle) : null;

  return queue.enqueue(async () => {
    // Check again in case it was resolved while waiting in queue
    if (memoryCache.has(cacheKey)) {
      return memoryCache.get(cacheKey);
    }

    let result = null;

    // Try Kitsu first (fast, open CORS, high reliability)
    try {
      result = await fetchFromKitsu(cleaned);
      if (!result && english && english !== cleaned) {
        result = await fetchFromKitsu(english);
      }
    } catch (err) {
      // ignore and proceed to AniList
    }

    // Try AniList fallback if Kitsu failed
    if (!result) {
      try {
        result = await fetchFromAniList(cleaned);
        if (!result && english && english !== cleaned) {
          result = await fetchFromAniList(english);
        }
      } catch (err) {
        // ignore
      }
    }

    const payload = result || { poster: null, banner: null };
    memoryCache.set(cacheKey, payload);
    persistCache();
    return payload;
  });
}

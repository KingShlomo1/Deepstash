/* Video link parsing. Pure — takes a URL string, returns how to render it. */

export const PLAT_COLOR = {
  YouTube: "#ff0033", TikTok: "#00f2ea", Instagram: "#e1306c",
  Vimeo: "#19b7ea", Video: "#e8b563", Link: "#e8b563",
};

/** True when `host` is `domain` itself or a subdomain of it. */
function isHost(host, domain) {
  return host === domain || host.endsWith("." + domain);
}

/** YouTube ids are [A-Za-z0-9_-]; anything else is not an id we will embed. */
const ID_RE = /^[A-Za-z0-9_-]{6,20}$/;

export function searchURL(plat, q) {
  const e = encodeURIComponent(q);
  if (plat === "YouTube") return `https://www.youtube.com/results?search_query=${e}`;
  if (plat === "TikTok") return `https://www.tiktok.com/search?q=${e}`;
  return `https://www.instagram.com/explore/tags/${q.toLowerCase().replace(/[^a-z0-9]/g, "")}/`;
}

/**
 * Parse a pasted video link.
 * Returns { platform, kind, vert, embed?, open } or null when unparseable.
 * Host matching is anchored, so lookalike domains (evil-youtube.com) are
 * treated as plain links rather than as the platform they imitate.
 */
export function parseVideo(raw) {
  let url = ("" + (raw ?? "")).trim();
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;

  let u;
  try { u = new URL(url); } catch { return null; }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;

  const h = u.hostname.replace(/^www\./, "");
  const link = (platform, vert) => ({ platform, kind: "link", vert, open: url });

  if (isHost(h, "youtu.be")) {
    const id = u.pathname.slice(1);
    return ID_RE.test(id) ? youtube(id, false, url) : link("YouTube", false);
  }

  if (isHost(h, "youtube.com") || isHost(h, "youtube-nocookie.com")) {
    const seg = u.pathname.split("/").filter(Boolean);
    if (seg[0] === "shorts" && ID_RE.test(seg[1] || "")) return youtube(seg[1], true, url);
    if (seg[0] === "embed" && ID_RE.test(seg[1] || "")) return youtube(seg[1], false, url);
    const id = u.searchParams.get("v") || "";
    return ID_RE.test(id) ? youtube(id, false, url) : link("YouTube", false);
  }

  if (isHost(h, "tiktok.com")) {
    const m = u.pathname.match(/\/video\/(\d{6,25})(?:\/|$)/);
    if (m) return { platform: "TikTok", kind: "iframe", vert: true, embed: `https://www.tiktok.com/embed/v2/${m[1]}`, open: url };
    return link("TikTok", true);
  }

  if (isHost(h, "instagram.com")) {
    const m = u.pathname.match(/^\/(reel|reels|p|tv)\/([A-Za-z0-9_-]{3,30})(?:\/|$)/);
    if (m) {
      const kind = m[1] === "reels" ? "reel" : m[1];
      return { platform: "Instagram", kind: "iframe", vert: true, embed: `https://www.instagram.com/${kind}/${m[2]}/embed`, open: url };
    }
    return link("Instagram", true);
  }

  if (isHost(h, "vimeo.com") || isHost(h, "player.vimeo.com")) {
    const m = u.pathname.match(/^\/(?:video\/)?(\d{6,15})(?:\/|$)/);
    if (m) return { platform: "Vimeo", kind: "iframe", vert: false, embed: `https://player.vimeo.com/video/${m[1]}`, open: url };
    return link("Vimeo", false);
  }

  if (/\.(mp4|webm|ogg|mov)$/i.test(u.pathname))
    return { platform: "Video", kind: "video", vert: false, embed: url, open: url };

  return link("Link", false);
}

function youtube(id, vert, url) {
  return {
    platform: "YouTube", kind: "iframe", vert,
    embed: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?playsinline=1&rel=0`,
    open: url,
  };
}

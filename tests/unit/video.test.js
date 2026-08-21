import { describe, it, expect } from "vitest";
import { parseVideo, searchURL, PLAT_COLOR } from "../../src/lib/video.js";

describe("parseVideo — recognised platforms", () => {
  it.each([
    ["https://youtu.be/dQw4w9WgXcQ",                          "YouTube",   "iframe", false],
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ",            "YouTube",   "iframe", false],
    ["https://m.youtube.com/watch?v=dQw4w9WgXcQ",              "YouTube",   "iframe", false],
    ["youtube.com/watch?v=dQw4w9WgXcQ",                        "YouTube",   "iframe", false],
    ["https://www.youtube.com/shorts/abc_123-XY",              "YouTube",   "iframe", true],
    ["https://www.youtube.com/embed/dQw4w9WgXcQ",              "YouTube",   "iframe", false],
    ["https://www.tiktok.com/@user/video/7212345678901234567", "TikTok",    "iframe", true],
    ["https://www.instagram.com/reel/CxYz123abc/",             "Instagram", "iframe", true],
    ["https://www.instagram.com/p/CxYz123abc/",                "Instagram", "iframe", true],
    ["https://vimeo.com/123456789",                            "Vimeo",     "iframe", false],
    ["https://example.com/clip.mp4",                           "Video",     "video",  false],
    ["https://example.com/clip.MOV",                           "Video",     "video",  false],
    ["https://example.com/article",                            "Link",      "link",   false],
  ])("%s -> %s/%s", (url, platform, kind, vert) => {
    const r = parseVideo(url);
    expect(r).toMatchObject({ platform, kind, vert });
  });
});

describe("parseVideo — lookalike hosts are not the platform", () => {
  // The previous implementation used unanchored regexes (/youtube\.com$/),
  // so any domain *ending* in the brand string was treated as first-party.
  it.each([
    "https://evil-youtube.com/watch?v=dQw4w9WgXcQ",
    "https://nottiktok.com/video/7212345678901234567",
    "https://myinstagram.com/reel/CxYz123abc/",
    "https://fakevimeo.com/123456789",
    "https://youtube.com.attacker.test/watch?v=dQw4w9WgXcQ",
  ])("%s is a plain link", (url) => {
    const r = parseVideo(url);
    expect(r.platform).toBe("Link");
    expect(r.embed).toBeUndefined();
  });

  it("still accepts real subdomains", () => {
    expect(parseVideo("https://music.youtube.com/watch?v=dQw4w9WgXcQ").platform).toBe("YouTube");
  });
});

describe("parseVideo — malformed input never yields a broken embed", () => {
  it.each([
    "https://www.youtube.com/shorts/",
    "https://www.youtube.com/watch?v=",
    "https://youtu.be/",
    'https://www.youtube.com/watch?v=" onload="alert(1)',
    "https://www.youtube.com/watch?v=<script>",
    "https://vimeo.com/staffpicks/page2",
    "https://www.tiktok.com/@user/video/abc",
  ])("%s produces no iframe", (url) => {
    const r = parseVideo(url);
    expect(r.kind).toBe("link");
    expect(r.embed).toBeUndefined();
  });

  it.each([null, undefined, "", "   ", "javascript:alert(1)", "data:text/html,<script>", "not a url at all %%%"])(
    "%p is rejected or downgraded", (raw) => {
      const r = parseVideo(raw);
      expect(r === null || r.kind === "link").toBe(true);
    });

  it("percent-encodes any id it does embed", () => {
    const r = parseVideo("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(r.embed).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?playsinline=1&rel=0");
    expect(r.embed).not.toMatch(/["'<>]/);
  });

  it("always reports a platform colour for whatever it returns", () => {
    for (const url of ["https://youtu.be/dQw4w9WgXcQ", "https://x.test/a", "https://vimeo.com/123456789"]) {
      expect(PLAT_COLOR[parseVideo(url).platform]).toBeDefined();
    }
  });
});

describe("searchURL", () => {
  it("escapes the query", () => {
    expect(searchURL("YouTube", "a b&c")).toBe("https://www.youtube.com/results?search_query=a%20b%26c");
    expect(searchURL("TikTok", "a b&c")).toBe("https://www.tiktok.com/search?q=a%20b%26c");
  });
  it("reduces Instagram queries to a bare tag", () => {
    expect(searchURL("Instagram", "Full Body!")).toBe("https://www.instagram.com/explore/tags/fullbody/");
  });
});

describe("parseVideo — Instagram and Vimeo aliases", () => {
  it("normalises the /reels/ alias onto /reel/", () => {
    const r = parseVideo("https://www.instagram.com/reels/CxYz123abc/");
    expect(r.embed).toBe("https://www.instagram.com/reel/CxYz123abc/embed");
  });

  it("handles /tv/ posts", () => {
    expect(parseVideo("https://www.instagram.com/tv/CxYz123abc/").kind).toBe("iframe");
  });

  it("accepts a player.vimeo.com/video/ URL", () => {
    expect(parseVideo("https://player.vimeo.com/video/123456789").platform).toBe("Vimeo");
  });

  it("falls back to a link for an Instagram profile URL", () => {
    const r = parseVideo("https://www.instagram.com/someuser/");
    expect(r).toMatchObject({ platform: "Instagram", kind: "link", vert: true });
  });

  it("falls back to a link for a TikTok profile URL", () => {
    expect(parseVideo("https://www.tiktok.com/@someuser").kind).toBe("link");
  });
});

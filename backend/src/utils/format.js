import sanitizeHtml from "sanitize-html";
import slugify from "slugify";

export function makeSlug(value) {
  return slugify(value || "", { lower: true, strict: true, trim: true });
}

export function estimateReadTime(content = "") {
  const words = stripHtml(content).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function stripHtml(content = "") {
  return content.replace(/<[^>]*>/g, " ");
}

export function sanitizeRichText(content = "") {
  return sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "h1",
      "h2",
      "h3",
      "h4",
      "iframe",
      "pre",
      "code",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td"
    ]),
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "loading"],
      iframe: ["src", "width", "height", "allow", "allowfullscreen", "title"],
      "*": ["class"]
    },
    allowedIframeHostnames: ["www.youtube.com", "player.vimeo.com"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" })
    }
  });
}

export function trendScore(post) {
  const views = Number(post.views || 0);
  const likes = Number(post.likes || 0);
  const comments = Number(post.commentCount || 0);
  const published = post.publishedAt?.toMillis?.() || Date.now();
  const ageHours = Math.max(1, (Date.now() - published) / 36e5);
  return Math.round(((views * 0.2 + likes * 2 + comments * 3) / ageHours) * 100) / 100;
}

export function toDoc(doc) {
  return { id: doc.id, ...doc.data() };
}

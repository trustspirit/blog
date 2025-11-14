/**
 * Extracts YouTube video ID from various YouTube URL formats
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Creates YouTube embed iframe HTML
 */
function createYouTubeEmbed(videoId: string): string {
  const cleanVideoId = videoId.split("&")[0].split("?")[0];
  return `<div class="youtube-embed-container">
    <iframe
      width="560"
      height="315"
      src="https://www.youtube.com/embed/${cleanVideoId}"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    ></iframe>
  </div>`;
}

/**
 * Converts YouTube URLs in HTML content to embedded iframes
 */
export function embedYouTubeVideos(html: string): string {
  // Pattern to match YouTube URLs in href attributes
  const hrefPattern =
    /<a[^>]*href=["'](https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^"'\s&]+)[^>]*>.*?<\/a>/gi;

  // Pattern to match plain YouTube URLs (standalone, not in tags)
  const plainUrlPattern =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s<"']+)/gi;

  // Process plain URLs FIRST (before any string modifications)
  // This ensures offset-based context checking works correctly
  let processed = html.replace(plainUrlPattern, (match, videoId, offset) => {
    // Check context in the ORIGINAL string to see if URL is inside HTML tags
    const start = Math.max(0, offset - 20);
    const end = Math.min(html.length, offset + match.length + 20);
    const context = html.substring(start, end);

    // Skip if it's inside an HTML tag (has < before and > after)
    // or if it's part of an href attribute (will be handled by hrefPattern)
    if (
      (context.includes("<") && context.includes(">")) ||
      context.includes("href=") ||
      context.includes("src=")
    ) {
      return match;
    }

    return createYouTubeEmbed(videoId);
  });

  // Then, replace YouTube links in anchor tags
  // These are processed after plain URLs to avoid double-processing
  processed = processed.replace(hrefPattern, (match, protocol, videoId) => {
    // Skip if this anchor tag is already inside an embed container
    if (match.includes("youtube-embed-container")) {
      return match;
    }

    return createYouTubeEmbed(videoId);
  });

  return processed;
}

/**
 * Checks if a URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/.test(url);
}

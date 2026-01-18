export const YOUTUBE_REGEX =
	/(?:https?:\/\/)?(?:(?:(?:www\.|m\.)?youtube\.com|music\.youtube\.com)\/(?:shorts\/|live\/|watch\?v=|v\/|e(?:mbed)?\/|[^/\n\s]+\/\S+\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

/**
 * Extracts the video ID from a YouTube URL or returns 'instagram' for Instagram URLs.
 * @param {string} url
 * @returns {string | null}
 */
export const findVideoId = (url) => {
	if (!url) return null;
	const match = url.match(YOUTUBE_REGEX);
	if (match) return match[1];
	if (url.includes('instagram.com') || url.includes('instagr.am')) return 'instagram';
	return null;
};

/**
 * Detects the service based on the URL.
 * @param {string} url
 * @returns {'youtube' | 'instagram' | null}
 */
export const getService = (url) => {
	if (!url) return null;
	if (url.includes('instagram.com') || url.includes('instagr.am')) return 'instagram';
	if (url.match(YOUTUBE_REGEX)) return 'youtube';
	return null;
};

/**
 * Checks if the URL is an Instagram URL.
 * @param {unknown} value
 * @returns {boolean}
 */
export const isInstagramUrl = (value) =>
	typeof value === 'string' && (value.includes('instagram.com') || value.includes('instagr.am'));

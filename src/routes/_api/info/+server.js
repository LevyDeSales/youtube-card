import { error, json } from '@sveltejs/kit';
import { youtube } from '@googleapis/youtube';

import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import 'dayjs/locale/en';
import 'dayjs/locale/it';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';

/**
 * @param {string} countryCode
 */
function countryToFlag(countryCode) {
	// Vérifie que le code pays est valide (deux lettres)
	if (countryCode.length !== 2) {
		return '';
	}

	// Convertit le code pays en un emoji de drapeau
	return countryCode
		.toUpperCase()
		.split('')
		.map((/** @type {string} */ char) => String.fromCodePoint(0x1f1e6 - 65 + char.charCodeAt(0)))
		.join('');
}

/**
 * @type {import("./$types").RequestHandler}
 */
export const POST = async ({ request }) => {
	const { videoId, language, url } = await request.json();
	console.log(`[API] Processing request: videoId=${videoId}, url=${url}`);

	if (!videoId && !url) {
		console.error('[API] Missing videoId or url');
		return error(400, 'Missing videoId or url');
	}

	const isInstagram =
		videoId === 'instagram' ||
		(typeof url === 'string' && (url.includes('instagram.com') || url.includes('instagr.am')));

	if (isInstagram) {
		console.log('[API] Detected Instagram request');
		if (!url || typeof url !== 'string') {
			console.error('[API] Missing url for Instagram');
			return error(400, 'Missing url for Instagram');
		}

		return await getInstagramInfo(url);
	}

	console.log('[API] Detected YouTube request');
	if (!videoId || typeof videoId !== 'string') {
		console.error('[API] Missing videoId');
		return error(400, 'Missing videoId');
	}

	const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

	if (!apiKey) {
		console.error('VITE_GOOGLE_API_KEY is not defined');
		return error(500, 'Server configuration error');
	}

	try {
		const youtubeClient = youtube({
			auth: apiKey,
			version: 'v3'
		});

		const videoResponse = await youtubeClient.videos.list({
			part: ['snippet', 'contentDetails', 'statistics', 'liveStreamingDetails'],
			id: [videoId]
		});

		if (videoResponse?.data?.items == null || videoResponse?.data?.items?.length === 0) {
			return error(404, 'Video not found');
		}

		const channelId = videoResponse.data.items[0]?.snippet?.channelId;
		if (!channelId) return error(404, 'Channel not found');

		const channelResponse = await youtubeClient.channels.list({
			part: ['snippet', 'contentDetails', 'statistics'],
			id: [channelId]
		});

		const videoInfo = videoResponse.data.items[0];
		const channelInfo = channelResponse.data.items?.[0];
		if (!channelInfo) return error(404, 'Channel not found');

		dayjs.locale(language || 'en');
		dayjs.extend(duration);
		dayjs.extend(relativeTime);

		sendStatistics(channelInfo, videoInfo);

		return json({
			thumbnailUrl:
				videoInfo?.snippet?.thumbnails?.maxres?.url ||
				videoInfo?.snippet?.thumbnails?.high?.url ||
				videoInfo?.snippet?.thumbnails?.default?.url ||
				'',
			thumbnail: await imageToBase64(
				videoInfo?.snippet?.thumbnails?.maxres?.url ||
					videoInfo?.snippet?.thumbnails?.high?.url ||
					videoInfo?.snippet?.thumbnails?.default?.url ||
					''
			),
			channelLogoUrl: channelInfo?.snippet?.thumbnails?.default?.url || '',
			channelLogo: await imageToBase64(channelInfo?.snippet?.thumbnails?.default?.url || ''),
			title: videoInfo?.snippet?.title || 'Title not found',
			channel: channelInfo?.snippet?.title || 'Channel not found',
			subscribers: formatViews(channelInfo?.statistics?.subscriberCount || 0),
			views: formatViews(videoInfo?.statistics?.viewCount || 0),
			likes: formatViews(videoInfo?.statistics?.likeCount || 0),
			time: dayjs(videoInfo?.snippet?.publishedAt).fromNow(),
			duration: dayjs.duration(videoInfo?.contentDetails?.duration || 'PT0S').format('mm:ss'),
			isLive: videoInfo?.snippet?.liveBroadcastContent === 'live',
			viewers: formatViews(videoInfo?.liveStreamingDetails?.concurrentViewers || 0),
			isUpcoming: videoInfo?.snippet?.liveBroadcastContent === 'upcoming',
			startDate: formatDate(videoInfo?.liveStreamingDetails?.scheduledStartTime)
		});
	} catch (e) {
		console.error('YouTube fetch error:', e);
		return error(500, 'Failed to fetch video info');
	}
};

/**
 *
 * @param {string | null | undefined} dateString
 * @returns
 */
function formatDate(dateString) {
	if (!dateString) return '';
	const date = dayjs(dateString);
	return date.format('DD/MM/YYYY HH:mm');
}

/**
 *
 * @param {any} channel
 * @param {any} video
 */
function sendStatistics(channel, video) {
	if (!import.meta.env.VITE_STATISTICS) return console.warn('No statistics URL found');
	try {
		fetch(import.meta.env.VITE_STATISTICS, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				content: null,
				embeds: [
					{
						description: `## [${video?.snippet?.title || 'Title not found'}](https://www.youtube.com/watch?v=${video?.id})`,
						color: 14307151,
						fields: [],
						image: {
							url:
								video?.snippet?.thumbnails?.maxres?.url ||
								video?.snippet?.thumbnails?.high?.url ||
								video?.snippet?.thumbnails?.default?.url
						},
						footer: {
							text: `📅 ${formatDate(video?.liveStreamingDetails?.scheduledStartTime || video?.snippet?.publishedAt)} | 👁️ ${formatViews(video?.statistics.viewCount)} | 👍 ${video?.statistics?.likeCount || '...'} | 💬 ${video?.statistics?.commentCount || '...'} | ${countryToFlag(channel?.snippet?.country)}`
						}
					}
				],
				username: channel?.snippet?.title || 'Channel not found',
				avatar_url: channel?.snippet?.thumbnails?.default?.url || null,
				attachments: []
			})
		}).catch((error) => {
			console.error('Error while sending statistics :', error);
		});
	} catch (error) {
		console.error('Error while sending statistics :', error);
	}
}

/**
 *
 * @param {string|number} views
 * @returns
 */
const formatViews = (views) => {
	if (!views) return '0';

	const normalizedViews = typeof views === 'string' ? views.replace(/[^\d]/g, '') : views;
	const numViews =
		typeof normalizedViews === 'string' ? parseInt(normalizedViews, 10) : normalizedViews;
	if (isNaN(numViews)) return '0';

	/**
	 * @type {Record<string, number>}
	 */
	const abbreviations = {
		Md: 1000000000,
		M: 1000000,
		k: 1000
	};

	for (const symbol in abbreviations) {
		if (numViews >= abbreviations[symbol]) {
			const abbreviatedViews = numViews / abbreviations[symbol];

			const roundedViews = Math.round(abbreviatedViews * 10) / 10;
			return `${roundedViews} ${symbol}`;
		}
	}

	return numViews.toString();
};

/**
 *
 * @param {string} url
 * @returns
 */
const imageToBase64 = async (url) => {
	try {
		if (!url) return null;
		const response = await fetch(url);
		if (!response.ok) return null;
		const imageData = await response.arrayBuffer();

		const base64Image = Buffer.from(imageData).toString('base64');
		const contentType = response.headers.get('content-type') || 'image/png';
		return `data:${contentType};base64,${base64Image}`;
	} catch (error) {
		console.error('Error while converting image to base64 :', error);
		// Return a transparent 1x1 pixel or null if failed
		return null;
	}
};

/**
 * @param {string} rawUrl
 * @returns {string | null}
 */
const extractInstagramUsernameFromUrl = (rawUrl) => {
	try {
		const parsed = new URL(rawUrl);
		const parts = parsed.pathname.split('/').filter(Boolean);
		const first = parts[0];
		if (!first) return null;
		if (['p', 'reel', 'tv', 'stories', 'explore'].includes(first)) return null;
		return first;
	} catch {
		return null;
	}
};

/**
 * @param {string} html
 * @returns {string | null}
 */
const extractInstagramUsernameFromHtml = (html) => {
	const match =
		html.match(/"owner"\s*:\s*\{[^}]*"username"\s*:\s*"([^"]+)"/) ||
		html.match(/"username"\s*:\s*"([^"]+)"\s*,\s*"full_name"\s*:/);
	return match?.[1] ?? null;
};

/**
 * @param {unknown} value
 * @returns {number}
 */
const parseInstagramCount = (value) => {
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	if (typeof value !== 'string') return 0;

	const trimmed = value.trim();
	if (!trimmed) return 0;

	const match = trimmed.match(/^([\d.,]+)\s*([kKmMbB])?$/);
	if (!match) {
		const digitsOnly = trimmed.replace(/[^\d]/g, '');
		const parsedDigits = parseInt(digitsOnly, 10);
		return Number.isFinite(parsedDigits) ? parsedDigits : 0;
	}

	const numberPart = match[1].replace(/,/g, '');
	const parsedNumber = parseFloat(numberPart);
	if (!Number.isFinite(parsedNumber)) return 0;

	const suffix = match[2]?.toLowerCase();
	const multiplier =
		suffix === 'k' ? 1000 : suffix === 'm' ? 1000000 : suffix === 'b' ? 1000000000 : 1;
	return Math.round(parsedNumber * multiplier);
};

/**
 * @param {string} url
 * @returns {Promise<any>}
 */
async function getInstagramInfo(url) {
	try {
		let username = extractInstagramUsernameFromUrl(url);
		let user = username ? await fetchInstagramWebProfileInfo(username) : null;

		let text = '';

		if (!user) {
			const response = await fetch(url, {
				headers: {
					'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
				}
			});

			text = await response.text();
			username = username ?? extractInstagramUsernameFromHtml(text);
			user = username ? await fetchInstagramWebProfileInfo(username) : null;
		}

		if (user) {
			const followersCount = user?.follower_count ?? user?.edge_followed_by?.count ?? 0;
			const followingCount = user?.following_count ?? user?.edge_follow?.count ?? 0;
			const postsCount = user?.media_count ?? user?.edge_owner_to_timeline_media?.count ?? 0;
			const fullName = user?.full_name || 'Instagram User';
			const userName = user?.username || username || 'instagram';
			const profilePic = user?.profile_pic_url_hd || user?.profile_pic_url || '';
			const profilePicBase64 = profilePic ? await imageToBase64(profilePic) : null;

			const handle = `@${userName}`;

			return json({
				thumbnailUrl: profilePic,
				thumbnail: profilePicBase64 || profilePic,
				channelLogoUrl: profilePic,
				channelLogo: profilePicBase64 || profilePic,
				title: fullName,
				channel: handle,
				subscribers: formatViews(followersCount),
				views: formatViews(followingCount),
				likes: formatViews(postsCount),
				time: '',
				duration: '',
				isInstagram: true
			});
		}

		if (!text) {
			const response = await fetch(url, {
				headers: {
					'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
				}
			});
			text = await response.text();
		}

		const descMatch = text.match(/<meta property="og:description" content="([^"]+)"/);
		const imageMatch = text.match(/<meta property="og:image" content="([^"]+)"/);
		const titleMatch = text.match(/<meta property="og:title" content="([^"]+)"/);

		let followersCount = 0;
		let followingCount = 0;
		let postsCount = 0;
		let name = 'Instagram User';
		let handle = '@instagram';
		let profilePic = '';

		const urlMatch = url.match(/instagram\.com\/([^/?#]+)/);
		if (urlMatch?.[1]) handle = `@${urlMatch[1]}`;

		if (descMatch?.[1]) {
			const content = descMatch[1];
			const parts = content.split(' - ')[0].split(', ');
			parts.forEach((part) => {
				if (part.includes('Follower'))
					followersCount = parseInstagramCount(part.replace(/Followers?|Follower/gi, '').trim());
				if (part.includes('Following'))
					followingCount = parseInstagramCount(part.replace(/Following/gi, '').trim());
				if (part.includes('Post'))
					postsCount = parseInstagramCount(part.replace(/Posts?|Post/gi, '').trim());
			});
		}

		if (imageMatch?.[1]) profilePic = imageMatch[1];
		const profilePicBase64 = profilePic ? await imageToBase64(profilePic) : null;

		if (titleMatch?.[1]) {
			const content = titleMatch[1];
			const nameParts = content.split(' (@');
			if (nameParts.length > 1) {
				name = nameParts[0];
				const handlePart = nameParts[1].split(')')[0];
				if (handlePart) handle = '@' + handlePart;
			} else {
				name = content.split(' • ')[0];
			}
		}

		return json({
			thumbnailUrl: profilePic,
			thumbnail: profilePicBase64 || profilePic,
			channelLogoUrl: profilePic,
			channelLogo: profilePicBase64 || profilePic,
			title: name,
			channel: handle,
			subscribers: formatViews(followersCount),
			views: formatViews(followingCount),
			likes: formatViews(postsCount),
			time: '',
			duration: '',
			isInstagram: true
		});
	} catch (e) {
		console.error('Instagram fetch error:', e);
		return error(500, 'Failed to fetch Instagram info');
	}
}

/**
 * @param {string} username
 * @returns {Promise<any|null>}
 */
const fetchInstagramWebProfileInfo = async (username) => {
	const endpoint = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;
	const response = await fetch(endpoint, {
		headers: {
			'User-Agent':
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
			Accept: 'application/json',
			'X-Requested-With': 'XMLHttpRequest',
			'X-IG-App-ID': '936619743392459',
			Referer: `https://www.instagram.com/${encodeURIComponent(username)}/`
		}
	});

	if (!response.ok) return null;
	const body = await response.json().catch(() => null);
	return body?.data?.user ?? null;
};

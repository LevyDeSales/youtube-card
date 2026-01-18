<script>
	import { onMount } from 'svelte';
	import Configuration from '$lib/components/Configuration.svelte';
	import Card from '$lib/components/Card.svelte';
	import { findVideoId } from '$lib/utils/helpers';
	import { Logger } from '$lib/utils/logger';

	/**
	 * @type {{ initial: boolean, thumbnailUrl: string, thumbnail: string, channelLogoUrl: string, channelLogo: string, title: string, channel: string, views: string, time: string, duration: string, isLive: boolean, isUpcoming: boolean, startDate: string, viewers: string, likes?: string, subscribers?: string }}
	 */
	let data = {
		initial: true,
		thumbnailUrl: '/thumbnail.webp',
		thumbnail: '/thumbnail.webp',
		channelLogoUrl: '/basti-logo.png',
		channelLogo: '/basti-logo.png',
		title: 'Je quitte mon CDI de Designer',
		channel: 'BastiUi',
		views: '31,2 k',
		time: 'il y a 2 ans',
		duration: '09:27',
		isLive: false,
		isUpcoming: false,
		startDate: '',
		viewers: ''
	};

	/**
	 * @type {{ style: string, initial: boolean, displayChannel: boolean, displayChannelName: boolean, duration: number, displayMeta: boolean, theme: string, size: number, displayDuration: boolean, url?: string, advanced: boolean, rounding: number, textSize: number, spacing: number, autoPaste: boolean, greenScreen: boolean, instagramLayout?: 'square' | 'rect' }}
	 */
	let config = {
		initial: true,
		displayChannel: false,
		displayChannelName: true,
		duration: 0,
		displayMeta: true,
		theme: 'white',
		size: 2,
		displayDuration: true,
		advanced: false,
		rounding: 1,
		textSize: 1,
		spacing: 1,
		autoPaste: false,
		style: 'computer',
		greenScreen: false,
		instagramLayout: 'square'
	};

	let loading = false;

	$: updateLocalStorage('config', config);
	$: updateLocalStorage('data', data);

	onMount(() => {
		const savedConfig = localStorage.getItem('config');
		const savedData = localStorage.getItem('data');

		if (savedConfig) {
			config = JSON.parse(savedConfig);
		}

		if (savedData) data = JSON.parse(savedData);

		const urlParams = new URLSearchParams(window.location.search);
		const sharedData = urlParams.get('config');

		if (sharedData) {
			/**
			 * @type {{ url: string }}
			 */
			const parsedData = JSON.parse(atob(sharedData));

			const difference = config.url != parsedData.url;

			config = {
				...config,
				...parsedData
			};

			if (difference) {
				getVideo();
			}
		}
	});

	const getVideo = async () => {
		if (!config.url) return;
		const videoId = findVideoId(config.url);

		try {
			loading = true;
			const response = await fetch(`/_api/info`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ videoId, language: navigator.language, url: config.url })
			});

			if (response.status !== 200) {
				Logger.warn(`Page: Fetch failed with status ${response.status}`);
				return;
			}

			data = await response.json();
			loading = false;
		} catch (error) {
			loading = false;
			Logger.error('Page: Error fetching data', error);
		}
	};

	/**
	 *
	 * @param type {string}
	 * @param value {any}
	 */
	const updateLocalStorage = (type, value) => {
		try {
			if (typeof localStorage !== 'undefined') {
				if (value.initial) {
					value.initial = false;
					return;
				}

				if (type === 'config') {
					localStorage.setItem('config', JSON.stringify(value));
				} else {
					localStorage.setItem('data', JSON.stringify(value));
				}

				updateQueryParams();
			}
		} catch (e) {
			Logger.warn('Page: Failed to update localStorage/query params', e);
		}
	};

	const updateQueryParams = () => {
		const params = new URLSearchParams();
		params.set('config', btoa(JSON.stringify(config)));

		history.pushState({}, '', `?${params.toString()}`);
	};
</script>

<section>
	<Card bind:data bind:config bind:loading />

	<Configuration bind:config bind:data bind:loading />
</section>

<style lang="scss">
	section {
		accent-color: red;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		grid-template-columns: 1fr 400px;
		gap: 1.5rem;
	}
</style>

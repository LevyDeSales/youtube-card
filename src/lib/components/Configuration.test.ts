import { fireEvent, render, waitFor } from '@testing-library/svelte';
import Configuration from './Configuration.svelte';
import '$lib/i18n';
import { locale, waitLocale } from 'svelte-i18n';

type DataType = {
	initial: boolean;
	thumbnailUrl: string;
	thumbnail: string;
	channelLogoUrl: string;
	channelLogo: string;
	title: string;
	channel: string;
	views: string;
	time: string;
	duration: string;
	isLive: boolean;
	isUpcoming: boolean;
	startDate: string;
	viewers: string;
};

type ConfigType = {
	style: string;
	initial: boolean;
	displayChannel: boolean;
	displayChannelName: boolean;
	duration: number;
	displayMeta: boolean;
	theme: string;
	size: number;
	displayDuration: boolean;
	url?: string;
	advanced: boolean;
	rounding: number;
	textSize: number;
	spacing: number;
	autoPaste: boolean;
	greenScreen: boolean;
	instagramLayout?: 'square' | 'rect';
};

const createBaseProps = () => {
	const data: DataType = {
		initial: true,
		thumbnailUrl: '',
		thumbnail: '',
		channelLogoUrl: '',
		channelLogo: '',
		title: '',
		channel: '',
		views: '',
		time: '',
		duration: '',
		isLive: false,
		isUpcoming: false,
		startDate: '',
		viewers: ''
	};

	const config: ConfigType = {
		style: 'computer',
		initial: true,
		displayChannel: false,
		displayChannelName: true,
		duration: 0,
		displayMeta: true,
		theme: 'white',
		size: 1,
		displayDuration: true,
		url: '',
		advanced: false,
		rounding: 1,
		textSize: 1,
		spacing: 1,
		autoPaste: false,
		greenScreen: false,
		instagramLayout: 'square'
	};

	const loading = false;

	return { data, config, loading };
};

describe('Configuration requests', () => {
	beforeEach(async () => {
		vi.useFakeTimers();

		(globalThis as any).fetch = vi.fn().mockResolvedValue({
			status: 200,
			json: async () => ({
				initial: false,
				thumbnailUrl: '/thumbnail.webp',
				thumbnail: '/thumbnail.webp',
				channelLogoUrl: '/basti-logo.png',
				channelLogo: '/basti-logo.png',
				title: 'Video title',
				channel: 'Channel name',
				views: '1,000',
				time: 'today',
				duration: '10:00',
				isLive: false,
				isUpcoming: false,
				startDate: '',
				viewers: ''
			})
		});

		Object.defineProperty(navigator, 'clipboard', {
			value: {
				readText: vi.fn().mockResolvedValue('')
			},
			configurable: true
		});

		locale.set('en');
		await waitLocale();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.resetAllMocks();
	});

	it('faz somente uma requisição ao submeter o mesmo link repetidamente', async () => {
		const props = createBaseProps();
		const { getByRole } = render(Configuration, props as any);
		const input = getByRole('textbox') as HTMLInputElement;

		const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

		await fireEvent.input(input, { target: { value: url } });
		await fireEvent.keyUp(input, { key: 'Enter' });

		await waitFor(() => {
			expect(fetch).toHaveBeenCalledTimes(1);
		});

		await fireEvent.keyUp(input, { key: 'Enter' });
		await Promise.resolve();

		expect(fetch).toHaveBeenCalledTimes(1);
	});

	it('autoPaste faz somente uma requisição para a mesma URL no clipboard', async () => {
		const props = createBaseProps();
		props.config.autoPaste = true;

		const clipboardUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
		(navigator.clipboard.readText as any).mockResolvedValue(clipboardUrl);

		render(Configuration, props as any);

		await vi.advanceTimersByTimeAsync(1000);

		await waitFor(() => {
			expect(fetch).toHaveBeenCalledTimes(1);
		});

		await vi.advanceTimersByTimeAsync(1000);

		expect(fetch).toHaveBeenCalledTimes(1);
	});
});

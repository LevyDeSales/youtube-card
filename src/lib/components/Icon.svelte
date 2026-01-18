<script>
	/**
	 * @type {keyof typeof icons}
	 */
	export let name;

	const icons = {
		ban: {
			viewBox: '0 0 24 24',
			fill: 'none',
			stroke: 'currentColor',
			pathD:
				'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
		}
	};

	$: icon = icons[name] || icons.ban;
</script>

<button class="icon-button" type="button" on:click>
	<svg viewBox={icon.viewBox} fill={icon.fill} stroke={icon.stroke} {...$$restProps}>
		<path d={icon.pathD} stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
	</svg>
</button>

<style>
	.icon-button {
		border: none;
		background: transparent;
		padding: 0;
		margin: 0;
		display: inline-flex;
		cursor: inherit;
		color: inherit;
	}
</style>

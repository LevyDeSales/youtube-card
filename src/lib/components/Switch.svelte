<script>
	export let fontSize = 16;
	export let value = true;

	const uniqueID = Math.floor(Math.random() * 100);

	function handleClick(event) {
		const target = event.currentTarget;
		const state = target.getAttribute('aria-checked');

		value = state === 'true' ? false : true;
	}
</script>

<div class="s s--slider" style="font-size:{fontSize}px">
	<button
		role="switch"
		aria-checked={value}
		aria-labelledby={`switch-${uniqueID}`}
		on:click={handleClick}
	>
	</button>
</div>

<style>
	button {
		cursor: pointer;
	}

	.s--slider {
		display: flex;
		align-items: center;
	}

	.s--slider button {
		width: 2.7em;
		height: 1.27em;
		position: relative;
		margin: 0 0 0 0.5em;
		background: #ccc;
		border: none;
		border-radius: 1.5em;
	}

	.s--slider button::before {
		content: '';
		position: absolute;
		width: 1em;
		height: 1em;
		background: #fff;
		top: 0.13em;
		right: 1.5em;
		transition: transform 0.3s;
		border-radius: 100%;
	}

	.s--slider button[aria-checked='true'] {
		background-color: #ff0000;
	}

	.s--slider button[aria-checked='true']::before {
		transform: translateX(1.3em);
		transition: transform 0.3s;
	}

	.s--slider button:focus {
		box-shadow: 0 0px 0px 1px #ff0000;
		border-radius: 1.5em;
	}
</style>

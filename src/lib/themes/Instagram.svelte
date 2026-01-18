<script>
	export let data;
	export let config;
	export let loading;

	let profileSrc = '';
	let layout = 'square';

	$: profileSrc = data?.thumbnail || data?.thumbnailUrl || '/basti-logo.png';
	$: layout = config?.instagramLayout === 'rect' ? 'rect' : 'square';

	const handleProfileError = () => {
		if (profileSrc !== data?.thumbnail && data?.thumbnail) {
			profileSrc = data.thumbnail;
			return;
		}

		profileSrc = '/basti-logo.png';
	};
</script>

<div
	class="instagram-card {config.theme} {layout} {loading ? 'loading' : ''}"
	style="--rounding: {config.advanced ? config.rounding : 1}; --text-size: {config.advanced
		? config.textSize
		: 1}; border-radius: calc(0.5rem * var(--rounding, 1));"
>
	{#if layout === 'rect'}
		<div class="rect-header">
			<div class="profile-pic-container">
				<div class="story-ring">
					<img src={profileSrc} alt="profile" class="profile-pic" on:error={handleProfileError} />
				</div>
			</div>

			<div class="rect-info">
				<div class="rect-names">
					<span class="full-name">{data?.title || 'Name'}</span>
					<span class="username">{data?.channel || '@username'}</span>
				</div>

				<div class="stats-container">
					<div class="stat-item">
						<span class="stat-value">{data?.likes || '0'}</span>
						<span class="stat-label">Posts</span>
					</div>
					<div class="stat-item">
						<span class="stat-value">{data?.subscribers || '0'}</span>
						<span class="stat-label">Followers</span>
					</div>
					<div class="stat-item">
						<span class="stat-value">{data?.views || '0'}</span>
						<span class="stat-label">Following</span>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="header">
			<span class="username">{data?.channel || '@username'}</span>
			<div class="dots">•••</div>
		</div>

		<div class="profile-section">
			<div class="profile-pic-container">
				<div class="story-ring">
					<img src={profileSrc} alt="profile" class="profile-pic" on:error={handleProfileError} />
				</div>
			</div>

			<div class="stats-container">
				<div class="stat-item">
					<span class="stat-value">{data?.likes || '0'}</span>
					<span class="stat-label">Posts</span>
				</div>
				<div class="stat-item">
					<span class="stat-value">{data?.subscribers || '0'}</span>
					<span class="stat-label">Followers</span>
				</div>
				<div class="stat-item">
					<span class="stat-value">{data?.views || '0'}</span>
					<span class="stat-label">Following</span>
				</div>
			</div>
		</div>

		<div class="bio-section">
			<span class="full-name">{data?.title || 'Name'}</span>
			{#if data?.time}
				<p class="bio-text">{data?.time}</p>
			{/if}
		</div>

		<div class="actions">
			<button class="action-btn primary">Follow</button>
			<button class="action-btn">Message</button>
		</div>
	{/if}
</div>

<style lang="scss">
	.instagram-card {
		width: 100%;
		max-width: 375px;
		padding: 1rem;
		background-color: white;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		transition: all 0.3s;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
		font-size: calc(1rem * var(--text-size, 1));

		&.loading {
			opacity: 0.7;
			pointer-events: none;
			animation: loadingEffectOpacity 1.5s ease-in-out infinite;
		}

		@keyframes loadingEffectOpacity {
			0% {
				opacity: 0.3;
			}
			50% {
				opacity: 0.6;
			}
			100% {
				opacity: 0.3;
			}
		}

		/* Dark Mode */
		&.dark {
			background-color: #000;
			color: #fff;

			.header,
			.stats-container,
			.bio-section {
				color: #fff;
			}

			.action-btn {
				background-color: #363636;
				color: #fff;
				&.primary {
					background-color: #0095f6;
				}
			}
		}

		/* Light Mode */
		&.light,
		&.white {
			background-color: #fff;
			color: #000;

			.action-btn {
				background-color: #efefef;
				color: #000;
				&.primary {
					background-color: #0095f6;
					color: #fff;
				}
			}
		}
	}

	.instagram-card.rect {
		width: auto;
		max-width: 100%;
		min-width: 20rem;
		padding: 0.875rem;
		gap: 0.75rem;
	}

	.rect-header {
		display: flex;
		align-items: center;
		gap: 0.875rem;
	}

	.rect-info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-width: 0;
		flex: 1;
	}

	.rect-names {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
	}

	.instagram-card.rect .full-name,
	.instagram-card.rect .username {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.instagram-card.rect .full-name {
		line-height: 1.2;
	}

	.instagram-card.rect .username {
		font-weight: 600;
		opacity: 0.85;
		font-size: 0.95em;
		line-height: 1.15;
	}

	.instagram-card.rect .stats-container {
		justify-content: space-between;
		width: 100%;
		gap: 0.9rem;
		flex-wrap: wrap;
	}

	.instagram-card.rect .stat-item {
		text-align: left;
		min-width: max-content;
	}

	.instagram-card.rect .story-ring {
		width: 4.5rem;
		height: 4.5rem;
		flex-shrink: 0;
	}

	.instagram-card.rect .stat-value {
		line-height: 1.2;
	}

	.instagram-card.rect .stat-label {
		line-height: 1.1;
	}

	@media screen and (max-width: 480px) {
		.instagram-card.rect {
			width: 100%;
			min-width: 0;
		}

		.rect-header {
			align-items: flex-start;
		}

		.instagram-card.rect .stats-container {
			gap: 0.75rem 1rem;
		}
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-weight: 700;
		font-size: 1.1em;
	}

	.profile-section {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.profile-pic-container {
		flex-shrink: 0;
	}

	.story-ring {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		padding: 2px;
		background: linear-gradient(
			45deg,
			#f09433 0%,
			#e6683c 25%,
			#dc2743 50%,
			#cc2366 75%,
			#bc1888 100%
		);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.profile-pic {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		border: 2px solid white; /* Default to white border */
		object-fit: cover;
	}

	.instagram-card.dark .profile-pic {
		border-color: #000;
	}
	.instagram-card.light .profile-pic {
		border-color: #fff;
	}

	.stats-container {
		display: flex;
		justify-content: space-around;
		flex-grow: 1;
		text-align: center;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
	}

	.stat-value {
		font-weight: 700;
		font-size: 1.1em;
	}

	.stat-label {
		font-size: 0.8em;
	}

	.bio-section {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;

		.full-name {
			font-weight: 700;
		}

		.bio-text {
			font-size: 0.9em;
			margin: 0;
			white-space: pre-wrap;
		}
	}

	.actions {
		display: flex;
		gap: 0.5rem;

		.action-btn {
			flex: 1;
			border: none;
			padding: 0.5rem;
			border-radius: 6px;
			font-weight: 600;
			font-size: 0.9em;
			cursor: pointer;
		}
	}
</style>

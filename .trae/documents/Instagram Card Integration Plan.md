I will develop the Instagram Profile Card adaptation by extending the current SvelteKit project. The solution involves creating a new "Instagram" theme component, updating the configuration UI to support it, and implementing a server-side scraper to fetch public Instagram profile data without requiring an API key (using Open Graph meta tags).

### 1. Backend & Data Fetching

**File:** `src/routes/_api/info/+server.js`

- **Update Logic**: Modify the `POST` handler to detect Instagram URLs.
- **Scraper Implementation**: Implement a `getInstagramInfo` function that:
  - Fetches the public profile page HTML.
  - Parses `og:description` to extract **Followers**, **Following**, and **Posts** counts.
  - Parses `og:image` for the profile picture.
  - Parses `og:title` for the Name/Handle.
- **Data Mapping**: Map Instagram data to the existing JSON response structure (e.g., `subscribers` → Followers, `views` → Following) to maintain compatibility with the frontend.

### 2. Frontend Components

**New File:** `src/lib/themes/Instagram.svelte`

- **UI Implementation**: Create a responsive card mimicking the Instagram mobile profile look.
- **Features**:
  - Circular profile picture with optional "Story" ring gradient.
  - Stats row (Posts, Followers, Following).
  - Action button ("Follow" / "Message").
  - Bio section.
- **Styling**: Use Instagram's color palette (white/dark mode support) and fonts.

**File:** `src/lib/components/Card.svelte`

- **Integration**: Import `Instagram.svelte` and add a conditional block to render it when `config.style === 'instagram'`.

**File:** `src/lib/components/Configuration.svelte`

- **UI Update**: Add an "Instagram" style button to the theme selector.
- **Regex Update**: Update the URL validation regex to accept `instagram.com` URLs (profiles and posts).
- **Icon**: Add an SVG icon for the Instagram style selection.

### 3. Application Logic

**File:** `src/routes/+page.svelte`

- **Regex Update**: Ensure the main page input accepts Instagram URLs.
- **Default Data**: Update the default/placeholder data to be neutral or support an Instagram example if the style is switched.

### 4. Verification & Testing

- **Manual Verification**: Verify that pasting an Instagram link (e.g., `https://instagram.com/instagram`) correctly loads the profile picture and stats.
- **Responsiveness**: Check the card layout on mobile and desktop viewports.
- **Theme Support**: Ensure the card looks good in both Light and Dark modes (supported by the project's existing theming).

# Instagram Card Integration

This project now supports generating profile cards for Instagram users.

## Features

- **Profile Card**: Displays profile picture, username, name, bio, and stats (Posts, Followers, Following).
- **Auto-Detection**: Pasting an Instagram URL (e.g., `https://instagram.com/username`) automatically switches the theme to "Instagram".
- **Visuals**: Clean, white-theme (and dark mode support) inspired by the Instagram mobile app.

## Usage

1. Open the application.
2. Paste an Instagram profile URL (e.g., `https://instagram.com/instagram`).
3. The card will update with the user's public information.
   - _Note_: Data is fetched from public Open Graph tags. If the profile is private or Instagram blocks the request, default/mock data will be shown, which you can edit manually (if editing features are enabled).
4. Select "Instagram" style manually from the configuration panel if needed.

## Technical Details

- **Theme**: `src/lib/themes/Instagram.svelte`
- **Backend**: `src/routes/_api/info/+server.js` handles Instagram scraping via `fetch` and Regex.
- **Data Mapping**:
  - `subscribers` -> Followers
  - `views` -> Following
  - `likes` -> Posts
  - `channel` -> Username (@handle)
  - `title` -> Full Name

## Testing

To verify the implementation:

1. **Load Data**: Paste `https://instagram.com/cristiano` (or any public profile).
2. **Check Fields**: Verify the Follower count matches (approximate) the real profile.
3. **Responsiveness**: Resize the window to mobile size (< 700px) and check if the card scales correctly.
4. **Dark Mode**: Switch the global theme to "Dark" in the config panel and ensure the Instagram card adapts (black background, white text).

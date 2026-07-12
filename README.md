# NeetcodeSRS

NeetcodeSRS is a Chrome extension that adds spaced repetition to [NeetCode](https://neetcode.io) problem practice. It also works on LeetCode.

**Author:** [Rajeev Shrestha](https://shrestharajeev.com.np/) · [GitHub](https://github.com/eclipsu/NeetcodeSRS)

## Features

### Spaced Repetition

- Uses **[TS-FSRS](https://github.com/open-spaced-repetition/ts-fsrs)** for the spaced repetition algorithm

### Review System

- Daily review queue with optimized problem ordering
- View statistics and streaks
- Works directly on **neetcode.io** problem pages
- Also works on leetcode.com
- Easily rate after solving problems, or add to review later
- Customizable daily new card limits
- Configure a day start offset (0-23 hours past midnight) for when a new review day begins

### Cross-Browser Sync

- Optional sync via GitHub Gists
- Requires a GitHub token with `gist` scope—configure in Settings
- Your data stays private in your own GitHub account

### Interface

- Dark/light theme support

## Installation

1. Build from source and load as an unpacked extension:

```bash
npm install
npm run build
```

Then open `chrome://extensions`, enable Developer mode, and load the `.output/chrome-mv3` folder.

### Setting Up GitHub Gist Sync (Optional)

1. **Create a GitHub Personal Access Token** with the `gist` scope
2. **Create a Gist** using the "Create New Gist" button in Settings, or manually on GitHub
3. Settings sync automatically via Chrome if signed in, otherwise enter the token and Gist ID on each device

## License

MIT

Forked from [LeetSRS](https://github.com/mattcdrake/LeetSRS) by Matt Drake.

# Tests Fail Sound

A VS Code extension that plays a sound effect whenever a test task exits with a non-zero exit code (i.e. your tests fail).

## Features

- Automatically listens for any VS Code task whose name contains the word **"test"** (case-insensitive).
- Plays a custom `.mp3` sound when that task fails (exit code ≠ 0).
- Works cross-platform (macOS, Windows, Linux) with no extra system dependencies required.

## Setup

1. Place your `.mp3` file in the `sounds/` directory inside the extension folder and name it `faaah.mp3`.
2. The extension activates automatically on workspace startup — no manual command needed.

## Requirements

No additional system-level dependencies are required. The extension uses [`sound-play`](https://www.npmjs.com/package/sound-play), which leverages native OS audio players.

## Release Notes

### 1.0.0

Initial release.

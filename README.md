# You Broke It! — VS Code Extension

[![Version](https://img.shields.io/visual-studio-marketplace/v/a7med404.you-broke-it)](https://marketplace.visualstudio.com/items?itemName=a7med404.you-broke-it)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/a7med404.you-broke-it)](https://marketplace.visualstudio.com/items?itemName=a7med404.you-broke-it)

A lightweight VS Code extension that plays a sound effect whenever a task (like your test runner) fails. Keep your focus on the code and get immediate audio feedback when things go south!

![Icon](images/icon.jpg)

## Features

- **Automatic Task Monitoring**: Listens for any VS Code task whose name contains "test" (case-insensitive).
- **Audio Feedback**: Plays a sound when a task exits with a non-zero exit code.
- **Built-in Meme Sounds**: Choose from several fun sounds like "Vine Boom", "Emotional Damage", and "Brother Ewwww".
- **Custom Sound Support**: Use your own `.wav` or `.mp3` files.
- **Cross-Platform**: Works on macOS, Windows, and Linux.

## How It Works

The extension automatically activates when you open a workspace. It monitors all running tasks. If a task fails (returns a non-zero exit code) and its name includes "test", the selected sound will play at the configured volume.

## Configuration

You can customize the extension behavior in your VS Code settings under `You Broke It`:

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `youBrokeIt.enabled` | `boolean` | `true` | Toggle the sound effect on/off. |
| `youBrokeIt.sound` | `string` | `faaah` | Select one of the built-in sounds. |
| `youBrokeIt.customSoundPath` | `string` | `""` | Provide an absolute path to a custom audio file. |
| `youBrokeIt.volume` | `integer` | `50` | Volume level (0 to 100). |

## Available Sounds

- **faaah**: The classic scream.
- **brother-ewwwwwww**: The "Brother Ewww" meme.
- **chicken-on-tree-screaming**: A chaotic chicken.
- **emotional-damage-meme**: "Emotional Damage!"
- **vine-boom**: The dramatic bass boom.
- ...and more!

## Commands

- `You Broke It: Configure...`: Opens the extension settings.
- `You Broke It: Select Custom Sound...`: Quickly pick a custom sound file.
- `You Broke It: Test Current Sound`: plays the current sound for testing.

## License

MIT

import * as vscode from 'vscode';
import * as path from 'path';
import * as soundPlay from 'sound-play';

export function activate(context: vscode.ExtensionContext) {
	// Approach 1: VS Code Tasks API — catches tasks run via "Tasks: Run Task"
	const taskEndDisposable = vscode.tasks.onDidEndTaskProcess((e) => {
		const taskName = e.execution.task.name.toLowerCase();
		if (taskName.includes('test') && e.exitCode !== 0) {
			playFailSound(context);
		}
	});

	// Approach 2: Terminal Shell Integration — catches commands typed directly
	// in any integrated terminal (e.g. `pnpm run test`). Requires shell integration
	// to be enabled (auto-enabled for bash/zsh/fish in VS Code 1.93+).
	const shellEndDisposable = vscode.window.onDidEndTerminalShellExecution((e) => {
		// e.exitCode is undefined when the shell doesn't report exit codes
		if (e.exitCode === undefined || e.exitCode === 0) {
			return;
		}

		// Check the command that was run contains "test"
		const command = e.execution.commandLine.value.toLowerCase();
		if (command.includes('test')) {
			playFailSound(context);
		}
	});

	context.subscriptions.push(taskEndDisposable, shellEndDisposable);
}

export function deactivate() {}

/**
 * Plays the failure sound located in the `sounds/` directory of the extension.
 */
export function playFailSound(context: vscode.ExtensionContext): void {
	const soundPath = path.join(context.extensionPath, 'sounds', 'faaah.mp3');
	soundPlay.play(soundPath).catch((error: any) => {
		vscode.window.showErrorMessage(`Tests Fail Sound: Unable to play audio. ${error.message}`);
	});
}

import * as vscode from 'vscode';
import * as path from 'path';
import * as soundPlay from 'sound-play';

export function activate(context: vscode.ExtensionContext) {
	// Use the official Testing API to detect test results changes.
	const testResultsDisposable = vscode.tests.onDidChangeTestResults(() => {
		// Newest results are at index 0.
		const latestResults = vscode.tests.testResults[0];
		if (latestResults && hasFailedTests(latestResults.results)) {
			playFailSound(context);
		}
	});

	context.subscriptions.push(testResultsDisposable);
}

export function deactivate() {}

/**
 * Checks if there are any failed tests in the given set of TestResultSnapshots.
 */
function hasFailedTests(results: readonly vscode.TestResultSnapshot[]): boolean {
	for (const result of results) {
		// A test item can have multiple states across different tasks in the same run.
		for (const taskState of result.taskStates) {
			if (taskState.state === vscode.TestResultState.Failed || 
				taskState.state === vscode.TestResultState.Errored) {
				return true;
			}
		}
		// Recursively check children.
		if (hasFailedTests(result.children)) {
			return true;
		}
	}
	return false;
}

/**
 * Plays the failure sound located in the `sounds/` directory of the extension.
 */
export function playFailSound(context: vscode.ExtensionContext): void {
	const soundPath = path.join(context.extensionPath, 'sounds', 'faaah.mp3');
	soundPlay.play(soundPath).catch((error: any) => {
		vscode.window.showErrorMessage(`Tests Fail Sound: Unable to play audio. ${error.message}`);
	});
}

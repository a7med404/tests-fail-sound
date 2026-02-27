import * as vscode from 'vscode';

declare module 'vscode' {
	export namespace tests {
		/**
		 * The list of test results currently available in the editor.
		 */
		export const testResults: readonly TestRunResult[];

		/**
		 * An event that fires when the test results have changed.
		 */
		export const onDidChangeTestResults: vscode.Event<void>;
	}

	/**
	 * Represents the results of a test run.
	 */
	export interface TestRunResult {
		/**
		 * The list of test results that were generated during the run.
		 */
		readonly results: readonly TestResultSnapshot[];
	}

	/**
	 * Represents a snapshot of a test result.
	 */
	export interface TestResultSnapshot {
		/**
		 * The children of this snapshot.
		 */
		readonly children: readonly TestResultSnapshot[];

		/**
		 * The states of the test item across different tasks.
		 */
		readonly taskStates: readonly TestRunTaskState[];
	}

	/**
	 * Represents the state of a test item in a task.
	 */
	export interface TestRunTaskState {
		/**
		 * The state of the test item.
		 */
		readonly state: TestResultState;
	}

	/**
	 * Possible states of a test item.
	 */
	export enum TestResultState {
		Queued = 1,
		Running = 2,
		Passed = 3,
		Failed = 4,
		Skipped = 5,
		Errored = 6
	}
}

import * as vscode from 'vscode';
import * as path from 'path';
import { AudioPlayer } from './audio-player';
import { SettingsPanel } from './settings-panel';
import { SoundGenerator } from './sound-generator';
import { Logger } from './logger';

export function activate(context: vscode.ExtensionContext) {
    Logger.info('You Broke It: Extension activated.');

    // Approach 1: VS Code Tasks API — catches tasks run via "Tasks: Run Task"
    const taskEndDisposable = vscode.tasks.onDidEndTaskProcess((e) => {
        const taskName = e.execution.task.name.toLowerCase();
        if (taskName.includes('test') && e.exitCode !== 0) {
            Logger.info(`Test task failed: ${taskName}. Triggering audio.`);
            AudioPlayer.playFailSound(context);
        }
    });

    // Approach 2: Terminal Shell Integration — catches commands typed directly
    const shellEndDisposable = vscode.window.onDidEndTerminalShellExecution((e) => {
        if (e.exitCode === undefined || e.exitCode === 0) {
            return;
        }

        const command = e.execution.commandLine.value.toLowerCase();
        if (command.includes('test')) {
            Logger.info(`Terminal test command failed: ${command}. Triggering audio.`);
            AudioPlayer.playFailSound(context);
        }
    });

    // Register Command: Select Custom Sound
    const selectCustomSoundDisposable = vscode.commands.registerCommand('you-broke-it.selectCustomSound', async () => {
        const uri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            openLabel: 'Select Sound',
            filters: {
                'Audio Files': ['mp3', 'wav']
            }
        });

        if (uri && uri[0]) {
            const config = vscode.workspace.getConfiguration('youBrokeIt');
            await config.update('customSoundPath', uri[0].fsPath, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`You Broke It: Custom sound set to ${path.basename(uri[0].fsPath)}`);
            Logger.info(`Custom sound path updated to: ${uri[0].fsPath}`);
        }
    });

    // Register Command: Open Configuration WebView
    const openConfigDisposable = vscode.commands.registerCommand('you-broke-it.openConfig', () => {
        Logger.info('Opening configuration panel.');
        SettingsPanel.createOrShow(context);
    });

    // Register Command: Test Sound
    const testSoundDisposable = vscode.commands.registerCommand('you-broke-it.testSound', async () => {
        Logger.info('Triggering manual sound test.');
        await AudioPlayer.playFailSound(context);
    });

    // Register Command: Generate Trombone Sound
    const generateTromboneDisposable = vscode.commands.registerCommand('you-broke-it.generateTrombone', async () => {
        const soundsDir = path.join(context.extensionPath, 'sounds');
        const outputPath = path.join(soundsDir, 'trombone-generated.wav');
        
        Logger.info(`Generating trombone sound at: ${outputPath}`);
        try {
            await SoundGenerator.generateTromboneWav(outputPath);
            vscode.window.showInformationMessage('You Broke It: Trombone sound generated!');
            
            const config = vscode.workspace.getConfiguration('youBrokeIt');
            await config.update('customSoundPath', outputPath, vscode.ConfigurationTarget.Global);
            Logger.info('Trombone generated and set as custom sound.');
        } catch (error: any) {
            Logger.error('Failed to generate trombone sound.', error);
            vscode.window.showErrorMessage(`Failed to generate trombone: ${error.message}`);
        }
    });

    context.subscriptions.push(
        taskEndDisposable, 
        shellEndDisposable, 
        selectCustomSoundDisposable, 
        openConfigDisposable,
        testSoundDisposable,
        generateTromboneDisposable
    );
}

export function deactivate() {
    Logger.info('You Broke It: Extension deactivated.');
}

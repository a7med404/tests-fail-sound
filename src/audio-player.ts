import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as soundPlay from 'sound-play';
import { Logger } from './logger';

export class AudioPlayer {
    /**
     * Plays the failure sound based on the extension configuration.
     * @param context The extension context to locate internal assets.
     */
    public static async playFailSound(context: vscode.ExtensionContext): Promise<void> {
        const config = vscode.workspace.getConfiguration('youBrokeIt');
        const enabled = config.get<boolean>('enabled', true);

        if (!enabled) {
            Logger.info('Audio playback skipped: extension is disabled in settings.');
            return;
        }

        let soundPath: string;
        const customSoundPath = config.get<string>('customSoundPath', '');
        const volumeSetting = config.get<number>('volume', 50);
        const volume = volumeSetting / 100; // Convert 0-100 to 0-1

        if (customSoundPath) {
            soundPath = customSoundPath;
            Logger.info(`Using custom sound path: ${soundPath} (Volume: ${volumeSetting}%)`);
        } else {
            const soundName = config.get<string>('sound', 'faaah');
            soundPath = path.join(context.extensionPath, 'sounds', `${soundName}.mp3`);
            Logger.info(`Using built-in sound: ${soundName} (Volume: ${volumeSetting}%)`);
        }

        if (!fs.existsSync(soundPath)) {
            const errorMsg = `Sound file not found: ${soundPath}`;
            Logger.error(errorMsg);
            vscode.window.showErrorMessage(`You Broke It: ${errorMsg}`);
            return;
        }

        try {
            Logger.info(`Starting playback: ${soundPath}`);
            await soundPlay.play(soundPath, volume);
            Logger.info('Playback completed successfully.');
        } catch (error: any) {
            const msg = `Unable to play audio. ${error.message}`;
            Logger.error(msg, error);
            vscode.window.showErrorMessage(`You Broke It: ${msg}`);
        }
    }
}

import * as vscode from 'vscode';
import { AudioPlayer } from './audio-player';
import { Logger } from './logger';

export class SettingsPanel {
    public static currentPanel: SettingsPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
        this._panel = panel;
        this._extensionUri = context.extensionUri;

        // Set the webview's initial html content
        this._update(context);

        // Listen for when the panel is disposed
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'updateConfigs':
                        const mConfig = vscode.workspace.getConfiguration('youBrokeIt');
                        for (const update of message.updates) {
                            Logger.info(`SettingsPanel: Updating config ${update.key} to ${update.value}`);
                            await mConfig.update(update.key, update.value, vscode.ConfigurationTarget.Global);
                        }
                        await new Promise(resolve => setTimeout(resolve, 200)); // Small delay for storage propagation
                        this._update(context);
                        return;
                    case 'clearCustomSound':
                        const cConfig = vscode.workspace.getConfiguration('youBrokeIt');
                        Logger.info('SettingsPanel: Clearing custom sound path');
                        await cConfig.update('customSoundPath', '', vscode.ConfigurationTarget.Global);
                        await new Promise(resolve => setTimeout(resolve, 200));
                        this._update(context);
                        return;
                    case 'selectCustomSound':
                        await vscode.commands.executeCommand('you-broke-it.selectCustomSound');
                        this._update(context);
                        return;
                    case 'testSound':
                        await AudioPlayer.playFailSound(context);
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public static createOrShow(context: vscode.ExtensionContext) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (SettingsPanel.currentPanel) {
            SettingsPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'youBrokeItConfig',
            'You Broke It: Configuration',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [context.extensionUri]
            }
        );

        SettingsPanel.currentPanel = new SettingsPanel(panel, context);
    }

    public dispose() {
        SettingsPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update(context: vscode.ExtensionContext) {
        const config = vscode.workspace.getConfiguration('youBrokeIt');
        const settings = {
            enabled: config.get<boolean>('enabled', true),
            sound: config.get<string>('sound', 'faaah'),
            customSoundPath: config.get<string>('customSoundPath', ''),
            volume: config.get<number>('volume', 50)
        };

        this._panel.webview.html = this._getHtmlForWebview(this._panel.webview, settings);
        
        this._panel.webview.postMessage({
            command: 'updateSettings',
            settings: settings
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview, settings: any) {
        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You Broke It: Configuration</title>
    <style>
        :root {
            --bg-color: #0d1117;
            --container-bg: rgba(30, 35, 45, 0.7);
            --text-color: #c9d1d9;
            --accent-color: #58a6ff;
            --danger-color: #ff7b72;
            --success-color: #238636;
            --border-radius: 12px;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
            color: var(--text-color);
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 100vh;
            margin: 0;
        }

        .container {
            background: var(--container-bg);
            backdrop-filter: blur(10px);
            padding: 30px;
            border-radius: var(--border-radius);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            width: 100%;
            max-width: 480px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            margin-top: 20px;
        }

        h1 {
            color: var(--danger-color);
            font-size: 2rem;
            margin-bottom: 25px;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 2px;
            text-shadow: 0 0 15px rgba(255, 123, 114, 0.3);
        }

        .setting-group {
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .setting-group:last-child {
            border-bottom: none;
        }

        .setting-label {
            display: block;
            margin-bottom: 12px;
            font-weight: 600;
            font-size: 0.95rem;
            color: #8b949e;
        }

        .switch-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 26px;
        }

        .switch input { 
            opacity: 0;
            width: 0;
            height: 0;
        }

        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #30363d;
            transition: .3s;
            border-radius: 34px;
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .3s;
            border-radius: 50%;
        }

        input:checked + .slider {
            background-color: var(--accent-color);
        }

        input:checked + .slider:before {
            transform: translateX(24px);
        }

        select {
            width: 100%;
            padding: 10px;
            background-color: #21262d;
            border: 1px solid #30363d;
            color: var(--text-color);
            border-radius: 6px;
            font-size: 0.9rem;
            outline: none;
        }

        .custom-path-container {
            display: flex;
            gap: 8px;
            margin-bottom: 10px;
        }

        input[type="text"] {
            flex-grow: 1;
            padding: 10px;
            background-color: #21262d;
            border: 1px solid #30363d;
            color: var(--text-color);
            border-radius: 6px;
            font-size: 0.85rem;
            outline: none;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* Volume Slider Styles */
        .volume-container {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        input[type="range"] {
            flex-grow: 1;
            -webkit-appearance: none;
            background: #30363d;
            height: 6px;
            border-radius: 3px;
            outline: none;
        }

        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            background: var(--accent-color);
            border-radius: 50%;
            cursor: pointer;
            transition: transform 0.1s;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.1);
        }

        .volume-value {
            min-width: 40px;
            text-align: right;
            font-family: monospace;
            color: var(--accent-color);
            font-weight: bold;
        }

        button {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.9rem;
            transition: opacity 0.2s, transform 0.1s;
        }

        button:active {
            transform: scale(0.98);
        }

        .btn-primary {
            background-color: var(--success-color);
            color: white;
        }

        .btn-secondary {
            background-color: #30363d;
            color: var(--text-color);
        }

        .btn-test {
            background-color: var(--accent-color);
            color: white;
            width: 100%;
            margin-top: 10px;
            padding: 12px;
        }

        button:hover {
            opacity: 0.9;
        }

        .hint {
            font-size: 0.8rem;
            color: #8b949e;
            margin-top: 6px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>YOU BROKE IT</h1>
        
        <div class="setting-group">
            <div class="switch-container">
                <span class="setting-label">Enable Failure Sound</span>
                <label class="switch">
                    <input type="checkbox" id="enabledSwitch" ${settings.enabled ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>
        </div>

        <div class="setting-group">
            <label class="setting-label">Built-in Sound</label>
            <select id="soundList">
                <option value="faaah" ${settings.sound === 'faaah' ? 'selected' : ''}>The Classic Faaah</option>
                <option value="brother-ewwwwwww" ${settings.sound === 'brother-ewwwwwww' ? 'selected' : ''}>Brother Ewwwwwww!</option>
                <option value="chicken-on-tree-screaming" ${settings.sound === 'chicken-on-tree-screaming' ? 'selected' : ''}>Chicken Screaming</option>
                <option value="emotional-damage-meme" ${settings.sound === 'emotional-damage-meme' ? 'selected' : ''}>Emotional Damage!</option>
                <option value="error" ${settings.sound === 'error' ? 'selected' : ''}>System Error</option>
                <option value="heknew" ${settings.sound === 'heknew' ? 'selected' : ''}>He Knew</option>
                <option value="oh-shit-not-good" ${settings.sound === 'oh-shit-not-good' ? 'selected' : ''}>Oh Shit, Not Good!</option>
                <option value="vine-boom" ${settings.sound === 'vine-boom' ? 'selected' : ''}>Vine Boom</option>
            </select>
            <div class="hint">Will play if no custom path is set.</div>
        </div>

        <div class="setting-group">
            <label class="setting-label">Playback Volume</label>
            <div class="volume-container">
                <input type="range" id="volumeSlider" min="0" max="100" value="${settings.volume}">
                <span id="volumeValue" class="volume-value">${settings.volume}%</span>
            </div>
        </div>

        <div class="setting-group">
            <label class="setting-label">Custom Sound Path Override</label>
            <div class="custom-path-container">
                <input type="text" id="customPath" value="${settings.customSoundPath}" readonly placeholder="None selected">
                <button id="clearBtn" class="btn-secondary" style="background-color: var(--danger-color); color: white;">✕</button>
                <button id="browseBtn" class="btn-secondary">Browse</button>
            </div>
            <div class="hint">Overrides the built-in sound selection.</div>
        </div>

        <button id="testBtn" class="btn-test">🔊 Test Current Sound</button>
    </div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();

        const enabledSwitch = document.getElementById('enabledSwitch');
        const soundList = document.getElementById('soundList');
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeValue = document.getElementById('volumeValue');
        const customPath = document.getElementById('customPath');
        const browseBtn = document.getElementById('browseBtn');
        const clearBtn = document.getElementById('clearBtn');
        const testBtn = document.getElementById('testBtn');

        enabledSwitch.addEventListener('change', () => {
            vscode.postMessage({
                command: 'updateConfigs',
                updates: [{ key: 'enabled', value: enabledSwitch.checked }]
            });
        });

        soundList.addEventListener('change', () => {
            // Instant local feedback to show built-in is prioritized
            customPath.value = '';
            vscode.postMessage({
                command: 'updateConfigs',
                updates: [
                    { key: 'sound', value: soundList.value },
                    { key: 'customSoundPath', value: '' }
                ]
            });
        });

        volumeSlider.addEventListener('input', () => {
            const value = volumeSlider.value;
            volumeValue.textContent = value + '%';
            vscode.postMessage({
                command: 'updateConfigs',
                updates: [{ key: 'volume', value: parseInt(value, 10) }]
            });
        });

        browseBtn.addEventListener('click', () => {
            vscode.postMessage({
                command: 'selectCustomSound'
            });
        });

        clearBtn.addEventListener('click', () => {
            customPath.value = '';
            vscode.postMessage({
                command: 'clearCustomSound'
            });
        });

        testBtn.addEventListener('click', () => {
            vscode.postMessage({
                command: 'testSound'
            });
        });

        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'updateSettings') {
                enabledSwitch.checked = message.settings.enabled;
                soundList.value = message.settings.sound;
                volumeSlider.value = message.settings.volume;
                volumeValue.textContent = message.settings.volume + '%';
                customPath.value = message.settings.customSoundPath;
            }
        });
    </script>
</body>
</html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

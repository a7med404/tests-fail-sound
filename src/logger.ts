import * as vscode from 'vscode';

export class Logger {
    private static _outputChannel: vscode.OutputChannel | undefined;

    public static get channel(): vscode.OutputChannel {
        if (!this._outputChannel) {
            this._outputChannel = vscode.window.createOutputChannel('You Broke It');
        }
        return this._outputChannel;
    }

    public static info(message: string): void {
        const timestamp = new Date().toLocaleTimeString();
        this.channel.appendLine(`[INFO  ${timestamp}] ${message}`);
    }

    public static warn(message: string): void {
        const timestamp = new Date().toLocaleTimeString();
        this.channel.appendLine(`[WARN  ${timestamp}] ${message}`);
    }

    public static error(message: string, error?: any): void {
        const timestamp = new Date().toLocaleTimeString();
        let fullMessage = `[ERROR ${timestamp}] ${message}`;
        
        if (error) {
            if (error instanceof Error) {
                fullMessage += `\n    Message: ${error.message}\n    Stack: ${error.stack}`;
            } else {
                fullMessage += `\n    Details: ${JSON.stringify(error)}`;
            }
        }
        
        this.channel.appendLine(fullMessage);
        this.channel.show(true); // Show channel on error, but don't steal focus
    }
}

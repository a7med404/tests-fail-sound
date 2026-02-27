import * as fs from 'fs';
import * as path from 'path';

export class SoundGenerator {
    /**
     * Generates a "trombone-like" (descending slide) WAV file.
     * @param outputPath The path where the .wav file will be saved.
     */
    public static async generateTromboneWav(outputPath: string): Promise<string> {
        const sampleRate = 44100;
        const durationSeconds = 1.5;
        const numSamples = Math.floor(sampleRate * durationSeconds);
        const buffer = Buffer.alloc(44 + numSamples * 2); // 44 bytes header + 16-bit PCM

        // Start frequency and end frequency for the slide
        const startFreq = 220; // A3
        const endFreq = 110;   // A2

        // Write WAV Header
        buffer.write('RIFF', 0);
        buffer.writeUInt32LE(36 + numSamples * 2, 4);
        buffer.write('WAVE', 8);
        buffer.write('fmt ', 12);
        buffer.writeUInt32LE(16, 16);
        buffer.writeUInt16LE(1, 20); // PCM
        buffer.writeUInt16LE(1, 22); // Mono
        buffer.writeUInt32LE(sampleRate, 24);
        buffer.writeUInt32LE(sampleRate * 2, 28);
        buffer.writeUInt16LE(2, 32); // Block align
        buffer.writeUInt16LE(16, 34); // Bits per sample
        buffer.write('data', 36);
        buffer.writeUInt32LE(numSamples * 2, 40);

        // Generate Samples (Descending Sine Wave)
        let phase = 0;
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            const progress = i / numSamples;
            
            // Linear frequency slide
            const currentFreq = startFreq + (endFreq - startFreq) * progress;
            
            // Update phase based on current frequency
            phase += 2 * Math.PI * currentFreq / sampleRate;
            
            // Apply a simple envelope to avoid clicks at start/end
            let amplitude = 0.5;
            if (progress < 0.1) {
                amplitude *= progress / 0.1; // Fade in
            } else if (progress > 0.8) {
                amplitude *= (1 - progress) / 0.2; // Fade out
            }

            const sample = Math.sin(phase) * amplitude * 32767;
            buffer.writeInt16LE(Math.floor(sample), 44 + i * 2);
        }

        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(outputPath, buffer);
        return outputPath;
    }
}

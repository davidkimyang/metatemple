export const SPEECH_LIMIT = 120;
export const SPEECH_DURATION = 12_000;
export const SPEECH_INTERVAL = 3_000;
export function cleanSpeech(value: unknown): string | null {
 if (typeof value !== 'string') return null;
 const text = value.replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, ' ').replace(/\s+/g, ' ').trim();
 return text && Array.from(text).length <= SPEECH_LIMIT ? text : null;
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Google Gemini Audio Transcription Secondary Fallback Service
 */

import { GoogleGenAI } from '@google/genai';
import { sanitizeMimeType } from './sarvam.service';

export interface GeminiServiceResult {
  success: boolean;
  transcript?: string;
  languageCode?: string;
  httpStatus?: number;
  errorCode?: string;
  errorMessage?: string;
  errorCause?: string;
  errorDetail?: string;
  modelUsed?: string;
}

export async function transcribeWithGemini(
  audioBuffer: Buffer,
  rawMimeType: string,
  languageCode?: string
): Promise<GeminiServiceResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return {
      success: false,
      errorCode: 'GEMINI_NOT_CONFIGURED',
      errorMessage: 'GEMINI_API_KEY is not configured in server environment (.env)',
      errorCause: 'MISSING_ENV_KEY',
    };
  }

  if (!audioBuffer || audioBuffer.length === 0) {
    return {
      success: false,
      errorCode: 'EMPTY_AUDIO',
      errorMessage: 'Uploaded audio buffer is empty (0 bytes)',
      errorCause: 'ZERO_BYTE_PAYLOAD',
    };
  }

  const mimeType = sanitizeMimeType(rawMimeType);
  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
  const base64Audio = audioBuffer.toString('base64');

  const langHint =
    languageCode === 'hi-IN'
      ? 'Hindi'
      : languageCode === 'mr-IN'
      ? 'Marathi'
      : 'English or Indian English';

  const prompt = `You are a precise speech-to-text audio transcriber. Transcribe the spoken audio clip accurately into text. Expected language context: ${langHint}. Return ONLY the verbatim transcribed spoken text. Do not add quotes, commentary, markdown headers, or explanations.`;

  console.log(`[Gemini STT Fallback] Invoking Gemini Audio Transcription: size=${audioBuffer.length}B, MIME=${mimeType} (raw: ${rawMimeType}), langHint=${langHint}`);

  const modelsToTry = ['gemini-3.5-transcribe', 'gemini-3.6-flash', 'gemini-3.5-flash-lite'];
  let lastErrorMsg = '';
  let lastCauseCode = '';
  let lastDetailStr = '';

  for (const modelName of modelsToTry) {
    try {
      // 10-second timeout
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('GEMINI_TIMEOUT')), 10000)
      );

      const generatePromise = ai.models.generateContent({
        model: modelName,
        contents: [
          {
            inlineData: {
              mimeType,
              data: base64Audio,
            },
          },
          prompt,
        ],
      });

      const response = (await Promise.race([generatePromise, timeoutPromise])) as any;
      const transcript = response.text ? response.text.trim() : '';

      if (transcript && transcript.length > 0) {
        console.log(`[Gemini STT Fallback] Model ${modelName} succeeded: "${transcript}"`);
        return {
          success: true,
          httpStatus: 200,
          transcript,
          languageCode,
          modelUsed: modelName,
        };
      } else {
        console.warn(`[Gemini STT Fallback] Model ${modelName} returned empty transcript.`);
        lastErrorMsg = `Model ${modelName} returned empty transcript.`;
        lastCauseCode = 'EMPTY_TRANSCRIPT';
      }
    } catch (err: any) {
      lastErrorMsg = err?.message || String(err);
      const causeObj = err?.cause;
      lastCauseCode = causeObj?.code || err?.code || (lastErrorMsg.includes('GEMINI_TIMEOUT') ? 'ETIMEDOUT' : 'API_ERROR');
      lastDetailStr = causeObj ? `${causeObj.syscall || 'fetch'} ${lastCauseCode}: ${causeObj.message || lastErrorMsg}` : lastErrorMsg;
      console.warn(`[Gemini STT Fallback] Model ${modelName} error (${lastCauseCode}): ${lastDetailStr}`);
    }
  }

  return {
    success: false,
    errorCode: lastCauseCode === 'ETIMEDOUT' ? 'GEMINI_TIMEOUT' : `GEMINI_${lastCauseCode}`,
    errorMessage: lastErrorMsg || 'All Gemini transcription models returned empty transcripts or errors.',
    errorCause: lastCauseCode,
    errorDetail: lastDetailStr,
  };
}

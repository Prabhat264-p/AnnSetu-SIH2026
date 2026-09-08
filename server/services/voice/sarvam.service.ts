/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sarvam AI Speech-to-Text Primary Backend Service
 */

export interface SarvamServiceResult {
  success: boolean;
  transcript?: string;
  languageCode?: string;
  httpStatus?: number;
  errorCode?: string;
  errorMessage?: string;
  errorCause?: string;
  errorDetail?: string;
}

/**
 * Clean raw MIME types (e.g. "audio/webm;codecs=opus" -> "audio/webm")
 * Sarvam API strictly rejects MIME types with codec parameters.
 */
export function sanitizeMimeType(rawMime?: string): string {
  if (!rawMime) return 'audio/webm';
  const clean = rawMime.split(';')[0].trim().toLowerCase();
  if (clean.includes('webm')) return 'audio/webm';
  if (clean.includes('wav')) return 'audio/wav';
  if (clean.includes('mp3') || clean.includes('mpeg')) return 'audio/mp3';
  if (clean.includes('ogg')) return 'audio/ogg';
  if (clean.includes('mp4') || clean.includes('m4a')) return 'audio/mp4';
  if (clean.includes('opus')) return 'audio/opus';
  return clean || 'audio/webm';
}

export async function transcribeWithSarvam(
  audioBuffer: Buffer,
  rawMimeType: string,
  languageCode: string,
  filename: string = 'audio.webm'
): Promise<SarvamServiceResult> {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return {
      success: false,
      errorCode: 'SARVAM_NOT_CONFIGURED',
      errorMessage: 'SARVAM_API_KEY is not configured in server environment (.env)',
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
  const ext = mimeType.split('/')[1] || 'webm';
  const safeFilename = filename && filename.includes('.') ? filename : `speech.${ext}`;

  // Create FormData with clean MIME type
  const formData = new FormData();
  const audioBlob = new Blob([audioBuffer], { type: mimeType });

  formData.append('file', audioBlob, safeFilename);
  formData.append('model', 'saaras:v3');
  formData.append('mode', 'transcribe');

  if (languageCode && languageCode !== 'unknown') {
    formData.append('language_code', languageCode);
  }

  console.log(`[Sarvam STT] Sending request: model=saaras:v3, mode=transcribe, file=${safeFilename}, size=${audioBuffer.length}B, MIME=${mimeType} (raw: ${rawMimeType}), lang=${languageCode}`);

  try {
    // 10-second timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey.trim(),
      },
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const httpStatus = response.status;

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let safeMsg = errorText;

      // Extract JSON error message if present
      try {
        const errObj = JSON.parse(errorText);
        if (errObj?.error?.message) {
          safeMsg = errObj.error.message;
        }
      } catch (e) {
        // Keep raw text
      }

      console.warn(`[Sarvam STT] HTTP ${httpStatus} Error: ${safeMsg}`);

      let errCode = 'SARVAM_SERVICE_ERROR';
      if (httpStatus === 401 || httpStatus === 403) {
        errCode = 'SARVAM_AUTH_FAILED';
      } else if (httpStatus === 400 || httpStatus === 422) {
        errCode = 'SARVAM_AUDIO_REJECTED';
      }

      return {
        success: false,
        httpStatus,
        errorCode: errCode,
        errorMessage: safeMsg || `HTTP ${httpStatus} ${response.statusText}`,
        errorCause: `HTTP_${httpStatus}`,
      };
    }

    const data = (await response.json()) as any;
    const transcript =
      data?.transcript ||
      (Array.isArray(data?.results) && data.results[0]?.transcript) ||
      '';

    console.log(`[Sarvam STT] HTTP 200 OK. Transcript length: ${transcript.length}, text: "${transcript}"`);

    if (!transcript || typeof transcript !== 'string' || transcript.trim() === '') {
      return {
        success: false,
        httpStatus: 200,
        errorCode: 'NO_SPEECH_DETECTED',
        errorMessage: 'Sarvam API returned HTTP 200 but transcript was empty (no speech detected).',
        languageCode: data?.language_code || languageCode,
        errorCause: 'EMPTY_TRANSCRIPT',
      };
    }

    return {
      success: true,
      httpStatus: 200,
      transcript: transcript.trim(),
      languageCode: data?.language_code || languageCode,
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.warn('[Sarvam STT] Request timed out after 10 seconds');
      return {
        success: false,
        errorCode: 'SARVAM_TIMEOUT',
        errorMessage: 'Sarvam AI request timed out after 10 seconds.',
        errorCause: 'ETIMEDOUT',
      };
    }

    const causeObj = err?.cause;
    const causeCode = causeObj?.code || err?.code || 'FETCH_ERROR';
    const causeMsg = causeObj?.message || err?.message || String(err);
    const detailStr = causeObj ? `${causeObj.syscall || 'fetch'} ${causeCode}: ${causeMsg}` : String(err);

    console.warn(`[Sarvam STT] Transport error (${causeCode}): ${detailStr}`);

    return {
      success: false,
      errorCode: `SARVAM_${causeCode}`,
      errorMessage: `Transport error: ${err?.message || 'fetch failed'}`,
      errorCause: causeCode,
      errorDetail: detailStr,
    };
  }
}

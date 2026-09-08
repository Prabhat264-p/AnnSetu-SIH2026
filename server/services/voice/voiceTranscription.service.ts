/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Voice Transcription Orchestrator (Sarvam AI primary -> Gemini secondary fallback)
 */

import { transcribeWithSarvam, sanitizeMimeType } from './sarvam.service';
import { transcribeWithGemini } from './gemini.service';

export interface ProviderDiagnostic {
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'NOT_CONFIGURED' | 'NO_SPEECH';
  stage?: 'transport' | 'http' | 'api' | 'success';
  httpStatus?: number;
  errorCode?: string;
  errorMessage?: string;
  errorCause?: string;
  errorDetail?: string;
}

export interface TranscriptionResult {
  success: boolean;
  transcript?: string;
  provider?: 'sarvam' | 'gemini';
  languageCode?: string;
  error?: string;
  errorCode?: string;
  diagnostics: {
    sarvam: ProviderDiagnostic;
    gemini: ProviderDiagnostic;
    mimeType: string;
    audioSize: number;
  };
}

export async function transcribeAudio(
  audioBuffer: Buffer,
  rawMimeType: string,
  languageCode: string,
  filename: string = 'audio.webm'
): Promise<TranscriptionResult> {
  const cleanMime = sanitizeMimeType(rawMimeType);

  const diagnostics: {
    sarvam: ProviderDiagnostic;
    gemini: ProviderDiagnostic;
    mimeType: string;
    audioSize: number;
  } = {
    sarvam: { status: 'FAILED', stage: 'transport', errorMessage: 'Not executed' },
    gemini: { status: 'SKIPPED', stage: 'transport', errorMessage: 'Skipped' },
    mimeType: cleanMime,
    audioSize: audioBuffer?.length || 0,
  };

  // 1. PRIMARY PROVIDER: Sarvam AI STT (saaras:v3)
  console.log(`[Voice STT Orchestrator] Step 1: Invoking Sarvam AI STT (clean MIME: ${cleanMime}, raw: ${rawMimeType}, size: ${audioBuffer.length}B)...`);
  const sarvamRes = await transcribeWithSarvam(audioBuffer, rawMimeType, languageCode, filename);

  if (sarvamRes.success && sarvamRes.transcript) {
    diagnostics.sarvam = {
      status: 'SUCCESS',
      stage: 'success',
      httpStatus: sarvamRes.httpStatus || 200,
    };
    diagnostics.gemini = { status: 'SKIPPED', stage: 'transport' };

    console.log(`[Voice STT Orchestrator] Sarvam AI Primary Succeeded: "${sarvamRes.transcript}"`);
    return {
      success: true,
      transcript: sarvamRes.transcript,
      provider: 'sarvam',
      languageCode: sarvamRes.languageCode || languageCode,
      diagnostics,
    };
  }

  // Record detailed Sarvam failure diagnostic
  const sarvamStatus = sarvamRes.errorCode === 'SARVAM_NOT_CONFIGURED' ? 'NOT_CONFIGURED' : sarvamRes.errorCode === 'NO_SPEECH_DETECTED' ? 'NO_SPEECH' : 'FAILED';
  const sarvamStage = sarvamRes.httpStatus ? 'http' : 'transport';

  diagnostics.sarvam = {
    status: sarvamStatus,
    stage: sarvamStage,
    httpStatus: sarvamRes.httpStatus,
    errorCode: sarvamRes.errorCode,
    errorMessage: sarvamRes.errorMessage,
    errorCause: sarvamRes.errorCause,
    errorDetail: sarvamRes.errorDetail,
  };

  console.warn(`[Voice STT Orchestrator] Primary provider (Sarvam AI) failed [stage=${sarvamStage}, cause=${sarvamRes.errorCause}]: ${sarvamRes.errorMessage}`);

  // 2. SECONDARY FALLBACK PROVIDER: Google Gemini STT
  console.log(`[Voice STT Orchestrator] Step 2: Falling back to Google Gemini STT...`);
  const geminiRes = await transcribeWithGemini(audioBuffer, rawMimeType, languageCode);

  if (geminiRes.success && geminiRes.transcript) {
    diagnostics.gemini = {
      status: 'SUCCESS',
      stage: 'success',
      httpStatus: geminiRes.httpStatus || 200,
    };

    console.log(`[Voice STT Orchestrator] Google Gemini Fallback Succeeded: "${geminiRes.transcript}"`);
    return {
      success: true,
      transcript: geminiRes.transcript,
      provider: 'gemini',
      languageCode: geminiRes.languageCode || languageCode,
      diagnostics,
    };
  }

  // Record detailed Gemini failure diagnostic
  const geminiStatus = geminiRes.errorCode === 'GEMINI_NOT_CONFIGURED' ? 'NOT_CONFIGURED' : 'FAILED';
  const geminiStage = geminiRes.httpStatus ? 'http' : 'transport';

  diagnostics.gemini = {
    status: geminiStatus,
    stage: geminiStage,
    httpStatus: geminiRes.httpStatus,
    errorCode: geminiRes.errorCode,
    errorMessage: geminiRes.errorMessage,
    errorCause: geminiRes.errorCause,
    errorDetail: geminiRes.errorDetail,
  };

  console.warn(`[Voice STT Orchestrator] Secondary provider (Google Gemini) failed [stage=${geminiStage}, cause=${geminiRes.errorCause}]: ${geminiRes.errorMessage}`);

  // 3. BOTH PROVIDERS FAILED
  let overallErrorCode = 'TRANSCRIPTION_FAILED';
  if (sarvamRes.errorCode === 'SARVAM_NOT_CONFIGURED' && geminiRes.errorCode === 'GEMINI_NOT_CONFIGURED') {
    overallErrorCode = 'STT_KEYS_NOT_CONFIGURED';
  } else if (sarvamRes.errorCode === 'NO_SPEECH_DETECTED') {
    overallErrorCode = 'NO_SPEECH';
  } else if (sarvamRes.errorCode === 'SARVAM_AUTH_FAILED') {
    overallErrorCode = 'SARVAM_AUTH_FAILED';
  } else if (sarvamRes.errorCode === 'SARVAM_AUDIO_REJECTED') {
    overallErrorCode = 'SARVAM_AUDIO_REJECTED';
  } else if (sarvamRes.errorCause === 'ENOTFOUND' && geminiRes.errorCause === 'ENOTFOUND') {
    overallErrorCode = 'BACKEND_DNS_FAILED';
  }

  return {
    success: false,
    error: 'Voice search is temporarily unavailable. Please try again or search manually.',
    errorCode: overallErrorCode,
    diagnostics,
  };
}

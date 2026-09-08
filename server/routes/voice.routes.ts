/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Voice STT Express API Routes (Multipart/Form-Data with Multer)
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { transcribeAudio } from '../services/voice/voiceTranscription.service';
import { parseSpokenText } from '../../src/services/voice/voiceService';

const router = Router();

// Configure multer memory storage for audio uploads (limit 10MB)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

/**
 * POST /api/voice/transcribe
 * Accepts multipart/form-data with audio file in 'file' field.
 */
router.post('/voice/transcribe', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const audioFile = req.file;
    const languageCode = (req.body?.languageCode as string) || 'hi-IN';

    // Development logging for multipart request metadata
    console.log(`[Voice Route] Incoming POST /api/voice/transcribe - File present: ${!!audioFile}, Lang: ${languageCode}`);

    if (!audioFile || !audioFile.buffer || audioFile.buffer.length === 0) {
      console.warn('[Voice Route] Request rejected: req.file is missing or empty buffer');
      res.status(400).json({
        success: false,
        error: 'No valid audio file uploaded in "file" form field.',
        errorCode: 'EMPTY_AUDIO',
        diagnostics: {
          fileReceived: false,
          reqBody: req.body,
        },
      });
      return;
    }

    console.log(`[Voice Route] Audio File Metadata: name=${audioFile.originalname}, size=${audioFile.buffer.length}B, MIME=${audioFile.mimetype}`);

    const result = await transcribeAudio(
      audioFile.buffer,
      audioFile.mimetype || 'audio/webm',
      languageCode,
      audioFile.originalname || 'audio.webm'
    );

    if (!result.success || !result.transcript) {
      res.status(503).json({
        success: false,
        error: result.error || 'Speech recognition service is unavailable.',
        errorCode: result.errorCode || 'API_CONNECTION_FAILED',
        diagnostics: result.diagnostics,
      });
      return;
    }

    // Extract natural language search parameters from transcript
    const params = parseSpokenText(result.transcript);

    res.json({
      success: true,
      transcript: result.transcript,
      provider: result.provider,
      languageCode: result.languageCode || languageCode,
      intent: 'find_procurement_centre',
      params,
      diagnostics: result.diagnostics,
    });
  } catch (err: any) {
    console.error('[Voice Route Exception]:', err);
    res.status(500).json({
      success: false,
      error: 'An unexpected server error occurred during voice transcription.',
      errorCode: 'SERVER_ERROR',
      message: err?.message || String(err),
    });
  }
});

export default router;

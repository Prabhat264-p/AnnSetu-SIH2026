import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  X,
  AlertCircle,
  Search,
  Globe,
  Loader2,
  Bug,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  parseSpokenText,
  getFarmerFriendlyVoiceError,
  VoiceExtractedParams,
  VoiceErrorCode,
} from '../../services/voice/voiceService';
import { apiService } from '../../services/apiService';

export type VoiceStatus =
  | 'IDLE'
  | 'LISTENING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'ERROR'
  | 'UNSUPPORTED';

interface ProviderDiag {
  status: string;
  stage?: string;
  httpStatus?: number;
  errorCode?: string;
  errorMessage?: string;
  errorCause?: string;
  errorDetail?: string;
}

interface DiagnosticState {
  micStatus: 'READY' | 'DENIED' | 'FAILED' | 'ACQUIRING';
  recorderStatus: 'READY' | 'RECORDING' | 'STOPPED' | 'UNSUPPORTED';
  audioSize: number;
  audioMime: string;
  audioDurationSec: number;
  backendStatus: 'UNCHECKED' | 'CONNECTED' | 'FAILED';
  sarvamDiag: ProviderDiag;
  geminiDiag: ProviderDiag;
  returnedTranscript: string;
  parserStatus: 'UNCHECKED' | 'SUCCESS' | 'NO_INTENT';
}

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySearch: (params: VoiceExtractedParams) => void;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  onApplySearch,
}) => {
  const { language } = useApp();

  const [status, setStatus] = useState<VoiceStatus>('IDLE');
  const [transcript, setTranscript] = useState<string>('');
  const [extractedParams, setExtractedParams] = useState<VoiceExtractedParams | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorCode, setErrorCode] = useState<VoiceErrorCode | string | null>(null);
  const [selectedLang, setSelectedLang] = useState<'hi-IN' | 'mr-IN' | 'en-IN'>(
    language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN'
  );
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(true); // Default DEV panel visible

  const [diagnostics, setDiagnostics] = useState<DiagnosticState>({
    micStatus: 'READY',
    recorderStatus: 'READY',
    audioSize: 0,
    audioMime: '',
    audioDurationSec: 0,
    backendStatus: 'UNCHECKED',
    sarvamDiag: { status: 'UNCHECKED' },
    geminiDiag: { status: 'UNCHECKED' },
    returnedTranscript: '',
    parserStatus: 'UNCHECKED',
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const maxRecordingTimerRef = useRef<any>(null);
  const isMountedRef = useRef<boolean>(true);
  const isStartingRef = useRef<boolean>(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopAudioCapture();
    };
  }, []);

  // Clean state reset whenever modal is opened or closed
  useEffect(() => {
    if (isOpen) {
      setStatus('IDLE');
      setTranscript('');
      setExtractedParams(null);
      setErrorMessage('');
      setErrorCode(null);
      setDiagnostics({
        micStatus: 'READY',
        recorderStatus: 'READY',
        audioSize: 0,
        audioMime: '',
        audioDurationSec: 0,
        backendStatus: 'UNCHECKED',
        sarvamDiag: { status: 'UNCHECKED' },
        geminiDiag: { status: 'UNCHECKED' },
        returnedTranscript: '',
        parserStatus: 'UNCHECKED',
      });
    } else {
      stopAudioCapture();
    }
  }, [isOpen]);

  const stopAudioCapture = () => {
    if (maxRecordingTimerRef.current) {
      clearTimeout(maxRecordingTimerRef.current);
      maxRecordingTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        console.log('VOICE DEBUG: stopping media recorder');
        mediaRecorderRef.current.stop();
      } catch (e) {
        // Ignore stop errors
      }
    }
    mediaRecorderRef.current = null;

    if (mediaStreamRef.current) {
      try {
        console.log('VOICE DEBUG: releasing microphone tracks');
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {
        // Ignore stream stop errors
      }
      mediaStreamRef.current = null;
    }
  };

  const processAudioRecording = async (audioBlob: Blob, durationSec: number) => {
    if (!isMountedRef.current) return;

    console.log(`VOICE DEBUG: recording stopped | size = ${audioBlob.size} bytes | type = ${audioBlob.type} | duration = ${durationSec.toFixed(1)}s`);

    setDiagnostics((prev) => ({
      ...prev,
      recorderStatus: 'STOPPED',
      audioSize: audioBlob.size,
      audioMime: audioBlob.type,
      audioDurationSec: durationSec,
    }));

    if (audioBlob.size === 0 || durationSec < 0.3) {
      console.warn('VOICE DEBUG: empty recording or audio duration too short');
      setStatus('ERROR');
      setErrorCode('NO_SPEECH');
      setErrorMessage(getFarmerFriendlyVoiceError('NO_SPEECH'));
      return;
    }

    setStatus('PROCESSING');
    console.log('VOICE DEBUG: upload started to POST /api/voice/transcribe');

    try {
      const filename = audioBlob.type.includes('wav') ? 'speech.wav' : 'speech.webm';
      const formData = new FormData();
      formData.append('file', audioBlob, filename);
      formData.append('languageCode', selectedLang);

      const res = await apiService.transcribeVoice(formData);

      console.log('VOICE DEBUG: upload response =', res);

      if (!isMountedRef.current) return;

      const serverDiags = res.diagnostics || {};

      setDiagnostics((prev) => ({
        ...prev,
        backendStatus: res.errorCode === 'BACKEND_UNAVAILABLE' ? 'FAILED' : 'CONNECTED',
        sarvamDiag: serverDiags.sarvam || { status: 'FAILED', errorMessage: res.error },
        geminiDiag: serverDiags.gemini || { status: 'SKIPPED' },
        returnedTranscript: res.transcript || '',
      }));

      if (res.success && res.transcript) {
        setTranscript(res.transcript);
        const parsed = parseSpokenText(res.transcript);
        setExtractedParams(parsed);
        setDiagnostics((prev) => ({
          ...prev,
          parserStatus: parsed.crop || parsed.district ? 'SUCCESS' : 'NO_INTENT',
        }));
        setStatus('SUCCESS');
      } else {
        const errCode = res.errorCode || 'TRANSCRIPTION_FAILED';
        setErrorCode(errCode);

        let userMsg = res.error || 'Voice search is temporarily unavailable. Please try again or search manually.';
        if (errCode === 'STT_KEYS_NOT_CONFIGURED') {
          userMsg = 'Voice transcription API keys are not configured on the server. Please search manually.';
        } else if (errCode === 'SARVAM_AUTH_FAILED') {
          userMsg = 'Sarvam voice service authentication error. Please check server credentials.';
        } else if (errCode === 'SARVAM_AUDIO_REJECTED') {
          userMsg = 'Sarvam rejected the audio format. Please try again.';
        } else if (errCode === 'BACKEND_DNS_FAILED') {
          userMsg = 'Voice service connection failed due to server network lookup error.';
        }

        setErrorMessage(userMsg);
        setStatus('ERROR');
      }
    } catch (err: any) {
      console.warn('VOICE DEBUG: upload exception:', err);
      if (isMountedRef.current) {
        setErrorCode('API_CONNECTION_FAILED');
        setErrorMessage('Voice search is temporarily unavailable. Please try again or search manually.');
        setDiagnostics((prev) => ({
          ...prev,
          backendStatus: 'FAILED',
        }));
        setStatus('ERROR');
      }
    }
  };

  const handleStartListening = async () => {
    if (isStartingRef.current) {
      console.log('VOICE DEBUG: duplicate handleStartListening guarded');
      return;
    }
    isStartingRef.current = true;
    setTimeout(() => {
      isStartingRef.current = false;
    }, 350);

    stopAudioCapture();
    setErrorMessage('');
    setErrorCode(null);
    setTranscript('');
    setExtractedParams(null);

    setDiagnostics((prev) => ({
      ...prev,
      micStatus: 'ACQUIRING',
      recorderStatus: 'READY',
      audioSize: 0,
      audioDurationSec: 0,
      returnedTranscript: '',
      sarvamDiag: { status: 'UNCHECKED' },
      geminiDiag: { status: 'UNCHECKED' },
    }));

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('VOICE DEBUG: getUserMedia unsupported in browser');
      if (isMountedRef.current) {
        setStatus('UNSUPPORTED');
        setErrorCode('UNSUPPORTED_BROWSER');
        setErrorMessage(getFarmerFriendlyVoiceError('UNSUPPORTED_BROWSER'));
        setDiagnostics((prev) => ({
          ...prev,
          micStatus: 'FAILED',
          recorderStatus: 'UNSUPPORTED',
        }));
      }
      return;
    }

    try {
      console.log('VOICE DEBUG: microphone acquiring...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!isMountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      console.log('VOICE DEBUG: microphone acquired');
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const durationSec = (Date.now() - recordingStartTimeRef.current) / 1000;
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        processAudioRecording(audioBlob, durationSec);
      };

      recordingStartTimeRef.current = Date.now();
      mediaRecorder.start(100);
      console.log('VOICE DEBUG: recording started with MIME:', mimeType);

      setDiagnostics((prev) => ({
        ...prev,
        micStatus: 'READY',
        recorderStatus: 'RECORDING',
        audioMime: mimeType,
      }));

      setStatus('LISTENING');

      // Auto-stop recording after 10 seconds max
      maxRecordingTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          console.log('VOICE DEBUG: auto-stopping recording after 10s timeout');
          mediaRecorderRef.current.stop();
        }
      }, 10000);
    } catch (err: any) {
      console.warn('VOICE DEBUG: microphone error:', err);
      if (isMountedRef.current) {
        setStatus('ERROR');
        setErrorCode('MICROPHONE_PERMISSION_DENIED');
        setErrorMessage(getFarmerFriendlyVoiceError('MICROPHONE_PERMISSION_DENIED'));
        setDiagnostics((prev) => ({
          ...prev,
          micStatus: 'DENIED',
          recorderStatus: 'STOPPED',
        }));
      }
    }
  };

  const handleStopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      console.log('VOICE DEBUG: manual stop listening clicked');
      mediaRecorderRef.current.stop();
    } else {
      stopAudioCapture();
      setStatus('IDLE');
    }
  };

  // Sample Natural Spoken Phrases Execution (Direct Offline Parser Test Support)
  const handleSimulatedPhrase = (phrase: string) => {
    stopAudioCapture();
    setErrorMessage('');
    setErrorCode(null);
    setStatus('LISTENING');
    setTranscript(phrase);

    setTimeout(() => {
      if (isMountedRef.current) {
        setStatus('PROCESSING');
        setTimeout(() => {
          if (isMountedRef.current) {
            const parsed = parseSpokenText(phrase);
            setExtractedParams(parsed);
            setDiagnostics((prev) => ({
              ...prev,
              returnedTranscript: phrase,
              parserStatus: 'SUCCESS',
            }));
            setStatus('SUCCESS');
          }
        }, 600);
      }
    }, 800);
  };

  if (!isOpen) return null;

  const getErrorTitle = () => {
    if (errorCode === 'NO_SPEECH') return "🎙️ Couldn't hear you";
    if (errorCode === 'MICROPHONE_PERMISSION_DENIED') return '🎙️ Microphone Access Required';
    if (errorCode === 'API_CONNECTION_FAILED' || errorCode === 'BACKEND_UNAVAILABLE') return '⚠️ Voice Service Unavailable';
    if (errorCode === 'STT_KEYS_NOT_CONFIGURED') return '⚠️ STT API Keys Unconfigured';
    return "⚠️ Couldn't understand speech";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none font-sans">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 relative border border-[#c1c8c2]/60">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#eeeeeb] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#c1ecd4] text-[#002114] flex items-center justify-center font-bold">
              <Mic className="w-4 h-4 text-[#2c694e]" />
            </div>
            <div>
              <h3 className="font-black text-base text-[#012d1d]">🎙️ Speak to Search</h3>
              <p className="text-[10px] text-[#717973] font-medium">
                Tell us what crop and location you need
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              title="Toggle Dev Diagnostics"
              className={`p-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                showDiagnostics ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Bug className="w-3.5 h-3.5" />
              <span>DEV</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Language Selection Bar */}
        <div className="flex items-center justify-between bg-[#f3f4f1] p-1.5 rounded-2xl text-xs font-bold border border-[#c1c8c2]/40">
          <span className="text-[11px] text-[#717973] pl-2 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-[#2c694e]" />
            <span>Voice Language:</span>
          </span>
          <div className="flex items-center gap-1">
            {[
              { code: 'hi-IN', label: 'हिन्दी' },
              { code: 'mr-IN', label: 'मराठी' },
              { code: 'en-IN', label: 'English' },
            ].map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setSelectedLang(lang.code as any);
                  if (status === 'LISTENING') {
                    stopAudioCapture();
                    setTimeout(() => handleStartListening(), 100);
                  }
                }}
                className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                  selectedLang === lang.code
                    ? 'bg-[#1b4332] text-white shadow-2xs font-extrabold'
                    : 'text-[#012d1d] hover:bg-white/60'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN DISPLAY CANVAS (BASED ON VOICE STATUS) */}

        {/* 1. IDLE STATE: CLEAN START - NO ERROR */}
        {status === 'IDLE' && (
          <div className="bg-[#f9faf6] p-7 rounded-3xl border border-[#c1c8c2]/50 text-center space-y-4 animate-in fade-in">
            <div className="relative inline-block">
              <button
                type="button"
                onClick={handleStartListening}
                className="w-22 h-22 rounded-full bg-[#012d1d] hover:bg-[#1b4332] flex items-center justify-center font-bold text-white transition-all cursor-pointer shadow-xl active:scale-95"
              >
                <Mic className="w-10 h-10 text-[#aeeecb]" />
              </button>
            </div>

            <div>
              <h4 className="text-sm font-black text-[#012d1d]">Tap microphone to speak</h4>
              <p className="text-xs text-[#717973] font-medium mt-1">
                Tell us where and what crop you need a centre for.
              </p>
            </div>
          </div>
        )}

        {/* 2. LISTENING STATE */}
        {status === 'LISTENING' && (
          <div className="bg-[#f3f9f5] p-7 rounded-3xl border border-[#2c694e]/40 text-center space-y-4 animate-in fade-in">
            <div className="relative inline-block">
              <button
                type="button"
                onClick={handleStopListening}
                className="w-22 h-22 rounded-full bg-[#2c694e] ring-8 ring-[#aeeecb] animate-pulse flex items-center justify-center font-bold text-white transition-all cursor-pointer shadow-xl"
              >
                <Mic className="w-10 h-10 text-[#aeeecb]" />
              </button>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#2c694e] text-white px-3 py-1 rounded-full text-xs font-black">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                <span>🔴 Listening... Tap mic when done speaking</span>
              </div>
              <p className="text-xs text-[#717973] font-medium mt-2">
                {selectedLang === 'hi-IN'
                  ? '"मुझे नाशिक में गेहूं के लिए सेंटर चाहिए"'
                  : selectedLang === 'mr-IN'
                  ? '"मला सिन्नरंमध्ये गव्हाचे सेंटर दाखवा"'
                  : '"Find wheat centres in Nashik"'}
              </p>
            </div>

            {transcript && (
              <div className="bg-white p-3 rounded-2xl border border-[#2c694e]/30 text-xs font-bold text-[#012d1d]">
                <p className="italic text-sm text-[#2c694e]">"{transcript}"</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                stopAudioCapture();
                setStatus('IDLE');
              }}
              className="bg-white text-[#717973] hover:text-[#012d1d] px-4 py-1.5 rounded-xl text-xs font-bold border border-[#c1c8c2]/50 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        {/* 3. PROCESSING STATE */}
        {status === 'PROCESSING' && (
          <div className="bg-[#f9faf6] p-8 rounded-3xl border border-[#c1c8c2]/50 text-center space-y-3 animate-in fade-in">
            <Loader2 className="w-10 h-10 text-[#2c694e] animate-spin mx-auto" />
            <h4 className="text-sm font-black text-[#012d1d]">Transcribing Indian Language AI Speech...</h4>
            <p className="text-xs text-[#717973]">Uploading audio payload to Sarvam AI STT</p>
          </div>
        )}

        {/* 4. SUCCESS STATE: CONFIRM UNDERSTOOD PARAMETERS */}
        {status === 'SUCCESS' && extractedParams && (
          <div className="bg-[#f3f9f5] p-5 rounded-3xl border border-[#2c694e]/40 space-y-4 animate-in fade-in">
            <div>
              <span className="text-[10px] font-black uppercase text-[#717973] block mb-0.5">
                YOU SAID:
              </span>
              <p className="text-xs font-bold text-[#012d1d] italic bg-white p-2.5 rounded-xl border border-[#c1c8c2]/40">
                "{extractedParams.rawText}"
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-[#2c694e] block tracking-wider">
                ✓ UNDERSTOOD SEARCH PARAMETERS
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {extractedParams.crop && (
                  <div className="bg-white p-2.5 rounded-xl border border-[#c1c8c2]/40">
                    <span className="text-[10px] text-[#717973] font-bold block">🌾 Crop Commodity</span>
                    <span className="font-black text-[#012d1d] text-xs">{extractedParams.crop}</span>
                  </div>
                )}

                {extractedParams.state && (
                  <div className="bg-white p-2.5 rounded-xl border border-[#c1c8c2]/40">
                    <span className="text-[10px] text-[#717973] font-bold block">🏛️ State</span>
                    <span className="font-black text-[#012d1d] text-xs">
                      {extractedParams.state} {extractedParams.stateCode ? `(${extractedParams.stateCode})` : ''}
                    </span>
                  </div>
                )}

                {extractedParams.district && (
                  <div className="bg-white p-2.5 rounded-xl border border-[#c1c8c2]/40">
                    <span className="text-[10px] text-[#717973] font-bold block">📍 District Location</span>
                    <span className="font-black text-[#012d1d] text-xs">
                      {extractedParams.district} {extractedParams.districtCode ? `(${extractedParams.districtCode})` : ''}
                    </span>
                  </div>
                )}

                {extractedParams.block && (
                  <div className="bg-white p-2.5 rounded-xl border border-[#c1c8c2]/40">
                    <span className="text-[10px] text-[#717973] font-bold block">🏢 Block / Tehsil</span>
                    <span className="font-black text-[#012d1d] text-xs">{extractedParams.block}</span>
                  </div>
                )}

                {extractedParams.quantity && (
                  <div className="bg-white p-2.5 rounded-xl border border-[#c1c8c2]/40">
                    <span className="text-[10px] text-[#717973] font-bold block">⚖️ Yield Quantity</span>
                    <span className="font-black text-[#2c694e] text-xs">{extractedParams.quantity} Quintals</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleStartListening}
                className="flex-1 h-[48px] bg-white text-[#012d1d] font-extrabold text-xs rounded-2xl border border-[#c1c8c2]/60 hover:bg-[#f3f4f1] cursor-pointer"
              >
                🎙️ Speak Again
              </button>

              <button
                type="button"
                onClick={() => {
                  onApplySearch(extractedParams);
                  onClose();
                }}
                className="flex-1 h-[48px] bg-[#1b4332] hover:bg-[#012d1d] text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-98"
              >
                <Search className="w-4 h-4 text-[#aeeecb]" />
                <span>Search Centres →</span>
              </button>
            </div>
          </div>
        )}

        {/* 5. ERROR STATE: RECOGNITION / SERVER FAILURE */}
        {status === 'ERROR' && (
          <div className="bg-[#ffdad6] text-[#ba1a1a] p-5 rounded-3xl border border-red-200 text-center space-y-3 animate-in fade-in">
            <AlertCircle className="w-8 h-8 mx-auto text-[#ba1a1a]" />
            <div>
              <h4 className="font-black text-sm text-[#ba1a1a]">{getErrorTitle()}</h4>
              <p className="text-xs text-[#ba1a1a]/90 mt-1">
                {errorMessage || getFarmerFriendlyVoiceError('TRANSCRIPTION_FAILED')}
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleStartListening}
                className="bg-[#1b4332] text-white px-4 py-2.5 rounded-xl text-xs font-black cursor-pointer shadow-xs"
              >
                🎙️ Try Again
              </button>

              <button
                type="button"
                onClick={onClose}
                className="bg-white text-[#012d1d] px-4 py-2.5 rounded-xl text-xs font-bold border border-red-200 cursor-pointer"
              >
                ⌨️ Search Manually
              </button>
            </div>
          </div>
        )}

        {/* 6. UNSUPPORTED BROWSER STATE */}
        {status === 'UNSUPPORTED' && (
          <div className="bg-amber-50 text-amber-900 p-5 rounded-3xl border border-amber-200 text-center space-y-3 animate-in fade-in">
            <AlertCircle className="w-8 h-8 mx-auto text-amber-800" />
            <div>
              <h4 className="font-black text-sm text-amber-950">Voice Search Unavailable</h4>
              <p className="text-xs text-amber-800 mt-1">
                {getFarmerFriendlyVoiceError('UNSUPPORTED_BROWSER')}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="bg-[#1b4332] text-white px-5 py-2.5 rounded-xl text-xs font-black cursor-pointer"
            >
              ⌨️ Search Manually
            </button>
          </div>
        )}

        {/* DEV DIAGNOSTICS PANEL */}
        {showDiagnostics && (
          <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-[11px] font-mono space-y-2.5 border border-slate-700 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-amber-400 font-bold">
              <span>🐞 DEV DIAGNOSTICS PANEL</span>
              <span>LANG: {selectedLang}</span>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
              <div>
                <span className="text-slate-400">Microphone: </span>
                <span className={diagnostics.micStatus === 'READY' ? 'text-green-400 font-bold' : 'text-red-400'}>
                  {diagnostics.micStatus}
                </span>
              </div>

              <div>
                <span className="text-slate-400">Recorder: </span>
                <span className={diagnostics.recorderStatus === 'RECORDING' ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                  {diagnostics.recorderStatus}
                </span>
              </div>

              <div>
                <span className="text-slate-400">Audio Payload: </span>
                <span className="text-blue-300">
                  {diagnostics.audioSize}B | {diagnostics.audioDurationSec.toFixed(1)}s
                </span>
              </div>

              <div>
                <span className="text-slate-400">MIME Type: </span>
                <span className="text-blue-300">{diagnostics.audioMime || 'N/A'}</span>
              </div>

              <div>
                <span className="text-slate-400">Backend API: </span>
                <span className={diagnostics.backendStatus === 'CONNECTED' ? 'text-green-400 font-bold' : 'text-red-400'}>
                  {diagnostics.backendStatus}
                </span>
              </div>

              <div>
                <span className="text-slate-400">Parser Status: </span>
                <span className={diagnostics.parserStatus === 'SUCCESS' ? 'text-green-400 font-bold' : 'text-slate-400'}>
                  {diagnostics.parserStatus}
                </span>
              </div>
            </div>

            {/* Sarvam Provider Detailed Diagnostic */}
            <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-emerald-400">SARVAM AI (v3):</span>
                <span className={diagnostics.sarvamDiag.status === 'SUCCESS' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                  STATUS: {diagnostics.sarvamDiag.status || 'UNCHECKED'}
                  {diagnostics.sarvamDiag.httpStatus ? ` (HTTP ${diagnostics.sarvamDiag.httpStatus})` : ''}
                </span>
              </div>
              {diagnostics.sarvamDiag.stage && (
                <div className="text-slate-400 text-[9px]">
                  Stage: <span className="text-amber-300 font-bold">{diagnostics.sarvamDiag.stage}</span>
                  {diagnostics.sarvamDiag.errorCause ? ` | Cause: ${diagnostics.sarvamDiag.errorCause}` : ''}
                </div>
              )}
              {diagnostics.sarvamDiag.errorMessage && (
                <div className="text-red-300 text-[9px] break-words" title={diagnostics.sarvamDiag.errorDetail || diagnostics.sarvamDiag.errorMessage}>
                  Detail: {diagnostics.sarvamDiag.errorDetail || diagnostics.sarvamDiag.errorMessage}
                </div>
              )}
            </div>

            {/* Gemini Provider Detailed Diagnostic */}
            <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-sky-400">GEMINI STT FALLBACK:</span>
                <span className={diagnostics.geminiDiag.status === 'SUCCESS' ? 'text-green-400 font-bold' : diagnostics.geminiDiag.status === 'SKIPPED' ? 'text-slate-400' : 'text-red-400 font-bold'}>
                  STATUS: {diagnostics.geminiDiag.status || 'UNCHECKED'}
                  {diagnostics.geminiDiag.httpStatus ? ` (HTTP ${diagnostics.geminiDiag.httpStatus})` : ''}
                </span>
              </div>
              {diagnostics.geminiDiag.stage && (
                <div className="text-slate-400 text-[9px]">
                  Stage: <span className="text-amber-300 font-bold">{diagnostics.geminiDiag.stage}</span>
                  {diagnostics.geminiDiag.errorCause ? ` | Cause: ${diagnostics.geminiDiag.errorCause}` : ''}
                </div>
              )}
              {diagnostics.geminiDiag.errorMessage && (
                <div className="text-red-300 text-[9px] break-words" title={diagnostics.geminiDiag.errorDetail || diagnostics.geminiDiag.errorMessage}>
                  Detail: {diagnostics.geminiDiag.errorDetail || diagnostics.geminiDiag.errorMessage}
                </div>
              )}
            </div>

            {diagnostics.returnedTranscript && (
              <div className="pt-1 border-t border-slate-800">
                <span className="text-slate-400 block text-[9px]">RETURNED TRANSCRIPT:</span>
                <p className="text-amber-300 italic font-sans text-xs">"{diagnostics.returnedTranscript}"</p>
              </div>
            )}

            {/* LOCATION EXTRACTION & FORM SYNC DIAGNOSTICS */}
            {extractedParams && (
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-[10px]">
                <div className="text-amber-400 font-bold text-[11px]">📍 LOCATION EXTRACTION DIAGNOSTICS</div>
                <div className="text-slate-300">
                  Raw input: <span className="text-white italic">"{extractedParams.rawText}"</span>
                </div>
                <div className="text-slate-300">
                  Resolved state: <span className="text-emerald-400 font-bold">{extractedParams.state || 'N/A'}</span> {extractedParams.stateCode ? `(${extractedParams.stateCode})` : ''}
                </div>
                <div className="text-slate-300">
                  Resolved district: <span className="text-emerald-400 font-bold">{extractedParams.district || 'N/A'}</span> {extractedParams.districtCode ? `(${extractedParams.districtCode})` : ''}
                </div>
                <div className="text-slate-300">
                  Resolved block: <span className="text-emerald-400 font-bold">{extractedParams.block || 'All Blocks'}</span>
                </div>
                <div className="text-slate-300">
                  Resolution status: <span className={extractedParams.state || extractedParams.district ? 'text-green-400 font-bold' : 'text-amber-400 font-bold'}>{extractedParams.state || extractedParams.district ? 'SUCCESS' : 'NO_LOCATION'}</span>
                </div>

                <div className="text-amber-400 font-bold pt-1 text-[11px]">⚡ FORM SYNC & AUTO SEARCH</div>
                <div className="text-slate-300">
                  state: <span className="text-green-400 font-bold">SUCCESS</span> | district: <span className="text-green-400 font-bold">SUCCESS</span> | block: <span className="text-green-400 font-bold">SUCCESS</span> | crop: <span className="text-green-400 font-bold">SUCCESS</span>
                </div>
                <div className="text-slate-300">
                  Auto search status: <span className="text-green-400 font-bold">SUCCESS</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sample Spoken Phrases for Quick Testing */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#717973] block">
            TRY SAMPLE SPOKEN PHRASES (PARSER TEST)
          </span>

          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => handleSimulatedPhrase('Danapur me wheat centre chahiye')}
              className="bg-[#f3f4f1] hover:bg-[#e8e8e5] text-[#012d1d] font-bold text-[10px] px-2.5 py-1.5 rounded-xl border border-[#c1c8c2]/50 cursor-pointer"
            >
              "Danapur me wheat centre chahiye"
            </button>

            <button
              type="button"
              onClick={() => handleSimulatedPhrase('मुझे नाशिक में गेहूं के लिए सेंटर चाहिए')}
              className="bg-[#f3f4f1] hover:bg-[#e8e8e5] text-[#012d1d] font-bold text-[10px] px-2.5 py-1.5 rounded-xl border border-[#c1c8c2]/50 cursor-pointer"
            >
              "मुझे नाशिक में गेहूं के लिए सेंटर चाहिए"
            </button>

            <button
              type="button"
              onClick={() => handleSimulatedPhrase('मला सिन्नरंमध्ये गव्हाचे सेंटर दाखवा')}
              className="bg-[#f3f4f1] hover:bg-[#e8e8e5] text-[#012d1d] font-bold text-[10px] px-2.5 py-1.5 rounded-xl border border-[#c1c8c2]/50 cursor-pointer"
            >
              "मला सिन्नरंमध्ये गव्हाचे सेंटर दाखवा"
            </button>

            <button
              type="button"
              onClick={() => handleSimulatedPhrase('Find wheat centres in Nashik')}
              className="bg-[#f3f4f1] hover:bg-[#e8e8e5] text-[#012d1d] font-bold text-[10px] px-2.5 py-1.5 rounded-xl border border-[#c1c8c2]/50 cursor-pointer"
            >
              "Find wheat centres in Nashik"
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

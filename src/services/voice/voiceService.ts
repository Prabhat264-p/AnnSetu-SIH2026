import { resolveSpokenLocation } from '../location/locationService';

export interface VoiceExtractedParams {
  crop?: string;
  state?: string;
  stateCode?: string;
  district?: string;
  districtCode?: string;
  block?: string;
  subdistrictCode?: string;
  quantity?: number;
  useLocation?: boolean;
  rawText: string;
  isAmbiguous?: boolean;
  ambiguousMatches?: Array<{ state: string; district: string; block?: string }>;
}

export type VoiceErrorCode =
  | 'MICROPHONE_PERMISSION_DENIED'
  | 'NO_SPEECH'
  | 'UNSUPPORTED_BROWSER'
  | 'API_CONNECTION_FAILED'
  | 'TRANSCRIPTION_FAILED';

export interface VoiceServiceResponse {
  success: boolean;
  transcript: string;
  intent: 'find_procurement_centre' | 'unknown';
  params: VoiceExtractedParams;
  error?: string;
  errorCode?: VoiceErrorCode;
}

/**
 * Natural Language Parameter Extractor for Spoken Hindi, Marathi, and English
 */
export const parseSpokenText = (text: string): VoiceExtractedParams => {
  const lower = text.toLowerCase();
  let crop: string | undefined = undefined;
  let quantity: number | undefined = undefined;
  let useLocation = false;

  // 1. Multilingual Crop Extraction (Hindi, Marathi, English)
  if (
    lower.includes('गेहूं') ||
    lower.includes('गेहू') ||
    lower.includes('गहू') ||
    lower.includes('गव्हाच') ||
    lower.includes('गव्हाचे') ||
    lower.includes('गव्हाचं') ||
    lower.includes('wheat')
  ) {
    crop = 'Wheat';
  } else if (
    lower.includes('धान') ||
    lower.includes('भात') ||
    lower.includes('चावल') ||
    lower.includes('तांदूळ') ||
    lower.includes('paddy') ||
    lower.includes('rice')
  ) {
    crop = 'Paddy';
  } else if (
    lower.includes('सोयाबीन') ||
    lower.includes('soybean') ||
    lower.includes('soya')
  ) {
    crop = 'Soybean';
  } else if (
    lower.includes('चना') ||
    lower.includes('हरभरा') ||
    lower.includes('chana') ||
    lower.includes('gram')
  ) {
    crop = 'Gram (Chana)';
  } else if (
    lower.includes('मक्का') ||
    lower.includes('मका') ||
    lower.includes('maize') ||
    lower.includes('corn')
  ) {
    crop = 'Maize';
  } else if (
    lower.includes('सरसों') ||
    lower.includes('मोहरी') ||
    lower.includes('mustard')
  ) {
    crop = 'Mustard';
  } else if (
    lower.includes('कपास') ||
    lower.includes('कापूस') ||
    lower.includes('cotton')
  ) {
    crop = 'Cotton';
  }

  // 2. Global Location Resolution via LGD Location Master
  const resolvedLoc = resolveSpokenLocation(text);

  // 3. Geolocation / Near Me Keyword Trigger
  if (
    lower.includes('पास') ||
    lower.includes('जवळ') ||
    lower.includes('near me') ||
    lower.includes('मेरे पास')
  ) {
    useLocation = true;
  }

  // 4. Yield Quantity Extraction (e.g., "25 quintals")
  const qtyMatch = lower.match(/(\d+)\s*(क्विंटल|quintal|qtl)/);
  if (qtyMatch && qtyMatch[1]) {
    quantity = parseInt(qtyMatch[1], 10);
  }

  return {
    crop,
    state: resolvedLoc.state,
    stateCode: resolvedLoc.stateCode,
    district: resolvedLoc.district,
    districtCode: resolvedLoc.districtCode,
    block: resolvedLoc.block,
    subdistrictCode: resolvedLoc.subdistrictCode,
    quantity,
    useLocation,
    rawText: text,
    isAmbiguous: resolvedLoc.isAmbiguous,
    ambiguousMatches: resolvedLoc.ambiguousMatches,
  };
};

/**
 * Standardized Error Code to Farmer-Friendly Message Mapper
 */
export const getFarmerFriendlyVoiceError = (errorCode: VoiceErrorCode): string => {
  switch (errorCode) {
    case 'MICROPHONE_PERMISSION_DENIED':
      return 'Microphone permission is blocked. Please allow microphone access in your browser.';
    case 'NO_SPEECH':
      return "Couldn't hear any speech. Please try speaking again.";
    case 'UNSUPPORTED_BROWSER':
      return "Voice search isn't supported in this browser. Please search manually.";
    case 'API_CONNECTION_FAILED':
      return 'Speech recognition service is unavailable. Please try again or search manually.';
    case 'TRANSCRIPTION_FAILED':
    default:
      return "Couldn't understand speech clearly. Please try again.";
  }
};

export const TTS_LANGUAGES = {
  en: { label: "English", languageCode: "en-US", voiceName: "en-US-Neural2-F" },
  hi: { label: "Hindi", languageCode: "hi-IN", voiceName: "hi-IN-Neural2-A" },
  kn: { label: "Kannada", languageCode: "kn-IN", voiceName: "kn-IN-Wavenet-A" },
  ur: { label: "Urdu", languageCode: "ur-IN", voiceName: "ur-IN-Wavenet-A" },
  es: { label: "Spanish", languageCode: "es-ES", voiceName: "es-ES-Neural2-A" },
  fr: { label: "French", languageCode: "fr-FR", voiceName: "fr-FR-Neural2-A" },
} as const;

export type TTSLanguage = keyof typeof TTS_LANGUAGES;

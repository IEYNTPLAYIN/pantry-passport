export const supportedLanguages = ["en", "nl", "de", "fr"] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

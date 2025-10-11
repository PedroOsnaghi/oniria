import { inappropriateWords, inappropriatePatterns, allowPatterns } from '../../config/moderation-config';

export class ContentModerationService {
  private wordRegexes: RegExp[];
  private patternRegexes: RegExp[];
  private allowPatterns: RegExp[];

  constructor() {

    this.wordRegexes = (inappropriateWords || []).map((w) => {
      const normalized = this.removeDiacritics(String(w).toLowerCase());
      return new RegExp(`\\b${this.escapeForRegex(normalized)}\\b`, 'i');
    });

    this.patternRegexes = (inappropriatePatterns || []).map((p) => {
      if (p instanceof RegExp) return p;
      return new RegExp(String(p), 'i');
    });

    this.allowPatterns = allowPatterns || [];
  }

  private removeDiacritics(s: string): string {
    return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').normalize('NFC');
  }

  private escapeForRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&');
  }

  validateContentInterpretation(text: string): { isValid: boolean; reason?: string } {
    if (!text) return { isValid: true };

    const raw = String(text);
    const normalizedText = this.removeDiacritics(raw.toLowerCase().trim());

    const collapseSingleLetterSequences = (s: string) =>
      s.replace(/\b(?:[a-zA-Z]\s+){1,}[a-zA-Z]\b/g, (m) => m.replace(/\s+/g, ''));
    const collapseRepeatedChars = (s: string) => s.replace(/(.)(\1){2,}/g, '$1');

    const rawLower = raw.toLowerCase().trim();
    const deobfuscatedRaw = collapseRepeatedChars(collapseSingleLetterSequences(rawLower)).replace(/\s+/g, ' ');

    const deobfuscatedNormalized = collapseRepeatedChars(collapseSingleLetterSequences(normalizedText)).replace(/\s+/g, ' ');

    const wordCandidates = [normalizedText, deobfuscatedNormalized];
    const sensitiveKeywords = '(suicid|matar|asesin|viol|golp|apuñal|disparar|suicidio)';
    const selfDirectedRe = new RegExp(`\\b(me|mi|yo|se|nos|te|me\\s+hab[ií]a)\\b(?:\\s+\\w+){0,3}\\s+${sensitiveKeywords}`, 'i');

    for (const candidate of wordCandidates) {
      for (const rx of this.wordRegexes) {
        if (rx.test(candidate)) {
          const allowed = this.allowPatterns.some((p) => p.test(rawLower) || p.test(normalizedText) || p.test(deobfuscatedNormalized) || p.test(deobfuscatedRaw));
          if (allowed && !selfDirectedRe.test(candidate)) continue;
          return { isValid: false, reason: 'Contenido inapropiado detectado' };
        }
      }
    }

    const patternCandidates = [rawLower, deobfuscatedRaw, normalizedText, deobfuscatedNormalized];
    for (const candidate of patternCandidates) {
      for (const rx of this.patternRegexes) {
        if (rx.test(candidate)) {
          const allowed = this.allowPatterns.some((p) => p.test(rawLower) || p.test(normalizedText) || p.test(deobfuscatedNormalized) || p.test(deobfuscatedRaw));
          if (allowed && !selfDirectedRe.test(candidate)) continue;
          return { isValid: false, reason: 'Contenido con patrones inapropiados detectado' };
        }
      }
    }
    return { isValid: true };
  }

  logInappropriateContent(content: string, reason: string, userId?: string): void {
    console.warn(`[CONTENT_MODERATION] Contenido bloqueado: ${reason}`);
    console.warn(`[CONTENT_MODERATION] Usuario: ${userId || 'Anónimo'}`);
    console.warn(`[CONTENT_MODERATION] Contenido: ${content.substring(0, 100)}...`);
  }
}
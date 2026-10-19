/**
 * Utility to repair Mojibake strings (UTF-8 bytes incorrectly decoded as Latin1 / Windows-1252)
 * Ensures 100% clean Vietnamese text across all modules.
 */

// Known Mojibake pattern mappings for the clinic system
const MOJIBAKE_MAP = [
  { pattern: /Sáº¯p\s*háº¿t\s*hÃ\s*ng/gi, replacement: 'Sắp hết hàng' },
  { pattern: /Sáº¯p\s*háº¿t\s*háº¡n/gi, replacement: 'Sắp hết hạn sử dụng' },
  { pattern: /Tá»\x93n\s*Ã­t\s*&\s*Sáº¯p\s*háº¿t\s*háº¡n/gi, replacement: 'Tồn ít & Sắp hết hạn' },
  { pattern: /BÃ¬nh\s*thÆ°á»\x9dng/gi, replacement: 'Bình thường' },
  { pattern: /Chá»\x9d\s*khÃ¡m/gi, replacement: 'Chờ khám' },
  { pattern: /Ä\x90ang\s*khÃ¡m/gi, replacement: 'Đang khám' },
  { pattern: /Ä\x90Ã£\s*khÃ¡m/gi, replacement: 'Đã khám' },
  { pattern: /Ä\x90Ã£\s*há»§y/gi, replacement: 'Đã hủy' },
  { pattern: /ChÆ°a\s*thanh\s*toÃ¡n/gi, replacement: 'Chưa thanh toán' },
  { pattern: /Ä\x90Ã£\s*thanh\s*toÃ¡n/gi, replacement: 'Đã thanh toán' },
];

export const cleanText = (str) => {
  if (!str || typeof str !== 'string') return str;

  // Check known patterns first
  let cleaned = str;
  for (const { pattern, replacement } of MOJIBAKE_MAP) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, replacement);
    }
  }

  // General heuristic check for remaining mojibake markers
  if (cleaned.includes('Sáº') || cleaned.includes('háº') || cleaned.includes('hÃ') || cleaned.includes('Ä')) {
    const lower = cleaned.toLowerCase();
    if (lower.includes('s') && lower.includes('p') && lower.includes('h') && lower.includes('ng')) {
      return 'Sắp hết hàng';
    }
    if (lower.includes('h') && lower.includes('n') && lower.includes('d') && lower.includes('ng')) {
      return 'Sắp hết hạn sử dụng';
    }
    if (lower.includes('t') && lower.includes('n') && lower.includes('h') && lower.includes('n')) {
      return 'Tồn ít & Sắp hết hạn';
    }
    if (lower.includes('b') && lower.includes('nh') && lower.includes('th') && lower.includes('ng')) {
      return 'Bình thường';
    }
  }

  return cleaned;
};

/**
 * Recursively traverses any payload (Object, Array, Primitive) and sanitizes strings
 */
export const sanitizeDataPayload = (data) => {
  if (!data) return data;
  if (typeof data === 'string') return cleanText(data);
  if (Array.isArray(data)) {
    return data.map(sanitizeDataPayload);
  }
  if (typeof data === 'object') {
    const sanitizedObj = {};
    for (const key of Object.keys(data)) {
      sanitizedObj[key] = sanitizeDataPayload(data[key]);
    }
    return sanitizedObj;
  }
  return data;
};

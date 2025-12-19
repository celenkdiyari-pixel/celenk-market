
/**
 * Sanitizes environment variables that might be wrapped in quotes or have escaped newlines.
 * This is common in some deployment environments like Vercel or when pulling envs.
 */
export function sanitizeEnv(val: string | undefined): string | undefined {
    if (!val) return val;

    // Remove surrounding quotes (both " and ')
    let sanitized = val.trim();
    if ((sanitized.startsWith('"') && sanitized.endsWith('"')) ||
        (sanitized.startsWith("'") && sanitized.endsWith("'"))) {
        sanitized = sanitized.slice(1, -1);
    }

    // Handle escaped newlines (common in private keys)
    return sanitized.replace(/\\n/g, '\n');
}

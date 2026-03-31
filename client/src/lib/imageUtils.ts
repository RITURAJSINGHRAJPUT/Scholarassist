import { API_BASE_URL } from './api';

const API_BASE = API_BASE_URL.replace(/\/api$/, '');

/**
 * Converts various Google Drive link formats to a direct image source URL.
 * @param url The original Google Drive URL
 * @returns A direct image link or the original URL if not a Drive link
 */
export function convertDriveLink(url: string): string {
    if (!url || typeof url !== 'string') return url;

    // Detect if it's a folder link
    if (url.includes('/folders/') || url.includes('/drive/folders/')) {
        return 'FOLDER_LINK_ERROR';
    }

    // Comprehensive ID extraction
    const idPatterns = [
        /\/file\/d\/([a-zA-Z0-9_-]+)/,
        /\/d\/([a-zA-Z0-9_-]+)/,
        /(?:\?id=|\/uc\?id=)([a-zA-Z0-9_-]+)/,
        /id=([a-zA-Z0-9_-]+)/
    ];

    let fileId = '';
    for (const pattern of idPatterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            fileId = match[1];
            break;
        }
    }

    if (fileId && (url.includes('google.com') || url.includes('googleusercontent.com'))) {
        // Use our server-side proxy to bypass Google's hotlinking/CORS restrictions
        return `${API_BASE}/api/blog/proxy-image?id=${fileId}`;
    }

    return url;
}

/**
 * Returns a full URL for an image, handling both external links and local uploads.
 * @param path The image path or URL
 * @returns A fully qualified URL
 */
export function getImageUrl(path: string | undefined | null): string {
    if (!path) return '';

    // If it's already an absolute URL
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return convertDriveLink(path);
    }

    // If it's a relative path (it should start with /uploads or similar)
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE}${cleanPath}`;
}

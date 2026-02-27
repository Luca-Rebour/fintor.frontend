export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "").trim();

export function buildApiUrl(path: string): string {
    if (!API_BASE_URL) {
        throw new Error("EXPO_PUBLIC_API_BASE_URL is not configured");
    }

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const pathWithoutLeadingSlash = normalizedPath.slice(1);

    if (API_BASE_URL.endsWith("/")) {        
        return `${API_BASE_URL}${pathWithoutLeadingSlash}`;
    }

    return `${API_BASE_URL}${normalizedPath}`;
}

import api from "../api/axios";

/**
 * Check if the current path has a redirect configured
 * @param {string} path - The path to check for redirects
 * @returns {Promise<Object|null>} - Returns redirect object if found, null otherwise
 */
export const checkRedirect = async (path) => {
  try {
    const response = await api.get(`/redirects/check?path=${encodeURIComponent(path)}`);
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    // If the endpoint doesn't exist or there's an error, just return null
    // This prevents breaking the app if redirect check fails
    console.error("Redirect check failed:", error);
    return null;
  }
};

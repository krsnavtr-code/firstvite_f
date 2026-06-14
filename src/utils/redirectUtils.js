import api from "../api/axios";

/**
 * Check if the current path has a redirect configured
 * @param {string} path - The path to check for redirects
 * @returns {Promise<Object|null>} - Returns redirect object if found, null otherwise
 */
export const checkRedirect = async (path) => {
  try {
    // Skip redirect check for dynamic routes that contain IDs
    // This prevents redirect checks from interfering with course/:id, etc.
    if (path.includes("/:") || path.match(/\/[a-f0-9]{24}$/)) {
      return null;
    }

    // Also skip redirect check for course and free-course routes to avoid conflicts
    // UNLESS the path looks like a slug (not a MongoDB ObjectId)
    if (path.startsWith("/course/") || path.startsWith("/free-course/")) {
      // Allow redirect check for slugs, but skip for ObjectIds
      if (!path.match(/\/[a-f0-9]{24}$/)) {
        // This is a slug, allow redirect check
      } else {
        return null;
      }
    }

    // Try with just the path first
    let response = await api.get(
      `/redirects/check?path=${encodeURIComponent(path)}`,
    );
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }

    // If not found, try with full URL
    const fullUrl = `${window.location.origin}${path}`;
    response = await api.get(
      `/redirects/check?path=${encodeURIComponent(fullUrl)}`,
    );
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }

    // If still not found, try with www prefix if not present
    if (!window.location.host.startsWith("www.")) {
      const wwwUrl = `${window.location.protocol}//www.${window.location.host}${path}`;
      response = await api.get(
        `/redirects/check?path=${encodeURIComponent(wwwUrl)}`,
      );
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
    }

    return null;
  } catch (error) {
    // If the endpoint doesn't exist or there's an error, just return null
    // This prevents breaking the app if redirect check fails
    console.error("Redirect check failed:", error);
    return null;
  }
};

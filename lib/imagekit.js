/**
 * ImageKit Upload Helper for Shoolin OS
 * Handles image uploading to ImageKit CDN with client fallback & error reporting.
 */

export async function checkImageKitStatus() {
  try {
    const res = await fetch('/api/upload/imagekit', { method: 'GET' });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Failed to check ImageKit status:', err);
  }
  return { configured: false, hasPrivateKey: false };
}

export async function uploadToImageKit(file, options = {}) {
  const { folder = '/user-avatars', fileName } = options;

  try {
    const formData = new FormData();
    formData.append('file', file);
    if (fileName || (file && file.name)) {
      formData.append('fileName', fileName || file.name);
    }
    formData.append('folder', folder);

    const res = await fetch('/api/upload/imagekit', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Failed to upload image to ImageKit',
        code: data.code,
        details: data.details,
      };
    }

    return {
      success: true,
      url: data.url,
      fileId: data.fileId,
      name: data.name,
      thumbnailUrl: data.thumbnailUrl || data.url,
    };
  } catch (err) {
    console.error('ImageKit upload client error:', err);
    return {
      success: false,
      error: err.message || 'Network error while uploading image',
    };
  }
}

/**
 * Delete a file from ImageKit by fileId.
 * Calls the server-side delete route so the private key is never exposed to the browser.
 * Silently fails — safe to call without crashing the caller.
 *
 * @param {string} fileId - The ImageKit fileId returned at upload time
 */
export async function deleteFromImageKit(fileId) {
  if (!fileId) return { success: false, error: 'No fileId provided' };

  try {
    const res = await fetch('/api/upload/imagekit/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId }),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('deleteFromImageKit client error:', err);
    return { success: false, error: err.message };
  }
}

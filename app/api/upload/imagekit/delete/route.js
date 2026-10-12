import { NextResponse } from 'next/server';

/**
 * DELETE /api/upload/imagekit/delete
 * Deletes a file from ImageKit by fileId using the private key server-side.
 * Body: { fileId: string }
 */
export async function DELETE(request) {
  try {
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'fileId is required' },
        { status: 400 }
      );
    }

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

    if (!privateKey) {
      return NextResponse.json(
        { success: false, error: 'IMAGEKIT_PRIVATE_KEY not configured' },
        { status: 500 }
      );
    }

    const authHeader =
      'Basic ' + Buffer.from(privateKey + ':').toString('base64');

    const ikResponse = await fetch(
      `https://api.imagekit.io/v1/files/${fileId}`,
      {
        method: 'DELETE',
        headers: { Authorization: authHeader },
      }
    );

    // 204 No Content = success from ImageKit
    if (ikResponse.status === 204 || ikResponse.ok) {
      return NextResponse.json({ success: true });
    }

    const errText = await ikResponse.text().catch(() => 'Unknown error');
    console.warn('[ImageKit Delete] Failed to delete file:', fileId, errText);

    return NextResponse.json(
      { success: false, error: 'ImageKit delete failed', details: errText },
      { status: ikResponse.status }
    );
  } catch (err) {
    console.error('[ImageKit Delete] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

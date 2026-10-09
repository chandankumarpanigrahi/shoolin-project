import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || process.env.IMAGEKIT_URL_ENDPOINT;

    if (!privateKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'IMAGEKIT_PRIVATE_KEY is missing in .env.local',
          code: 'MISSING_ENV',
        },
        { status: 400 }
      );
    }

    let fileData = '';
    let fileName = `user_avatar_${Date.now()}`;
    let folder = '/user-avatars';

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      fileName = formData.get('fileName') || file?.name || fileName;
      folder = formData.get('folder') || folder;

      if (!file) {
        return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
      }

      if (typeof file === 'string') {
        fileData = file;
      } else {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fileData = buffer.toString('base64');
      }
    } else {
      const json = await request.json();
      fileData = json.file || json.fileData || json.base64;
      if (json.fileName) fileName = json.fileName;
      if (json.folder) folder = json.folder;
    }

    if (!fileData) {
      return NextResponse.json({ success: false, error: 'File content is empty' }, { status: 400 });
    }

    const authHeader = 'Basic ' + Buffer.from(privateKey + ':').toString('base64');

    const ikFormData = new FormData();
    ikFormData.append('file', fileData);
    ikFormData.append('fileName', fileName);
    ikFormData.append('useUniqueFileName', 'true');
    ikFormData.append('folder', folder);
    if (publicKey) ikFormData.append('publicKey', publicKey);

    const ikResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
      },
      body: ikFormData,
    });

    const ikResult = await ikResponse.json();

    if (!ikResponse.ok) {
      console.error('ImageKit API Upload Error:', ikResult);
      return NextResponse.json(
        {
          success: false,
          error: ikResult.message || ikResult.help || 'ImageKit API upload failed',
          details: ikResult,
        },
        { status: ikResponse.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: ikResult.url,
      fileId: ikResult.fileId,
      name: ikResult.name,
      filePath: ikResult.filePath,
      thumbnailUrl: ikResult.thumbnailUrl || ikResult.url,
    });
  } catch (err) {
    console.error('Error uploading image to ImageKit:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error during upload' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || process.env.IMAGEKIT_PUBLIC_KEY || '';
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || '';
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || process.env.IMAGEKIT_URL_ENDPOINT || '';

  const configured = Boolean(privateKey && (publicKey || urlEndpoint));

  return NextResponse.json({
    configured,
    publicKey,
    urlEndpoint,
    hasPrivateKey: Boolean(privateKey),
  });
}

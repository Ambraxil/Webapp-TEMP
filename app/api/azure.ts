const apiEndpoint = process.env.EXPO_PUBLIC_API_ENDPOINT || 'http://localhost:3001';

export async function getImageUrl(blobName: string, expiryHours: number = 24): Promise<string> {
  try {
    const response = await fetch(`${apiEndpoint}/api/azure/sas-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blobName, expiryHours }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch SAS URL: ${response.status}`);
    }

    const data = await response.json();
    return data.url || '';
  } catch (error) {
    console.error('Azure image URL error:', error);
    return '';
  }
}

export async function uploadImageWithText(blobName: string, originalText: string, imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const base64 = await blobToBase64(blob);

    const uploadResponse = await fetch(`${apiEndpoint}/api/azure/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blobName, originalText, imageBase64: base64 }),
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    }

    const data = await uploadResponse.json();
    return data.url || '';
  } catch (error) {
    console.error('Upload image error:', error);
    return '';
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      resolve(result.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, ''));
    };
    reader.onerror = () => reject(new Error('Could not read image blob'));
    reader.readAsDataURL(blob);
  });
}
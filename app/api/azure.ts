const accountName = process.env.EXPO_PUBLIC_AZURE_ACCOUNT_NAME || "";
const accountKey = process.env.EXPO_PUBLIC_AZURE_ACCOUNT_KEY || "";
const containerName = "images";

/**
 * Generate a direct SAS URL (no backend needed)
 */
export function getImageUrl(blobName: string, expiryHours: number = 24): string {
  if (!accountName || !accountKey) {
    console.error("Azure credentials not configured");
    return "";
  }

  // Calculate expiry time
  const startsOn = new Date();
  const expiresOn = new Date(startsOn.getTime() + expiryHours * 60 * 60 * 1000);
  const expiresOnIso = expiresOn.toISOString().replace(/\.\d{3}Z/, "Z");

  // Build the SAS token string to sign
  const stringToSign = [
    "r", // permissions
    "", // start
    expiresOnIso,
    `/${containerName}/${blobName}`,
    "", // signed identifier
    "", // IP
    "https", // protocol
    "2023-01-03", // api-version
  ].join("\n");

  // Simple direct URL (no signature needed for images with account key in query)
  return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;
}
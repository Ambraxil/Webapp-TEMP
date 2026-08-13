import { app } from "@azure/functions";
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

const {
  AZURE_STORAGE_CONTAINER_NAME,
  AZURE_STORAGE_ACCOUNT_NAME,
  AZURE_STORAGE_ACCOUNT_KEY,
} = process.env;

let containerClient;
function getContainerClient() {
  if (containerClient) return containerClient;

  if (
    !AZURE_STORAGE_CONTAINER_NAME ||
    !AZURE_STORAGE_ACCOUNT_NAME ||
    !AZURE_STORAGE_ACCOUNT_KEY
  ) {
    throw new Error(
      "Missing AZURE_STORAGE_CONTAINER_NAME / AZURE_STORAGE_ACCOUNT_NAME / AZURE_STORAGE_ACCOUNT_KEY app settings"
    );
  }

  const credential = new StorageSharedKeyCredential(
    AZURE_STORAGE_ACCOUNT_NAME,
    AZURE_STORAGE_ACCOUNT_KEY
  );
  const blobServiceClient = new BlobServiceClient(
    `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
    credential
  );
  containerClient = blobServiceClient.getContainerClient(
    AZURE_STORAGE_CONTAINER_NAME
  );
  return containerClient;
}

async function streamToString(readableStream) {
  const chunks = [];
  for await (const chunk of readableStream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

// In-memory cache — persists for the lifetime of the warm Function instance.
let cache = { items: null, fetchedAt: 0 };
const CACHE_TTL_MS = 30_000;

async function loadItems() {
  const now = Date.now();
  if (cache.items && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.items;
  }

  const client = getContainerClient();
  const items = [];

  for await (const blob of client.listBlobsFlat()) {
    if (!blob.name.toLowerCase().endsWith(".json")) continue;

    const blobClient = client.getBlobClient(blob.name);
    const downloadResponse = await blobClient.download();
    const raw = await streamToString(downloadResponse.readableStreamBody);

    try {
      const parsed = JSON.parse(raw);
      items.push({
        id: blob.name,
        image: parsed.image,
        extracted_text: parsed.extracted_text,
        translation_to_spanish: parsed.translation_to_spanish,
        timestamp_utc: parsed.timestamp_utc,
      });
    } catch (err) {
      console.warn(`Skipping ${blob.name}: invalid JSON (${err.message})`);
    }
  }

  items.sort((a, b) => new Date(b.timestamp_utc) - new Date(a.timestamp_utc));

  cache = { items, fetchedAt: now };
  return items;
}

app.http("items", {
  methods: ["GET"],
  authLevel: "anonymous", // SWA's built-in routing handles access; see staticwebapp.config.json
  route: "items",
  handler: async (_request, context) => {
    try {
      const items = await loadItems();
      return { jsonBody: items };
    } catch (err) {
      context.error(err);
      return {
        status: 500,
        jsonBody: { error: "Failed to load items from Azure Blob Storage" },
      };
    }
  },
});

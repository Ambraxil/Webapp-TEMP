import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

const {
  AZURE_STORAGE_CONTAINER_NAME,
  AZURE_STORAGE_ACCOUNT_NAME,
  AZURE_STORAGE_ACCOUNT_KEY,
  PORT = 4000,
} = process.env;

if (
  !AZURE_STORAGE_CONTAINER_NAME ||
  !AZURE_STORAGE_ACCOUNT_NAME ||
  !AZURE_STORAGE_ACCOUNT_KEY
) {
  console.error(
    "Missing one of AZURE_STORAGE_CONTAINER_NAME / AZURE_STORAGE_ACCOUNT_NAME / AZURE_STORAGE_ACCOUNT_KEY in server/.env"
  );
  process.exit(1);
}

const credential = new StorageSharedKeyCredential(
  AZURE_STORAGE_ACCOUNT_NAME,
  AZURE_STORAGE_ACCOUNT_KEY
);

const blobServiceClient = new BlobServiceClient(
  `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
  credential
);

const containerClient = blobServiceClient.getContainerClient(
  AZURE_STORAGE_CONTAINER_NAME
);

async function streamToString(readableStream) {
  const chunks = [];
  for await (const chunk of readableStream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

// Simple in-memory cache so we don't re-hit Azure on every request.
// Good enough for a viewer app; swap for real caching if traffic grows.
let cache = { items: null, fetchedAt: 0 };
const CACHE_TTL_MS = 30_000;

async function loadItems() {
  const now = Date.now();
  if (cache.items && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.items;
  }

  const items = [];
  for await (const blob of containerClient.listBlobsFlat()) {
    if (!blob.name.toLowerCase().endsWith(".json")) continue;

    const blobClient = containerClient.getBlobClient(blob.name);
    const downloadResponse = await blobClient.download();
    const raw = await streamToString(downloadResponse.readableStreamBody);

    try {
      const parsed = JSON.parse(raw);
      items.push({
        id: blob.name,
        image: parsed.image, // base64 string, no data: prefix
        extracted_text: parsed.extracted_text,
        translation_to_spanish: parsed.translation_to_spanish,
        timestamp_utc: parsed.timestamp_utc,
      });
    } catch (err) {
      console.warn(`Skipping ${blob.name}: invalid JSON (${err.message})`);
    }
  }

  items.sort(
    (a, b) => new Date(b.timestamp_utc) - new Date(a.timestamp_utc)
  );

  cache = { items, fetchedAt: now };
  return items;
}

const app = express();
app.use(cors());

app.get("/api/items", async (_req, res) => {
  try {
    const items = await loadItems();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load items from Azure Blob Storage" });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Glyph server listening on http://localhost:${PORT}`);
});

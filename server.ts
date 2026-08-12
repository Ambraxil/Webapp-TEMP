import express from "express";
import {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

const app = express();
app.use(express.json({ limit: "10mb" }));

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || "";
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY || "";
const containerName = "images";

app.post("/api/azure/sas-url", (req, res) => {
  try {
    const { blobName, expiryHours = 24 } = req.body;

    if (!accountName || !accountKey) {
      return res.status(500).json({ error: "Azure credentials not configured" });
    }

    const startsOn = new Date();
    const expiresOn = new Date(startsOn.getTime() + expiryHours * 60 * 60 * 1000);

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const sasQueryParameters = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse("r"),
        startsOn,
        expiresOn,
      },
      sharedKeyCredential
    );

    const url = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasQueryParameters}`;
    res.json({ url });
  } catch (error) {
    console.error("Error generating SAS URL:", error);
    res.status(500).json({ error: "Failed to generate SAS URL" });
  }
});

app.post("/api/azure/upload", async (req, res) => {
  try {
    const { blobName, originalText, imageBase64 } = req.body;

    if (!accountName || !accountKey) {
      return res.status(500).json({ error: "Azure credentials not configured" });
    }

    if (!blobName || !imageBase64) {
      return res.status(400).json({ error: "Missing blob name or image data" });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      new StorageSharedKeyCredential(accountName, accountKey)
    );
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(buffer, {
      metadata: {
        originalText: originalText || "",
        source: "web-app",
      },
      blobHTTPHeaders: {
        blobContentType: "image/jpeg",
      },
    });

    const sasQueryParameters = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse("r"),
        startsOn: new Date(Date.now() - 60_000),
        expiresOn: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      new StorageSharedKeyCredential(accountName, accountKey)
    );

    const url = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasQueryParameters}`;
    res.json({ success: true, url, originalText });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

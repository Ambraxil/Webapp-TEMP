import express from "express";
import { generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } from "@azure/storage-blob";

const app = express();
app.use(express.json());

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

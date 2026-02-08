const { BlobServiceClient } = require("@azure/storage-blob");

function getContainer() {
  const conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!conn) throw new Error("Falta AZURE_STORAGE_CONNECTION_STRING");
  const containerName = process.env.AZURE_BLOB_CONTAINER || "listing-images";

  const service = BlobServiceClient.fromConnectionString(conn);
  return service.getContainerClient(containerName);
}

async function uploadBufferToBlob({ buffer, mimeType, filename }) {
  const container = getContainer();
  await container.createIfNotExists({ access: "blob" });

  const blobName = `${Date.now()}-${filename}`;
  const blockBlob = container.getBlockBlobClient(blobName);

  await blockBlob.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: mimeType }
  });

  return blockBlob.url;
}

module.exports = { uploadBufferToBlob };


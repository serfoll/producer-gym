import { DefaultAzureCredential } from "@azure/identity";
import {
  BlobServiceClient,
  type BlockBlobClient,
  type ContainerClient,
  type ContainerCreateResponse,
  type BlobUploadCommonResponse,
  type BlockBlobParallelUploadOptions,
} from "@azure/storage-blob";

import fs from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export function createServiceClient(): BlobServiceClient {
  try {
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
    if (!accountName) throw new Error(`Azure Storage accountName not found`);

    // Add `Storage Blob Data Contributor` role assignment to the identity
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      new DefaultAzureCredential(),
    );

    return blobServiceClient;
  } catch (error) {
    throw new Error(`Failed to get client: ${error}`);
  }
}

export async function createContainer(
  blobServiceClient: BlobServiceClient,
  containerName: string,
): Promise<ContainerClient> {
  const _containerClient = blobServiceClient.getContainerClient(containerName);
  const containerExists = await _containerClient.exists();
  if (containerExists) return _containerClient;

  const {
    containerClient,
    containerCreateResponse,
  }: {
    containerClient: ContainerClient;
    containerCreateResponse: ContainerCreateResponse;
  } = await blobServiceClient.createContainer(containerName);

  if (containerCreateResponse.errorCode)
    throw new Error(
      `Failed to create container: ${containerCreateResponse.errorCode} `,
    );

  return containerClient;
}

export async function uploadBlobFromLocalPath(
  containerClient: ContainerClient,
  blobName: string,
  localFilePath: string,
): Promise<{ res: BlobUploadCommonResponse; client: BlockBlobClient }> {
  // Create blob client from container client
  const blockBlobClient: BlockBlobClient =
    containerClient.getBlockBlobClient(blobName);

  const uploadOptions: BlockBlobParallelUploadOptions = {
    blobHTTPHeaders: {
      blobContentType: "audio/wav",
    },
  };

  const uploadResponse: BlobUploadCommonResponse =
    await blockBlobClient.uploadFile(localFilePath, uploadOptions);

  if (uploadResponse.errorCode)
    throw new Error(`Failed to upload blob: ${uploadResponse.errorCode}`);

  return { res: uploadResponse, client: blockBlobClient };
}

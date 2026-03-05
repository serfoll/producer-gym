"use server";
import {
  generateBlobSASQueryParameters,
  ContainerSASPermissions,
  SASProtocol,
} from "@azure/storage-blob";
import path from "node:path";
import {
  createContainer,
  createServiceClient,
  uploadBlobFromLocalPath,
} from "./services/azure";

export async function createBlobFromLocalPath(fileName: string) {
  const serviceClient = createServiceClient();

  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "";
  const containerClient = await createContainer(serviceClient, containerName);

  const blobName = "challenge.wav";

  const cAudio = await uploadBlobFromLocalPath(
    containerClient,
    blobName,
    path.resolve(fileName),
    "audio/wav",
  );

  return cAudio.client.url;
}

export async function generateSASURL(
  blobName: string,
  contentType: string,
): Promise<{ [key: string]: string | unknown }> {
  try {
    const blobServiceClient = createServiceClient();

    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME ?? "";
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME ?? "";
    const startsOn = new Date(Date.now() - 5 * 60 * 60 * 1000);
    const expiresOn = new Date(Date.now() + 60 * 60 * 60 * 1000);

    // Generate user delegation SAS for a container
    const userDelegationKey = await blobServiceClient.getUserDelegationKey(
      startsOn,
      expiresOn,
    );

    const containerSASToken = generateBlobSASQueryParameters(
      {
        containerName, // Required
        blobName,
        permissions: ContainerSASPermissions.parse("cw"), // Required
        startsOn, // Optional. Date type
        expiresOn, // Required. Date type
        contentType,
        protocol: SASProtocol.HttpsAndHttp, // Optional
        version: "2018-11-09", // Must greater than or equal to 2018-11-09 to generate user delegation SAS
      },
      userDelegationKey, // UserDelegationKey
      accountName,
    ).toString();

    const blobSasUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${containerSASToken}`;

    return { url: blobSasUrl, blobPath: blobName };
  } catch (error) {
    return { failed: error };
  }
}

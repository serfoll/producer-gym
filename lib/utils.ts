import path from "node:path";
import {
  generateBlobSASQueryParameters,
  ContainerSASPermissions,
  SASProtocol,
} from "@azure/storage-blob";
import {
  createContainer,
  createServiceClient,
  uploadBlobFromLocalPath,
} from "./services/azure";
import crypto from "node:crypto";

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

export const generateEncryptedString = async (byte = 32): Promise<string> =>
  crypto.randomBytes(byte).toString("hex");

export const capitaliseScoreKeyString = (key: string): string => {
  const keyStr = key.split("Score")[0];
  return keyStr.charAt(0).toUpperCase() + keyStr.slice(1);
};

export async function generateSASURL(
  contentType: string,
): Promise<{ [key: string]: string }> {
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

    const blobName = await generateEncryptedString();

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

    return { url: blobSasUrl, blobPath: blobName, containerName };
  } catch (error) {
    return { failed: `Something went wrong: ${error}` };
  }
}

export async function uploadBlodViaSAS(
  file: File,
): Promise<{ [key: string]: string | URL }> {
  try {
    const getSignedUrl = await generateSASURL(file?.type);

    if (getSignedUrl?.failed || !getSignedUrl?.url) {
      throw new Error(getSignedUrl?.failed);
    }

    const { url: uploadUrl, blobPath, containerName } = getSignedUrl;

    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        //MANDATORY FOR AZURE!
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": file?.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(
        `staus: ${uploadResponse.status},statusText: ${uploadResponse.statusText}`,
      );
    }

    const cdnUrl = process.env.AZURE_STORAGE_FRONT_DOOR_URL;
    const url = new URL(`https://${cdnUrl}/${containerName}/${blobPath}`);

    return {
      url: url?.href ?? undefined,
    };
  } catch (error) {
    return {
      failed: "Failed to upload track",
      reason: `${error}`,
    };
  }
}

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function getUTCDate(daysToAdd = 0): Date {
  const now = new Date();
  const today = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + daysToAdd,
      0,
      0,
      0,
      0,
    ),
  );

  return today;
}

export function calculateTtl(): number {
  const now = new Date();
  const timeToNextDayUTC = getUTCDate(1).getTime();

  const ttl = Math.floor((timeToNextDayUTC - now.getTime()) / 1000);

  return Math.max(ttl, 1);
}

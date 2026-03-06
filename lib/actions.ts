"use server";
import type { ActionState } from "./types";
import { generateSASURL, uploadBlodViaSAS } from "./utils";

export async function addChallengeActionState(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const title = formData.get("title") as string;
  const file = formData.get("file") as File;

  const newChallengeData = {
    title: title,
    file: file,
  };

  try {
    const blobUrl = await uploadBlodViaSAS(file);

    if (blobUrl?.failed || !blobUrl?.url) {
      console.error(blobUrl?.reason);
      throw new Error(blobUrl?.failed.toString());
    }

    return {
      message: "Challenge has been created",
      data: formData,
    };
  } catch (error) {
    console.error("Catch error: ", error);
    return {
      message: "Failed to create challenge!",
      data: newChallengeData,
    };
  }
}

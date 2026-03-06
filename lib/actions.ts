"use server";
import { processAndExtractFeature } from "./audio-processor";
import type { ActionState } from "./types";
import { uploadBlodViaSAS } from "./utils";

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

    if (blobUrl?.failed) {
      throw new Error(blobUrl?.reason as string);
    }

    const features = await processAndExtractFeature(blobUrl?.url);

    console.log("features");

    return {
      message: "Challenge has been created",
      data: formData,
    };
  } catch (error) {
    console.error("Reason: ", error);
    return {
      message: "Failed to create challenge!",
      data: newChallengeData,
    };
  }
}

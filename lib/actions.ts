"use server";
import { anaylizeAndExtractAudioFeatures } from "./audio-analyzer";
import { StatusState, type ActionState } from "./types";
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

    const features = await anaylizeAndExtractAudioFeatures(
      blobUrl?.url?.toString(),
    );

    return {
      message: "Challenge has been created",
      status: StatusState.SUCCESS,
      data: formData,
    };
  } catch (error) {
    console.error("Reason: ", error);
    return {
      message: "Failed to create challenge!",
      data: newChallengeData,
      status: StatusState.ERROR,
      error: { reason: `${error}` },
    };
  }
}

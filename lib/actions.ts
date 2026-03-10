"use server";
import { formatISO, ISOStringFormat } from "date-fns";
import { anaylizeAndExtractAudioFeatures } from "./audio-analyzer";
import { type NewChallengeData, StatusState, type ActionState } from "./types";
import { uploadBlodViaSAS } from "./utils";
import prisma from "./services/prisma";
import { revalidatePath } from "next/cache";

export async function addChallengeActionState(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const title = formData.get("title") as string;
  const file = formData.get("file") as File;
  const activeDate = formData.get("active-date") as string;
  const description = formData.get("description") as string;

  const newChallengeFormData = {
    title: title,
    file: file,
    activeDate: formatISO(activeDate) as ISOStringFormat,
    description: description,
  };

  try {
    const blobUrl = await uploadBlodViaSAS(newChallengeFormData.file);

    if (blobUrl?.failed) {
      throw new Error(blobUrl?.reason as string);
    }

    const trackFeatures = await anaylizeAndExtractAudioFeatures(
      blobUrl?.url?.toString(),
    );

    const challengeData: NewChallengeData = {
      title: newChallengeFormData.title,
      blobUrl: blobUrl?.url.toString(),
      activeDate: newChallengeFormData.activeDate,
      referenceFeatures: trackFeatures,
      duration: trackFeatures.duration,
    };

    await prisma.challenge.create({ data: challengeData });

    revalidatePath("/");
    return {
      message: "Challenge has been created",
      status: StatusState.SUCCESS,
      data: formData,
    };
  } catch (error) {
    console.error("Reason: ", error);
    return {
      message: "Failed to create challenge!",
      data: newChallengeFormData,
      status: StatusState.ERROR,
      error: { reason: `${error}` },
    };
  }
}

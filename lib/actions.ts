"use server";
import type { ActionState } from "./types";
import { generateSASURL } from "./utils";

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

  const fileName = file?.name.split(" ")
    ? file?.name.split(" ").join("_").toLowerCase()
    : file?.name.toLowerCase();

  try {
    const getSignedUrl = await generateSASURL(fileName, file?.type);

    if (
      getSignedUrl?.failed !== undefined ||
      (!getSignedUrl?.url && getSignedUrl?.url === "")
    ) {
      console.error(getSignedUrl?.failed);
      return {
        message: "Something went wrong, please try again",
        data: newChallengeData,
      };
    }

    const uploadUrl = getSignedUrl?.url;

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
      console.error(uploadResponse.statusText);
      console.error(uploadResponse.status);

      return {
        message: "Failed to create challenge!",
        data: newChallengeData,
      };
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

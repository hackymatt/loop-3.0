import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { URLS } from "src/api/urls";
import { ClientApi } from "src/api/service";

const endpoint = URLS.PROJECT_CHANNEL_POST_IMAGES;

type IPostImageReturn = { url: string };

export const usePostImage = () =>
  useMutation<IPostImageReturn, AxiosError, File>(async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const result = await ClientApi.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return result.data;
  });

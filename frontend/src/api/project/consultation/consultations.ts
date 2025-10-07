import type { AxiosError } from "axios";
import type { Language } from "src/locales/types";

import { useMutation } from "@tanstack/react-query";

import { URLS } from "src/api/urls";
import { ClientApi } from "src/api/service";

const endpoint = URLS.PROJECT_CONSULTATIONS;

type ICreateConsultation = {
  comment: string;
};

type ICreateConsultationReturn = { data: ICreateConsultation; status: number };

export const useCreateConsultation = (slug: string, language: Language) => {
  const url = `${endpoint}/${slug}`;
  return useMutation<ICreateConsultationReturn, AxiosError, ICreateConsultation>(
    async (variables) => {
      const result = await ClientApi.post(url, variables, {
        headers: { "Accept-Language": language },
      });
      return { status: result.status, data: result.data };
    }
  );
};

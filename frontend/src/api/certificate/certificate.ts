import type { Language } from "src/locales/types";
import type { GetQueryResponse } from "src/api/types";
import type { ICertificateProps } from "src/types/certificate";

import { compact } from "lodash-es";
import { cookies } from "next/headers";

import { getData } from "src/api/utils";

import { URLS } from "../urls";

const endpoint = URLS.CERTIFICATES;

type ICertificate = {
  id: string;
  student_name: string;
  project_name: string;
  completed_at: string;
};

export const certificateQuery = (language: Language, id: string) => {
  const url = endpoint;
  const queryUrl = `${url}/${id}`;

  const queryFn = async (): Promise<GetQueryResponse<ICertificateProps>> => {
    const { data } = await getData<ICertificate>(queryUrl, {
      headers: { "Accept-Language": language, Cookie: cookies().toString() },
    });
    const { student_name, project_name, completed_at, ...rest }: ICertificate = data;

    const modifiedResult: ICertificateProps = {
      ...rest,
      studentName: student_name,
      projectName: project_name,
      completedAt: completed_at,
    };
    return { results: modifiedResult };
  };

  return { url, queryFn, queryKey: compact([url, id]) };
};

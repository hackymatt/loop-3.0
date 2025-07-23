import type { Language } from "src/locales/types";
import type { ICertificateProps } from "src/types/certificate";
import type { QueryType, ListQueryResponse } from "src/api/types";

import { compact } from "lodash-es";
import { cookies } from "next/headers";

import { getListData, formatQueryParams } from "src/api/utils";

import { URLS } from "../urls";

const endpoint = URLS.CERTIFICATES;

type ICertificate = {
  id: string;
  student_name: string;
  project_name: string;
  completed_at: string;
};
export const certificatesQuery = (language: Language, query?: QueryType) => {
  const url = endpoint;
  const urlParams = formatQueryParams(query);
  const queryUrl = urlParams ? `${url}?${urlParams}` : url;

  const queryFn = async (): Promise<ListQueryResponse<ICertificateProps[]>> => {
    const { results, records_count, pages_count } = await getListData<ICertificate>(queryUrl, {
      headers: { "Accept-Language": language, Cookie: cookies().toString() },
    });
    const modifiedResults: ICertificateProps[] = (results ?? []).map(
      ({ student_name, project_name, completed_at, ...rest }: ICertificate) => ({
        ...rest,
        studentName: student_name,
        projectName: project_name,
        completedAt: completed_at,
      })
    );
    return { results: modifiedResults, count: records_count, pagesCount: pages_count };
  };

  return { url, queryFn, queryKey: compact([url, urlParams]) };
};

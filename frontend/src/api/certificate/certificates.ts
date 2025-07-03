import type { ICertificateProps } from "src/types/certificate";
import type { QueryType, ListQueryResponse } from "src/api/types";

import { compact } from "lodash-es";
import { useQuery } from "@tanstack/react-query";

import { getListData, formatQueryParams } from "src/api/utils";

import { URLS } from "../urls";

const endpoint = URLS.CERTIFICATES;

type ICertificate = {
  id: string;
  student_name: string;
  course_name: string;
  completed_at: string;
};
export const certificatesQuery = (query?: QueryType) => {
  const url = endpoint;
  const urlParams = formatQueryParams(query);
  const queryUrl = urlParams ? `${url}?${urlParams}` : url;

  const queryFn = async (): Promise<ListQueryResponse<ICertificateProps[]>> => {
    const { results, records_count, pages_count } = await getListData<ICertificate>(queryUrl);
    const modifiedResults: ICertificateProps[] = (results ?? []).map(
      ({ student_name, course_name, completed_at, ...rest }: ICertificate) => ({
        ...rest,
        studentName: student_name,
        courseName: course_name,
        completedAt: completed_at,
      })
    );
    return { results: modifiedResults, count: records_count, pagesCount: pages_count };
  };

  return { url, queryFn, queryKey: compact([url, urlParams]) };
};

export const useCertificates = (query?: QueryType, enabled: boolean = true) => {
  const { queryKey, queryFn } = certificatesQuery(query);
  const { data, ...rest } = useQuery({ queryKey, queryFn, enabled });
  return {
    data: data?.results,
    count: data?.count,
    pageSize: data?.pagesCount,
    ...rest,
  };
};

import type { GetQueryResponse } from "src/api/types";
import type { ICertificateProps } from "src/types/certificate";

import { compact } from "lodash-es";
import { useQuery } from "@tanstack/react-query";

import { getData } from "src/api/utils";

import { URLS } from "../urls";

const endpoint = URLS.CERTIFICATES;

type ICertificate = {
  id: string;
  student_name: string;
  course_name: string;
  completed_at: string;
};

export const certificateQuery = (id: string) => {
  const url = endpoint;
  const queryUrl = `${url}/${id}`;

  const queryFn = async (): Promise<GetQueryResponse<ICertificateProps>> => {
    const { data } = await getData<ICertificate>(queryUrl);
    const { student_name, course_name, completed_at, ...rest }: ICertificate = data;

    const modifiedResult: ICertificateProps = {
      ...rest,
      studentName: student_name,
      courseName: course_name,
      completedAt: completed_at,
    };
    return { results: modifiedResult };
  };

  return { url, queryFn, queryKey: compact([url, id]) };
};

export const useCertificate = (id: string, enabled: boolean = true) => {
  const { queryKey, queryFn } = certificateQuery(id);
  const { data, ...rest } = useQuery({ queryKey, queryFn, enabled });
  return { data: data?.results, ...rest };
};

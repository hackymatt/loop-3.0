import type { AxiosError, AxiosRequestConfig } from "axios";

import { Api } from "./service";

import type { QueryType, GetApiResponse, ListApiResponse } from "./types";

export async function getListData<T>(queryUrl: string, config?: AxiosRequestConfig<any>) {
  let data: ListApiResponse<T> = { results: [], records_count: 0, pages_count: 0 };

  try {
    const response = await Api.get<ListApiResponse<T>>(queryUrl, config);
    ({ data } = response);
  } catch (error) {
    if (
      (error as AxiosError).response &&
      ((error as AxiosError).response?.status === 400 ||
        (error as AxiosError).response?.status === 404)
    ) {
      data = { results: [], records_count: 0, pages_count: 0 };
    }
  }
  return data;
}

export async function getSimpleListData<T>(queryUrl: string, config?: AxiosRequestConfig<any>) {
  let data: T[] = [];

  try {
    const response = await Api.get<T[]>(queryUrl, config);
    ({ data } = response);
  } catch (error) {
    if (
      (error as AxiosError).response &&
      ((error as AxiosError).response?.status === 400 ||
        (error as AxiosError).response?.status === 404)
    ) {
      data = [];
    }
  }
  return data;
}

export async function getData<T>(
  queryUrl: string,
  config?: AxiosRequestConfig<any>
): Promise<GetApiResponse<T>> {
  try {
    const response = await Api.get<T>(queryUrl, config);
    return { data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;

    const fallbackData = axiosError.response?.data as T;

    return {
      data: fallbackData ?? ({} as T),
      error: axiosError,
    };
  }
}
export const formatQueryParams = (query?: QueryType): string => {
  if (!query) return "";

  const params = new URLSearchParams(query);
  return params.toString();
};

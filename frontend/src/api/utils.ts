import type { AxiosError, AxiosRequestConfig } from "axios";

import { ServiceApi } from "./service";

import type { QueryType, GetApiResponse, ListApiResponse } from "./types";

export async function getListData<T>(queryUrl: string, config?: AxiosRequestConfig<any>) {
  let data: ListApiResponse<T> = { results: [], records_count: 0, pages_count: 0 };
  let error: AxiosError | undefined = undefined;

  try {
    const response = await ServiceApi.get<ListApiResponse<T>>(queryUrl, config);
    data = response.data;
  } catch (err) {
    error = err as AxiosError;

    if (error.response && (error.response.status === 400 || error.response.status === 404)) {
      data = { results: [], records_count: 0, pages_count: 0 };
    } else {
      console.error(error);
    }
  }

  return { data, error };
}

export async function getSimpleListData<T>(queryUrl: string, config?: AxiosRequestConfig<any>) {
  let data: T[] = [];
  let error: AxiosError | undefined = undefined;

  try {
    const response = await ServiceApi.get<T[]>(queryUrl, config);
    data = response.data;
  } catch (err) {
    error = err as AxiosError;
    console.error(error);

    if (error.response && (error.response.status === 400 || error.response.status === 404)) {
      data = [];
    }
  }

  return { data, error };
}

export async function getData<T>(
  queryUrl: string,
  config?: AxiosRequestConfig<any>
): Promise<GetApiResponse<T>> {
  try {
    const response = await ServiceApi.get<T>(queryUrl, config);
    return { data: response.data };
  } catch (error) {
    console.error(error);
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

import type { AxiosError } from "axios";

export interface GetApiResponse<T = any> {
  data: T;
  error?: AxiosError;
}

export interface ListApiResponse<T = any> {
  results: T[];
  records_count: number;
  pages_count: number;
}

export interface GetQueryResponse<T = any> {
  results: T;
  error?: AxiosError;
}

export interface ListQueryResponse<T = any> extends GetQueryResponse<T> {
  count: number;
  pagesCount: number;
}

export type QueryType = { [key: string]: string };

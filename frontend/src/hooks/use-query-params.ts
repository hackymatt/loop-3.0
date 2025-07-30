import { useMemo, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function useQueryParams() {
  const searchParams = useSearchParams();
  const params = useMemo(() => new URLSearchParams(searchParams), [searchParams]);

  const pathname = usePathname();
  const { replace } = useRouter();

  const setQueryParam = useCallback(
    (name: string, value?: string) => {
      const currentParams = params.toString();
      params.set(name, value ? value.toString() : "");
      const newParams = params.toString();
      if (currentParams !== newParams) {
        replace(`${pathname}?${params.toString()}`);
      }
    },
    [params, pathname, replace]
  );

  const removeQueryParam = useCallback(
    (name: string) => {
      params.delete(name);
      replace(`${pathname}?${params.toString()}`);
    },
    [params, pathname, replace]
  );

  const getQueryParam = useCallback((name: string) => params.get(name), [params]);

  const getQueryParams = useCallback(() => Object.fromEntries(params), [params]);

  const handleChange = useCallback(
    (name: string, value: string) => {
      if (value) {
        setQueryParam(name, value);
      } else {
        removeQueryParam(name);
      }
    },
    [removeQueryParam, setQueryParam]
  );

  const query = useMemo(() => getQueryParams(), [getQueryParams]);

  return { getQueryParam, setQueryParam, removeQueryParam, getQueryParams, handleChange, query };
}

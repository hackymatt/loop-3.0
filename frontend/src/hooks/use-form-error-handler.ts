import type { ErrorOption, UseFormReturn } from "react-hook-form";

import { flatten } from "flat";
import { AxiosError } from "axios";
import { useCallback } from "react";
import { compact, isArray, isEmpty, isObject, mapValues, partition } from "lodash-es";

const GENERIC_ERROR_MESSAGE = "Przepraszamy, coś poszło nie tak. Spróbuj ponownie." as const;

type ErrorOptions = { [key: string]: ErrorOption };

const deepMap = (objectOrArray: unknown, mapFn: (item: unknown) => unknown): unknown => {
  if (isArray(objectOrArray)) {
    return objectOrArray.map((item) => deepMap(mapFn(item), mapFn));
  }
  if (isObject(objectOrArray)) {
    return mapValues(objectOrArray, (value) => deepMap(mapFn(value), mapFn));
  }
  return objectOrArray;
};

const parseDjangoError = (error: AxiosError): ErrorOptions => {
  if (!error.response?.data) {
    throw new Error();
  }

  const withJoinedMessages = deepMap(error.response.data, (item) => {
    if (isArray(item) && typeof item[0] === "string") {
      return item.join(" ");
    }
    return item;
  });

  const flatErrors = flatten(withJoinedMessages) as object;

  const entries = Object.entries(flatErrors).map(([key, value]) => {
    if (isArray(value) && typeof value[0] === "string") {
      return [key, { message: value.join(" ") }];
    }
    if (typeof value === "string") {
      return [key, { message: value }];
    }
    if (!isEmpty(value)) {
      return ["root", { message: GENERIC_ERROR_MESSAGE }];
    }
    return undefined;
  });
  return Object.fromEntries(compact(entries));
};

export const useFormErrorHandler = (
  form: UseFormReturn<any, any>,
  keyMapping?: { [key: string]: string }
) => {
  const { setError, control } = form;

  const setErrors = useCallback(
    (errors: ErrorOptions) => {
      const errorsAsArray = Object.entries(errors);
      const [knownErrors] = partition(errorsAsArray, ([key]) => control.getFieldState(key));
      const knownErrorsAsObject = Object.fromEntries(knownErrors);

      Object.entries(knownErrorsAsObject).forEach(([key, error]) => {
        setError(keyMapping?.[key] ?? key, error);
      });
    },
    [control, keyMapping, setError]
  );

  const handleFormError = useCallback(
    (error: unknown) => {
      if (error instanceof AxiosError && error.response?.data) {
        const fieldErrors = parseDjangoError(error);
        setErrors(fieldErrors);
      } else if (error instanceof AxiosError) {
        const fieldErrors = { root: { message: error.message } };
        setErrors(fieldErrors);
      } else if (error instanceof Error) {
        const fieldErrors = { root: { message: GENERIC_ERROR_MESSAGE } };
        setErrors(fieldErrors);
      } else {
        throw error;
      }
    },
    [setErrors]
  );

  return handleFormError;
};

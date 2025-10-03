import type { IPersonalDataProps } from "src/types/user";

import { compact } from "lodash-es";
import { cookies } from "next/headers";

import { URLS } from "../urls";
import { getData } from "../utils";

import type { GetQueryResponse } from "../types";

const endpoint = URLS.DATA;

type IPersonalData = {
  email: string;
  first_name: string | null;
  last_name: string | null;
  image: string | null;
  street_address: string | null;
  zip_code: string | null;
  city: string | null;
  country: string | null;
};

export const dataQuery = () => {
  const url = endpoint;
  const queryUrl = url;

  const queryFn = async (): Promise<GetQueryResponse<IPersonalDataProps>> => {
    const { data } = await getData<IPersonalData>(queryUrl, {
      headers: { Cookie: cookies().toString() },
    });

    const { first_name, last_name, image, street_address, zip_code, ...rest } = data;

    const modifiedResult: IPersonalDataProps = {
      ...rest,
      firstName: first_name,
      lastName: last_name,
      avatarUrl: image,
      streetAddress: street_address,
      zipCode: zip_code,
    };

    return { results: modifiedResult };
  };

  return { url, queryFn, queryKey: compact([url]) };
};

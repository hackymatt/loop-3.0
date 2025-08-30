import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.CUSTOMER_PORTAL_LINK;

type ICustomerPortalLink = {};

type ICustomerPortalLinkReturn = {
  data: { url: string };
  status: number;
};

export const useCreateCustomerPortalLink = () =>
  useMutation<ICustomerPortalLinkReturn, AxiosError, ICustomerPortalLink>(async () => {
    const result = await Api.post(endpoint);
    return {
      status: result.status,
      data: result.data,
    };
  });

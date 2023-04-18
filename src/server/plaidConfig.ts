import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  LinkTokenCreateRequest,
  CountryCode,
  Products,
} from "plaid";
import { env } from "../env/client.mjs";

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": env.NEXT_PUBLIC_PLAID_CLIENT_ID,
      "PLAID-SECRET": env.NEXT_PUBLIC_PLAID_CLIENT_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

export const createPlaidRequestConfig = (userId: string) => {
  const request: LinkTokenCreateRequest = {
    user: {
      // This should correspond to a unique id for the current user.
      client_user_id: userId,
    },
    client_name: "Plaid Test App",
    products: [Products.Auth],
    language: "en",
    // webhook: "",
    redirect_uri: "http://localhost:3000/oauth",
    country_codes: [CountryCode.Us],
  };
  return request;
};

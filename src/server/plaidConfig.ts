import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  LinkTokenCreateRequest,
  CountryCode,
  Products,
} from "plaid";

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": "6431cba87d50780013ff9d8f",
      "PLAID-SECRET": "082ece4b36c17f12018037196d4320",
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

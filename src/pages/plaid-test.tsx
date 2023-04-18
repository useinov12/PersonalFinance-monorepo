import { api } from "../utils/api";

import React, { useCallback, useEffect } from "react";
import {
  usePlaidLink,
  PlaidLinkOnSuccessMetadata,
  PlaidLinkOnExitMetadata,
  PlaidLinkError,
  PlaidLinkOptionsWithLinkToken,
  PlaidLinkOnEventMetadata,
  PlaidLinkStableEvent,
  PlaidLinkOnSuccess,
  PlaidLinkOnEvent,
} from "react-plaid-link";

export default function PlaidTestPage() {
  const linkToken = api.plaid.createLinkToken.useQuery(undefined, {
    refetchOnWindowFocus: false,
    enabled: false, // disable this query from automatically running
  });

  const banks = api.plaid.getConnectedBanks.useQuery(undefined, {
    refetchOnWindowFocus: false,
    enabled: false, // disable this query from automatically running
  });

  function handleFetchToken() {
    linkToken.refetch().catch((e) => console.error(e));
  }

  function handleGetBanks() {
    banks.refetch().catch((e) => console.error(e));
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-black text-gray-100">
      <button
        className="my-2 w-fit rounded border px-2"
        onClick={handleFetchToken}
      >
        {linkToken.isFetching ? "...loading" : "Create Link Token"}
      </button>
      {linkToken.data && linkToken.isSuccess && (
        <>
          <p className="text-center text-sm">
            {JSON.stringify(linkToken.data)}
          </p>
          <Link linkToken={linkToken.data.link_token} />
        </>
      )}

      <button
        className="my-2 w-fit rounded border px-2"
        onClick={handleGetBanks}
      >
        Get connected banks ID's
      </button>
      {banks.data && banks.isSuccess && (
        <p className="text-center text-sm">
          {JSON.stringify(banks.data.connectedBanks)}
        </p>
      )}
    </div>
  );
}

interface LinkProps {
  linkToken: string;
}

// hard typed because PlaidLinkOnSuccess caused Typescript error
// type onSuccessCB = (public_token: string, metadata: PlaidLinkOnSuccessMetadata) => void

function Link(props: LinkProps) {
  const mutation = api.plaid.exchangeTokens.useMutation();

  const onSuccess = useCallback<PlaidLinkOnSuccess>((public_token, metadata) => {
    // send public-token to the server to exchange it for access_token and save in DB
    mutation.mutate({ publicToken: public_token });
  }, []);
  const onEvent = useCallback<PlaidLinkOnEvent>((public_token, metadata) => {
    console.log("event", public_token, metadata);
  }, []);

  const config: PlaidLinkOptionsWithLinkToken = {
    token: props.linkToken,
    // receivedRedirectUri: env.NEXT_PUBLIC_PLAID_REDIRECT_URI_DEV, // only for link re-initialization
    onSuccess,
    onEvent,
  };

  function hanldeOpenPlaidUI() {
    plaidUI.open();
  }

  const plaidUI = usePlaidLink(config);
  return (
    <button
      className="my-2 w-fit rounded border px-2"
      onClick={hanldeOpenPlaidUI}
      disabled={!plaidUI.ready}
    >
      Open Plaid UI
    </button>
  );
}

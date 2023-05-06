import { api } from "../utils/api";

import React, { ReactNode, useCallback } from "react";
import {
  usePlaidLink,
  PlaidLinkOptionsWithLinkToken,
  PlaidLinkOnSuccess,
  PlaidLinkOnEvent,
} from "react-plaid-link";

import { signIn, signOut, useSession } from "next-auth/react";

export default function PlaidTestPage() {
  const { data: sessionData } = useSession();
  return (
    <div 
      className="flex h-screen w-screen flex-col items-center 
      justify-center gap-y-2 bg-gray-800 text-gray-100"
    >
      <Button
        onClick={sessionData ? () =>  signOut() : () => signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </Button>
      {sessionData && <PlaidFlowShowcase />}
    </div>
  );
}

function PlaidFlowShowcase() {
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
    <>
      <Button onClick={handleFetchToken}>
        {linkToken.isFetching ? "...loading" : "Create Link Token"}
      </Button>
      {linkToken.data && linkToken.isSuccess && (
        <>
          <p className="text-center text-md">
            {JSON.stringify(linkToken.data)}
          </p>
          <PliadLink linkToken={linkToken.data.link_token} />
        </>
      )}

      <Button onClick={handleGetBanks}>Get connected banks ID's</Button>
      {banks.data && banks.isSuccess && (
        <p className="text-center text-md">
          {JSON.stringify(banks.data.connectedBanks)}
        </p>
      )}
    </>
  );
}

interface LinkProps {
  linkToken: string;
}

function PliadLink(props: LinkProps) {
  const mutation = api.plaid.exchangeTokens.useMutation();

  const onSuccess = useCallback<PlaidLinkOnSuccess>(
    (public_token, metadata) => {
      // send public-token to the server to exchange it for access_token and save in DB
      mutation.mutate({ publicToken: public_token });
    },
    []
  );
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
    <Button
      onClick={hanldeOpenPlaidUI}
      // disabled={!plaidUI.ready}
    >
      Open Plaid UI
    </Button>
  );
}

function Button({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg bg-white/10 px-6 py-2 font-semibold text-white no-underline transition hover:bg-white/20"
    >
      {children}
    </button>
  );
}

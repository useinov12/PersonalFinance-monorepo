import Image from "next/image";
import React, { ReactNode, useCallback, useState } from "react";
import clsx from "clsx";
import Button from "../ui/Button";

import {
  usePlaidLink,
  PlaidLinkOptionsWithLinkToken,
  PlaidLinkOnSuccess,
  PlaidLinkOnEvent,
} from "react-plaid-link";

import { signIn, signOut, useSession } from "next-auth/react";
import { api } from "../utils/api";
import { plaidClient } from "../server/plaidConfig";

import { BsGithub } from "react-icons/bs";
import { RiSunFill } from "react-icons/ri";
import { HiMoon } from "react-icons/hi";
import Link from "next/link";
import { useTheme } from "./_app";

export default function PlaidFlowPage() {
  const { theme } = useTheme();
  return (
    <main
      className={clsx(
        "h-screen w-fit",
        "flex overflow-x-auto",
        " overflow-y-hidden",
        "bg-gray-100  text-gray-800 ",
        theme === "light"
          ? "bg-gray-100  text-gray-800 "
          : "bg-gray-900  text-gray-100 "
      )}
    >
      <section
        className={clsx(
          "w-[90%] max-w-6xl bg-gray-300/80",
          "py-4 px-10 2xl:px-24",
          "flex flex-col items-start gap-2"
        )}
      >
        <div className="flex w-full items-end justify-between">
          <div className="inline-flex items-end  gap-2 px-2">
            <Link
              href={"https://github.com/useinov12/PersonalFinance-monorepo"}
              target="_blank"
            >
              <BsGithub className="scale-100 text-3xl transition-all duration-150 hover:scale-[1.1]" />
            </Link>
            <h1 className="text-xl font-medium">
              Plaid API in Next.JS using T3 stack
            </h1>
          </div>
          <ThemeSwitch />
        </div>
        <div className="flex h-full w-full max-w-5xl items-start justify-center gap-5 py-5">
          <PlaidImageSchema />
          <section className="flex h-full w-3/5 flex-col items-start gap-y-3">
            <SignIn />
            <SwitchEnvironment />
            <LinkTokenBlock />
            <ProductRequest />
          </section>
        </div>
      </section>
      <div
        className={clsx(
          "h-screen w-screen bg-gray-200",
          "p-4"
          // "bg-red-500/50"
        )}
      >
        <h1 className="px-2 text-xl font-medium">
          A glossary of Plaid terminology
        </h1>
        <div className="flex h-full w-3/5 max-w-4xl flex-col justify-start gap-y-3">
          <div className="my-1 h-32 py-5 px-2">
            <p className="w-full text-sm font-medium leading-[1.2] 2xl:text-lg 2xl:leading-[1.15]">
              An <code>access_token</code> is a token used to make API requests
              related to a specific Item. You will typically obtain an{" "}
              <code>access_token</code> by calling{" "}
              <strong>/item/public_token/exchange</strong>
            </p>
          </div>
          <Block className="h-32">
            <h2 className="text-lg font-bold">API playground</h2>
            <p className="w-full text-sm font-medium leading-[1.2] 2xl:text-lg 2xl:leading-[1.15]">
              Once you have made all previous steps for given Item(Bank
              Instance) and saved <code>access_token</code> - you can make
              requests to the PlaidClient
            </p>
          </Block>
        </div>
      </div>
    </main>
  );
}

function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  function handleThemeSwitch() {
    setTheme((p) => (p === "dark" ? "light" : "dark"));
  }
  return (
    <button onClick={handleThemeSwitch} className="text-3xl">
      {theme === "light" ? <HiMoon /> : <RiSunFill />}
    </button>
  );
}

function PlaidImageSchema() {
  const { theme } = useTheme();
  return (
    <div
      className={clsx(
        "h-fit w-2/5  2xl:w-2/5",
        "my-1 w-full px-6 py-3",
        "flex flex-col items-start gap-y-3",
        theme === "light" ? "" : "rounded-xl bg-gray-300 shadow-lg"
      )}
    >
      {[0, 0, 0, 0, 0].map((img, i) => (
        <Image
          src={`/link-token-row-${i + 1}.webp`}
          width={450}
          height={150}
          alt={`plaid-img-${i}`}
        />
      ))}
    </div>
  );
}

function SignIn() {
  const { data: sessionData } = useSession();

  function handleSignIn() {
    sessionData ? signOut() : signIn();
  }

  return (
    <div className=" flex  w-full items-start  xl:w-full 2xl:w-full">
      <p className="text-md w-2/3 font-medium leading-[1.2] 2xl:text-lg">
        The Plaid flow begins when your user wants to connect their bank account
        to your app
      </p>

      <div className="flex w-1/3  items-end justify-end gap-2 px-1 ">
        <Button onClick={handleSignIn} variant="light">
          {sessionData ? "Sign out" : "Sign in"}
        </Button>
        {sessionData ? (
          sessionData.user.image && (
            <Image
              src={sessionData.user.image}
              alt="user"
              width={66}
              height={66}
              className="rounded-2xl shadow-md"
            />
          )
        ) : (
          <span className="h-16 w-16 rounded-2xl border border-gray-700/20 bg-gray-100 shadow-md" />
        )}
      </div>
    </div>
  );
}

function SwitchEnvironment() {
  const [currentEnvironment, setCurrentEnvironment] = useState(
    plaidClient.currentEnvironment
  );

  const handleEnvironmentChange = (
    environment: "sandbox" | "development" | "production"
  ) => {
    plaidClient.setConfigEnvironment(environment);
    setCurrentEnvironment(environment);
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => handleEnvironmentChange("sandbox")}
        className="py-1"
        variant={currentEnvironment === "sandbox" ? "green" : "light"}
      >
        sandbox
      </Button>
      <Button
        onClick={() => handleEnvironmentChange("development")}
        className="py-1"
        variant={currentEnvironment === "development" ? "green" : "light"}
      >
        development
      </Button>
    </div>
  );
}

function LinkTokenBlock() {
  const session = useSession();
  const linkToken = api.plaid.createLinkToken.useQuery(undefined, {
    refetchOnWindowFocus: false,
    enabled: false, // disable this query from automatically running
  });
  function handleFetchToken() {
    linkToken.refetch().catch((e) => console.error(e));
  }
  return (
    <>
      <Block className="h-44">
        <p className="w-2/3 text-sm font-medium leading-[1.2] 2xl:w-4/5 2xl:text-lg">
          1. Call <strong>/link/token/create</strong> to create a link_token and
          pass the temporary token to your app's client <br />
        </p>
        <div className="flex w-full items-start gap-4 px-2">
          <Button
            onClick={handleFetchToken}
            disabled={!session.data ? true : false}
          >
            Create Link Token
          </Button>
          {session.status === "authenticated" &&
            linkToken.isFetching &&
            "...fetching"}
          {linkToken.data && linkToken.isSuccess && !linkToken.isFetching && (
            <>
              <code className="w-4/5 break-words text-sm">
                {/* {JSON.stringify(linkToken.data)} */}
                <div>"expiration" : {linkToken.data.expiration}</div>
                <div>"link_token" : {linkToken.data.link_token}</div>
                <div>"request_id" : {linkToken.data.request_id}</div>

                {/* "expiration":"2023-04-22T22:51:37Z", <br />
                  "link_token":"link-sandbox-53b50685-0 <br />{" "}
                  dc3-4db9-bd4e-e5b5f13cbc79",
                  <br />
                  "request_id":"AbUcba2WxQl7KTP" */}
              </code>
            </>
          )}
        </div>
      </Block>
      <Block className="h-38">
        <p className=" w-2/3 text-sm font-medium leading-[1.2] 2xl:w-4/5 2xl:text-lg">
          2. Use the <code>link_token</code> to open Pliad UI for your user. In
          the onSuccess callback, PlaidLink will provide a temporary{" "}
          <code>public_token</code>
        </p>

        <div className="flex w-full items-center gap-3 px-2">
          <span className="w-4/5 text-[0.75rem]"></span>

          <PlaidLink
            linkToken={linkToken.data ? linkToken.data.link_token : undefined}
          />
        </div>

        <p className=" w-2/3 text-sm font-medium leading-[1.2] 2xl:w-4/5 2xl:text-lg">
          3. Call <strong>/item/public_token/exchange</strong> to exchange the
          public_token for a permanent <code>access_token</code> and{" "}
          <code>item_id</code> for the new Item
        </p>
      </Block>
    </>
  );
}

function ProductRequest() {
  const session = useSession();
  const banks = api.plaid.getConnectedBanks.useQuery(undefined, {
    refetchOnWindowFocus: false,
    enabled: false, // disable this query from automatically running
  });
  function handleGetBanks() {
    banks.refetch().catch((e) => console.error(e));
  }
  return (
    <Block className="h-44">
      <p className="w-2/3 text-sm font-medium leading-[1.2] 2xl:w-4/5 2xl:text-lg">
        4. Store the access_token and use it to make product requests for your
        user's Item. Do not send
      </p>
      <div className="flex w-full items-start gap-3 px-2">
        <Button
          onClick={handleGetBanks}
          disabled={!session.data ? true : false}
        >
          Get connected banks from your DB
        </Button>
        {banks.data && banks.isSuccess && (
          <code className="w-3/5 break-words text-sm">
            {banks.data.connectedBanks.map(
              (bank, i) =>
                i < 3 && (
                  <div className="truncate hover:text-clip" key={i}>{`id#${
                    i + 1
                  }:${bank}`}</div>
                )
            )}
            {/* ["x8DzxW5Kogfr33E44K5xuee5jDvlGAunyV87V",
          "ylMLj5XpNEUZygJdX8DECJgvjjzb7Wuy1DJdB",
          "bdPoGZLB3LUlq9gjW1RKUowvG5jRX5um1b5zy"] */}
          </code>
        )}
      </div>
    </Block>
  );
}

function Block({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { theme } = useTheme();
  return (
    <div
      className={clsx(
        "w-full  p-4 2xl:w-full",
        "flex flex-col items-start gap-y-3",
        "rounded-xl border  shadow-lg  ",
        theme === "light"
          ? "border-gray-700/20 bg-gray-100"
          : "border-gray-600/20 bg-gray-700",
        className
      )}
    >
      {children}
    </div>
  );
}

interface PlaidLinkProps {
  linkToken?: string;
}

function PlaidLink(props: PlaidLinkProps) {
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
    token: props.linkToken ? props.linkToken : null,
    // receivedRedirectUri: env.NEXT_PUBLIC_PLAID_REDIRECT_URI_DEV, // only for link re-initialization
    onSuccess,
    onEvent,
  };
  const plaidUI = usePlaidLink(config);

  function hanldeOpenPlaidUI() {
    plaidUI.open();
  }

  return (
    <Button onClick={hanldeOpenPlaidUI} disabled={!plaidUI.ready}>
      Open Plaid UI
    </Button>
  );
}

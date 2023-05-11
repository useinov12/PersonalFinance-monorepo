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
import { RiSunFill, RiArrowDropRightLine } from "react-icons/ri";
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
      <PlaidSchema />
      <Showcase />
      <Playground />
    </main>
  );
}

function Showcase() {
  return (
    <div
      className={clsx(
        "py-7 px-5",
        "h-full w-[40vw] max-w-6xl 2xl:w-[30vw]",
        "flex flex-col items-start gap-y-3"
      )}
    >
      <div className=" inline-flex w-full items-start justify-between">
        <Link
          href={"https://github.com/useinov12/PersonalFinance-monorepo"}
          target="_blank"
        >
          <div className="group inline-flex items-center justify-center gap-2 pt-1 transition-all hover:text-blue-500">
            <BsGithub className="text-3xl" />
            <h1 className="text-xl font-medium">
              Plaid API in Next.JS using T3 stack
            </h1>
            <RiArrowDropRightLine
              className="-translate-x-2 scale-0  text-4xl transition-all 
               group-hover:visible group-hover:-translate-x-1 group-hover:scale-[1.4]"
            />
          </div>
        </Link>
        <ThemeSwitch />
      </div>
      <h2 className="h-28 w-full font-medium leading-[1.2]">
        Below is live example of Plaid API flow <br />
        Follow steps and explore code in the repository
      </h2>
      <SignIn />
      <SwitchEnvironment />
      <LinkTokenBlock />
      <ProductRequest />
    </div>
  );
}

function PlaidSchema() {
  const { theme } = useTheme();
  return (
    <section
      className={clsx(
        "flex h-full w-[30vw] flex-col justify-between px-4 py-2 text-gray-800 2xl:w-[20vw]",
        theme === "light" ? "" : " bg-gray-100 shadow-inner"
      )}
    >
      <div className="px-0">
        <Image
          src="/Plaid_(company)-Logo.wine.png"
          width={120}
          height={90}
          alt="plaid-logo"
        />
        <div className="px-4">
          <p className="pb-2 text-md font-medium leading-[1.1] 2xl:text-lg">
            Verify bank accounts, analyze categorized transaction data, and
            verify assets for lending.
          </p>
          <p className="text-md font-medium leading-[1.1] 2xl:text-lg">
            Make it easy for users to connect their bank accounts to your app
            using Plaid's APIs.
          </p>
          <Link href={"https://plaid.com/docs/"} target="_blank">
            <div className="group my-1 inline-flex items-center justify-center hover:text-blue-500">
              <p className="text-md font-medium leading-[1.2] 2xl:text-lg">
                Official documents
              </p>
              <RiArrowDropRightLine
                className="scale-100 text-3xl transition-all 
              duration-100 group-hover:translate-x-2 group-hover:scale-[1.2]"
              />
            </div>
          </Link>
        </div>
      </div>
      <div className="px-7 py-5">
        {[0, 0, 0, 0, 0].map((img, i) => (
          <Image
            src={`/link-token-row-${i + 1}.webp`}
            width={300}
            height={150}
            alt={`plaid-img-${i}`}
          />
        ))}
      </div>
    </section>
  );
}

function Playground() {
  const { theme } = useTheme();
  // type Glossary = "access_token" | "Item" | "link_token" | "public_token"
  const [currentWord, setWord] = useState<string>("access_token");
  return (
    <div
      className={clsx(
        "h-full w-[60vw]  px-5 py-5 2xl:w-[70vw]",
        theme === "light"
          ? "border-l border-gray-300 bg-gray-200 text-gray-800 shadow-xl"
          : "text-gray-100 "
      )}
    >
      <div className="h-20" />
      <h1 className="px-2 text-xl font-medium">
        A glossary of Plaid terminology
      </h1>
      <div className="flex h-full w-3/5 max-w-4xl flex-col justify-start gap-y-3">
        <div className="h-32 px-3">
          <ul className="my-2 flex flex-wrap gap-x-3 font-semibold">
            {["access_token", "Item", "link_token", "public_token"].map(
              (word) => (
                <button
                  onClick={() => setWord(word)}
                  key={word}
                  className={clsx(
                    "cursor-pointer",
                    "border-b-2 border-transparent",
                    "hover:text-blue-500",
                    "font-medium",
                    word === currentWord
                      ? " border-blue-600  text-blue-600"
                      : ""
                  )}
                >
                  {word}
                </button>
              )
            )}
          </ul>
          {currentWord === "access_token" && (
            <p className="w-full text-sm font-medium leading-[1.2] 2xl:text-lg 2xl:leading-[1.15]">
              An <code>access_token</code> is a token used to make API requests
              related to a specific Item. You will typically obtain an{" "}
              <code>access_token</code> by calling{" "}
              <strong>/item/public_token/exchange</strong>
            </p>
          )}
          {currentWord === "Item" && (
            <p className="w-full text-sm font-medium leading-[1.2] 2xl:text-lg 2xl:leading-[1.15]">
              Item
            </p>
          )}
          {currentWord === "link_token" && (
            <p className="w-full text-sm font-medium leading-[1.2] 2xl:text-lg 2xl:leading-[1.15]">
              link_token
            </p>
          )}
          {currentWord === "public_token" && (
            <p className="w-full text-sm font-medium leading-[1.2] 2xl:text-lg 2xl:leading-[1.15]">
              public_token
            </p>
          )}
        </div>
        <div className="h-32 px-3">
          <h2 className="text-lg font-bold">API playground</h2>
          <p className="w-full text-sm font-medium leading-[1.2] 2xl:text-lg 2xl:leading-[1.15]">
            Once you have made all previous steps for given Item(Bank Instance)
            and saved <code>access_token</code> - you can make requests to the
            PlaidClient
          </p>
        </div>
      </div>
    </div>
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

function SignIn() {
  const { theme } = useTheme();
  const { data: sessionData } = useSession();

  function handleSignIn() {
    sessionData ? signOut() : signIn();
  }

  return (
    <div className=" flex w-full items-start  xl:w-full 2xl:w-full">
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
              width={77}
              height={77}
              className="rounded-2xl shadow-md"
            />
          )
        ) : (
          <span
            className={clsx(
              "h-20 w-20 rounded-2xl border",
              theme === "light"
                ? "border-gray-700/20 bg-gray-100 shadow-md"
                : "border-gray-300/20 bg-gray-700 shadow-md"
            )}
          />
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
      <Block className="h-56">
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
          2. Use the <code>link_token</code> to open Plaid UI for your user. In
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
        user's Item.
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

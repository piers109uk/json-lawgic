"use client"
import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"

if (typeof window !== "undefined") {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    console.warn("NEXT_PUBLIC_POSTHOG_KEY is not set")
  } else {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: "always", // or 'always' to create profiles for anonymous users as well
    })
  }
}

type Props = Readonly<{ children: React.ReactNode }>

export function CSPostHogProvider({ children }: Props) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}

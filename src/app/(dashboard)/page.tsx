import { auth } from "@/lib/auth";
import HomeView, { HomeViewErrorState, HomeViewLoadingState } from "@/modules/home/ui/views/home-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.home.getDashboardData.queryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<HomeViewLoadingState />}>
        <ErrorBoundary fallback={<HomeViewErrorState />}>
          <HomeView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  )
}

export default Page;

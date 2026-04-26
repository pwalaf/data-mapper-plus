import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@/i18n/I18nProvider";
import { setBaseUrl } from "@workspace/api-client-react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Students from "@/pages/Students";
import Sessions from "@/pages/Sessions";
import Transactions from "@/pages/Transactions";
import Finances from "@/pages/Finances";
import Goals from "@/pages/Goals";
import SchemaViewer from "@/pages/SchemaViewer";
import Settings from "@/pages/Settings";
import { installOfflineFetch } from "@/lib/offline";

// Configure API client to use deployed backend
setBaseUrl("https://atlas-backend-u4gh.onrender.com");

const ONE_DAY = 1000 * 60 * 60 * 24;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: ONE_DAY * 7,
      networkMode: "offlineFirst",
      retry: (failureCount, error) => {
        if (typeof navigator !== "undefined" && !navigator.onLine) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      networkMode: "offlineFirst",
      retry: 0,
    },
  },
});

const persister =
  typeof window === "undefined"
    ? null
    : createSyncStoragePersister({
        storage: window.localStorage,
        key: "atlas.queryCache.v1",
        throttleTime: 1000,
      });

// Wire offline fetch interceptor: queues mutations when offline,
// replays them on reconnect, then invalidates all queries so the UI
// reflects the freshly-synced data.
installOfflineFetch({
  onSync: () => {
    queryClient.invalidateQueries();
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/students" component={Students} />
      <Route path="/sessions" component={Sessions} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/finances" component={Finances} />
      <Route path="/goals" component={Goals} />
      <Route path="/products" component={Products} />
      <Route path="/schema" component={SchemaViewer} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <I18nProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister: persister!,
            maxAge: ONE_DAY * 7,
            buster: "v1",
          }}
          onSuccess={() => {
            // Once cache is hydrated from disk, trigger a refresh online.
            if (typeof navigator !== "undefined" && navigator.onLine) {
              queryClient.invalidateQueries();
            }
          }}
        >
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </PersistQueryClientProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;

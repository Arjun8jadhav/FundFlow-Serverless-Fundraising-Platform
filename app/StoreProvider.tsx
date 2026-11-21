"use client";

import { startTransition, useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import { makeStore, type AppStore } from "./lib/store";

type StoreProviderProps = {
  children: ReactNode;
  fallback: ReactNode;
};

export default function StoreProvider({
  children,
  fallback,
}: StoreProviderProps) {
  const [store, setStore] = useState<AppStore | null>(null);

  useEffect(() => {
    const clientStore = makeStore();
    const cleanupListeners = setupListeners(clientStore.dispatch);
    startTransition(() => setStore(clientStore));
    return cleanupListeners;
  }, []);

  if (!store) return fallback;

  return <Provider store={store}>{children}</Provider>;
}

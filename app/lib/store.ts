import { configureStore } from "@reduxjs/toolkit";
import { campaignApi } from "./campaignApi";

export const makeStore = () =>
  configureStore({
    reducer: {
      [campaignApi.reducerPath]: campaignApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(campaignApi.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

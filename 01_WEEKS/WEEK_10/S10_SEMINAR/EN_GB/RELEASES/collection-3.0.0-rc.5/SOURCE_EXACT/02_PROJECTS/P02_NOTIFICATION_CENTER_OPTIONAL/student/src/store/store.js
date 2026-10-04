import { configureStore } from "@reduxjs/toolkit";
import { notificationsReducer } from "./notifications-slice.js";

export function createAppStore({ notificationsApi }) {
  return configureStore({
    reducer: { notifications: notificationsReducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: { extraArgument: { notificationsApi } } })
  });
}

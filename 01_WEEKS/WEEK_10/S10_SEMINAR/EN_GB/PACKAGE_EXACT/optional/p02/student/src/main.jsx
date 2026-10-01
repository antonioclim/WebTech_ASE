import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { createNotificationsApi } from "./notifications-api.js";
import { createAppStore } from "./store/store.js";
import "./styles.css";
const store = createAppStore({ notificationsApi: createNotificationsApi() });
createRoot(document.querySelector("#root")).render(<App store={store} />);

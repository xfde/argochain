import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducers";
import { api } from "../src/features/apiSlice";
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export default store;

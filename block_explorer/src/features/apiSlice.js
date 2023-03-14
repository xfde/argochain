import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    // Fill in your own server starting URL here
    baseUrl: "http://localhost:3001/api",
  }),
  endpoints: (build) => ({
    // A query endpoint with no arguments
    getBlocks: build.query({
      query: () => "/blocks",
    }),
  }),
});

export const { useGetBlocksQuery } = api;

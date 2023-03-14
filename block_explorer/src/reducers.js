import { combineReducers } from "redux";
import blocksReducer from "./features/blocksSlice";
import { api } from "./features/apiSlice";
const rootReducer = combineReducers({
  blocks: blocksReducer,
  [api.reducerPath]: api.reducer,
});

export default rootReducer;

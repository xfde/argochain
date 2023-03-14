import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const blocksSlice = createSlice({
  name: "blocks",
  initialState,
  reducers: {
    // Give case reducers meaningful past-tense "event"-style names
    blockAdded(state, action) {
      const { id, text } = action.payload;
      // "Mutating" update syntax thanks to Immer, and no `return` needed
      state.blocks.push({
        id,
        text,
        completed: false,
      });
    },
    blockToggled(state, action) {
      // Look for the specific nested object to update.
      // In this case, `action.payload` is the default field in the action,
      // and can hold the `id` value - no need for `action.id` separately
      const matchingBlock = state.blocks.find(
        (block) => block.id === action.payload
      );

      if (matchingBlock) {
        // Can directly "mutate" the nested object
        matchingBlock.completed = !matchingBlock.completed;
      }
    },
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { blockAdded, blockToggled } = blocksSlice.actions;

// Export the slice reducer as the default export
export default blocksSlice.reducer;

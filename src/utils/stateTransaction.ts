import { runInAction } from "mobx";

// NOTE: https://github.com/EmuDeck/MetaDeck/blob/main/src/ts/util.ts#L3
export function stateTransaction(block: () => void) {
  // @ts-expect-error Add types later
  const prev: boolean = window.__mobxGlobals.allowStateChanges;
  // @ts-expect-error Add types later
  window.__mobxGlobals.allowStateChanges = true;
  runInAction(block);
  // @ts-expect-error Add types later
  window.__mobxGlobals.allowStateChanges = prev;
}

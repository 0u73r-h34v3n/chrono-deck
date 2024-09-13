import waitUntil from "async-wait-until";

// NOTE: https://github.com/EmuDeck/MetaDeck/blob/main/src/ts/LibraryInitializer.ts#L55
export async function waitForServicesInitialized(): Promise<boolean> {
  type WindowEx = Window & {
    App?: { WaitForServicesInitialized?: () => Promise<boolean> };
  };

  await waitUntil(
    () => (window as WindowEx).App?.WaitForServicesInitialized != null,
    { timeout: 5000, intervalBetweenAttempts: 200 },
  );

  return (
    (await (window as WindowEx).App?.WaitForServicesInitialized?.()) ?? false
  );
}

import type { Mountable } from "./system";

export type Events =
  | { type: "Unmount"; createdAt: number; mounts: Mountable[] }
  | { type: "Mount"; createdAt: number; mounts: Mountable[] };

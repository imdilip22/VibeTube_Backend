// ─── Shared Service Result ────────────────────────────────────────────────────
// Used by all service layers to return a typed result to the controller.
export type ServiceResult<T = unknown> = {
  success: boolean;
  data: T | null;
  message: string;
  statusCode: number;
};

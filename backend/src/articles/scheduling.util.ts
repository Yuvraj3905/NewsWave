// Pure logic for resolving publish state from a scheduled_at input.
// Extracted so it can be unit-checked without a DB (see scheduling.util.check.ts).
export interface PublishStateInput {
  scheduled_at?: string | Date | null;
  published?: boolean;
}

export interface PublishState {
  published: boolean;
  scheduled_at: Date | null;
  // Display date to stamp when scheduling; null means "use the caller's default".
  published_at: Date | null;
}

export function resolvePublishState(
  input: PublishStateInput,
  nowMs: number,
): PublishState {
  const scheduledAt = input.scheduled_at ? new Date(input.scheduled_at) : null;
  const isFutureSchedule = !!scheduledAt && scheduledAt.getTime() > nowMs;
  if (isFutureSchedule) {
    // Hidden until the scheduled time; stamp published_at to it so ordering is
    // correct the moment it goes live.
    return { published: false, scheduled_at: scheduledAt, published_at: scheduledAt };
  }
  return {
    published: input.published ?? true,
    scheduled_at: null,
    published_at: null,
  };
}

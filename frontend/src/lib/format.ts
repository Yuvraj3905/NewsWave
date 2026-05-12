export function formatIST(iso: string): string {
  try {
    const date = new Date(iso);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return iso;
  }
}

export function formatDateShort(iso: string): string {
  try {
    const date = new Date(iso);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
    }).format(date);
  } catch {
    return iso;
  }
}

export function formatTimeShort(iso: string): string {
  try {
    const date = new Date(iso);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return iso;
  }
}

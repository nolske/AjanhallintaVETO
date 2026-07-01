export function getSafeRedirectPath(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string" || value.length === 0) {
    return "/dashboard";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  if (value.startsWith("/login") || value.startsWith("/register")) {
    return "/dashboard";
  }

  return value;
}

export function withStatus(path: string, kind: "error" | "status", code: string) {
  const url = new URL(path, "http://local.app");
  url.searchParams.set(kind, code);
  return `${url.pathname}${url.search}`;
}

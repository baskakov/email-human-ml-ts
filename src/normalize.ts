export function splitEmail(email: string): [local: string, domain: string] {
  const value = email.trim().toLowerCase();
  const at = value.lastIndexOf("@");
  if (at === -1) return [value, ""];
  return [value.slice(0, at), value.slice(at + 1)];
}

export function tokenize(local: string): string[] {
  return local.split(/[._-]/).filter((t) => t !== "");
}

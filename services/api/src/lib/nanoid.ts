import { nanoid } from "nanoid";

export function generateCode(): string {
  return nanoid(8);
}

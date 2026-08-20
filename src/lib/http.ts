import { AuthError, ForbiddenError, NotFoundError } from "@/lib/auth";
import { NextResponse } from "next/server";

export function jsonError(error: unknown) {
  if (error instanceof AuthError || error instanceof ForbiddenError || error instanceof NotFoundError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
}

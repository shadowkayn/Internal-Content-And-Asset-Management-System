import { NextResponse } from "next/server";

export function success(data: any = null, message: string = "success") {
  return NextResponse.json({
    code: 200,
    data,
    message,
  });
}

export function error(message: string = "error", code: number = 500) {
  return NextResponse.json({
    code,
    message,
  });
}

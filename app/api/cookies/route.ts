import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { name, value, options } = await request.json();

  const response = NextResponse.json({ success: true });
  response.cookies.set(name, value, options);

  return response;
}

export async function DELETE(request: Request) {
  const { name, options } = await request.json();

  const response = NextResponse.json({ success: true });
  response.cookies.set(name, "", options);

  return response;
}

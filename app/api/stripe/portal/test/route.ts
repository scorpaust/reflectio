import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "API route está funcionando",
    timestamp: new Date().toISOString(),
  });
}

export async function POST() {
  return NextResponse.json({
    message: "POST API route está funcionando",
    timestamp: new Date().toISOString(),
  });
}

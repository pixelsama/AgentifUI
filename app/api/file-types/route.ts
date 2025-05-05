import { NextResponse } from "next/server"
import fileTypes from "@presets/file-types.json"

export async function GET() {
  return NextResponse.json(fileTypes)
} 
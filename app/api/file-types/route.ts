import { NextResponse } from "next/server"
import fileTypes from "@templates/file-types.json"

export async function GET() {
  return NextResponse.json(fileTypes)
} 
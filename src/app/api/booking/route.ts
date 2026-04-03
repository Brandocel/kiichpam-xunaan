// src/app/api/booking/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    return NextResponse.json({
      success: true,
      message: "Reserva recibida (modo desarrollo)",
      data: body,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error al procesar la reserva" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "API de reservas funcionando",
  });
}
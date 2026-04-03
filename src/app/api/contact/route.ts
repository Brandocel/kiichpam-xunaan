// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Aquí puedes agregar lógica real más adelante (enviar email, guardar en BD, etc.)
    console.log('Contacto recibido:', body);

    return NextResponse.json({
      success: true,
      message: "Mensaje recibido correctamente. Te contactaremos pronto.",
    });
  } catch (error) {
    console.error('Error en contacto:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Error al enviar el mensaje. Inténtalo de nuevo." 
      },
      { status: 500 }
    );
  }
}

// Opcional: GET para probar que la ruta funciona
export async function GET() {
  return NextResponse.json({
    message: "API de contacto funcionando correctamente",
  });
}
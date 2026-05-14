import { env, isGeminiEnvConfigured } from '../../config/env';
import {
  EntradaGeneracionTryOn,
  ProveedorTryOn,
  ResultadoGeneracionTryOn,
} from './tiposProveedorTryOn';

type ImagenBase64Preparada = {
  base64: string;
  mimeType: string;
};

type GeminiInlineData = {
  data?: string;
  mimeType?: string;
  mime_type?: string;
};

type GeminiPart = {
  text?: string;
  inlineData?: GeminiInlineData;
  inline_data?: GeminiInlineData;
};

type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: GeminiPart[];
    };
  }[];
  error?: {
    message?: string;
  };
};

export const proveedorRealTryOn: ProveedorTryOn = {
  nombre: 'ProveedorRealTryOn',

  async generarResultado(
    entrada: EntradaGeneracionTryOn
  ): Promise<ResultadoGeneracionTryOn> {
    const errorConfiguracion = validarConfiguracionProveedorReal();

    if (errorConfiguracion) {
      return {
        estado: 'fallido',
        mensaje: errorConfiguracion,
      };
    }

    const errorEntrada = validarEntradaProveedorReal(entrada);

    if (errorEntrada) {
      return {
        estado: 'fallido',
        mensaje: errorEntrada,
      };
    }

    try {
      const imagenBase = await obtenerImagenBase64DesdeUrl(
        entrada.imagenBaseUrl
      );

      const imagenPrenda = await obtenerImagenBase64DesdeUrl(
        entrada.imagenPrendaUrl as string
      );

      const respuestaGemini = await llamarGeminiTryOn(
        entrada,
        imagenBase,
        imagenPrenda
      );

      const imagenGenerada = extraerImagenGenerada(respuestaGemini);

      if (!imagenGenerada) {
        return {
          estado: 'fallido',
          mensaje:
            'Gemini no ha devuelto una imagen generada. Revisa el prompt, las imágenes de entrada o la respuesta del proveedor.',
        };
      }

      return {
        estado: 'completado',
        imagenBase64Resultado: imagenGenerada.base64,
        mimeTypeResultado: imagenGenerada.mimeType,
        mensaje: 'Resultado try-on generado correctamente con Gemini.',
      };
    } catch (error) {
      return {
        estado: 'fallido',
        mensaje:
          error instanceof Error
            ? error.message
            : 'Error inesperado al generar el try-on con Gemini.',
      };
    }
  },
};

function validarConfiguracionProveedorReal(): string | null {
  if (!isGeminiEnvConfigured) {
    return 'La API key de Gemini no está configurada. Revisa EXPO_PUBLIC_GEMINI_API_KEY.';
  }

  if (!env.geminiTryOnModel.trim()) {
    return 'No se ha configurado el modelo de Gemini para try-on.';
  }

  return null;
}

function validarEntradaProveedorReal(
  entrada: EntradaGeneracionTryOn
): string | null {
  if (!entrada.idPrenda.trim()) {
    return 'No se ha recibido el identificador de la prenda.';
  }

  if (!entrada.nombrePrenda.trim()) {
    return 'No se ha recibido el nombre de la prenda.';
  }

  if (!entrada.imagenBaseUrl.trim()) {
    return 'No se ha recibido la URL pública de la imagen base.';
  }

  if (!entrada.rutaStorageImagenBase.trim()) {
    return 'No se ha recibido la ruta Storage de la imagen base.';
  }

  if (!entrada.imagenPrendaUrl?.trim()) {
    return 'No se ha recibido la URL pública de la imagen de la prenda.';
  }

  if (!entrada.rutaStorageImagenPrenda?.trim()) {
    return 'No se ha recibido la ruta Storage de la imagen de la prenda.';
  }

  return null;
}

async function obtenerImagenBase64DesdeUrl(
  url: string
): Promise<ImagenBase64Preparada> {
  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error(
      `No se ha podido descargar una imagen de entrada. HTTP ${respuesta.status}.`
    );
  }

  const mimeType =
    respuesta.headers.get('content-type')?.split(';')[0] ?? 'image/jpeg';

  const blob = await respuesta.blob();
  const dataUrl = await leerBlobComoDataUrl(blob);
  const separador = dataUrl.indexOf(',');

  if (separador === -1) {
    throw new Error('No se ha podido convertir la imagen descargada a base64.');
  }

  return {
    base64: dataUrl.slice(separador + 1),
    mimeType,
  };
}

function leerBlobComoDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();

    lector.onloadend = () => {
      if (typeof lector.result === 'string') {
        resolve(lector.result);
      } else {
        reject(new Error('No se ha podido leer la imagen como Data URL.'));
      }
    };

    lector.onerror = () => {
      reject(new Error('Error al leer la imagen descargada.'));
    };

    lector.readAsDataURL(blob);
  });
}

async function llamarGeminiTryOn(
  entrada: EntradaGeneracionTryOn,
  imagenBase: ImagenBase64Preparada,
  imagenPrenda: ImagenBase64Preparada
): Promise<GeminiResponse> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiTryOnModel}:generateContent`;

  const respuesta = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': env.geminiApiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: construirPromptTryOn(entrada),
            },
            {
              inline_data: {
                mime_type: imagenBase.mimeType,
                data: imagenBase.base64,
              },
            },
            {
              inline_data: {
                mime_type: imagenPrenda.mimeType,
                data: imagenPrenda.base64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    }),
  });

  const textoRespuesta = await respuesta.text();

  if (!respuesta.ok) {
    throw new Error(
      `Gemini ha devuelto un error HTTP ${respuesta.status}: ${textoRespuesta}`
    );
  }

  try {
    const json = JSON.parse(textoRespuesta) as GeminiResponse;

    if (json.error?.message) {
      throw new Error(`Gemini ha devuelto un error: ${json.error.message}`);
    }

    return json;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('No se ha podido interpretar la respuesta JSON de Gemini.');
    }

    throw error;
  }
}

function construirPromptTryOn(entrada: EntradaGeneracionTryOn): string {
  return `
You are generating a realistic virtual try-on image.

Use the first image as the base model/person.
Use the second image as the clothing garment reference.

Task:
Dress the person from the first image with the garment from the second image.

Strict requirements:
- Preserve the person's identity, face, body shape, pose and proportions.
- Preserve the original camera angle, framing and background as much as possible.
- Apply the selected garment naturally on the body.
- Preserve the garment's color, fabric texture, silhouette and visible design details.
- Do not change the person's face, hair, hands or body anatomy.
- Do not create a collage.
- Do not place the garment next to the person.
- Generate one realistic full-body try-on result.
- Avoid text, labels, logos or watermarks unless they already exist in the garment image.

Garment name: ${entrada.nombrePrenda}
`.trim();
}

function extraerImagenGenerada(
  respuesta: GeminiResponse
): ImagenBase64Preparada | null {
  const partes = respuesta.candidates?.[0]?.content?.parts ?? [];

  for (const parte of partes) {
    const inlineData = parte.inlineData ?? parte.inline_data;

    if (inlineData?.data) {
      return {
        base64: inlineData.data,
        mimeType: inlineData.mimeType ?? inlineData.mime_type ?? 'image/png',
      };
    }
  }

  return null;
}
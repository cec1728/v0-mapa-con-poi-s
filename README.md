# Aplicación de Seguridad Perimetral

Esta aplicación permite analizar la seguridad perimetral de oficinas, identificando puntos de interés en un radio de 200 metros y generando informes detallados de riesgo.

## Características

- Dashboard para gestionar oficinas
- Mapa interactivo con Google Maps
- Selección de ubicación y análisis de perímetro
- Identificación de puntos de interés (POIs)
- Generación de informes de seguridad
- Análisis de riesgo

## Requisitos

- Node.js 18 o superior
- NPM o Yarn

## Instalación

1. Clona este repositorio:
\`\`\`bash
git clone https://github.com/tu-usuario/seguridad-perimetral.git
cd seguridad-perimetral
\`\`\`

2. Instala las dependencias:
\`\`\`bash
npm install
# o
yarn install
\`\`\`

3. Configura las variables de entorno:
Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

\`\`\`
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=TU_API_KEY_DE_GOOGLE_MAPS
NEXT_PUBLIC_API_BASE_URL=URL_DE_TU_API
\`\`\`

4. Inicia el servidor de desarrollo:
\`\`\`bash
npm run dev
# o
yarn dev
\`\`\`

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Uso

1. En la pantalla principal, crea una nueva oficina con la información básica.
2. Navega al mapa para seleccionar la ubicación exacta de la oficina.
3. Carga o agrega manualmente los puntos de interés (POIs) en el perímetro.
4. Genera el informe de seguridad con el análisis de riesgo.
5. Imprime o exporta el informe según sea necesario.

## Tecnologías utilizadas

- Next.js 14
- TypeScript
- TailwindCSS
- Google Maps API
- ShadcnUI

## Licencia

MIT

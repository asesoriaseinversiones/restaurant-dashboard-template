# Dashboard Ejecutivo - Restaurante Panama

Aplicacion web profesional para control financiero y operativo del proyecto de restaurante en Panama.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- Datos desde Google Sheets publicados como CSV (fetch en servidor, sin Google Cloud)
- Preparado para desplegar en Vercel

## Arquitectura

Estructura orientada a desacoplar UI y origen de datos:

- `app/`: rutas y paginas (Server Components por defecto)
- `components/`: UI reutilizable
- `lib/google/public-csv.ts`: descarga de CSV publico (solo servidor)
- `lib/parsers/csv.ts`: parser CSV robusto (RFC 4180)
- `lib/data/source.ts`: interfaz comun `ProyectoDataSource`
- `lib/data/public-csv-source.ts`: implementacion leyendo cuatro CSV
- `lib/data/postgres-source.ts`: placeholder para migracion futura
- `lib/data/dashboard-service.ts`: reglas de negocio/KPIs
- `lib/parsers/`: parseo de numeros, fechas, booleanos y porcentajes
- `types/`: contratos de dominio
- `config/env.ts`: validacion de variables de entorno

## Hojas de origen (mismas pestañas, cada una con su URL CSV)

- `Base_Transacciones` (fuente maestra)
- `Presupuesto`
- `Hitos_Obra`
- `Catalogos`

En Google Sheets: publica cada pestaña o usa enlaces de exportacion CSV publicos y asigna una URL por variable.

## Variables de entorno

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Completa (cada una es una URL `https` distinta al CSV de esa hoja):

- `GOOGLE_SHEET_BASE_TRANSACCIONES_CSV`
- `GOOGLE_SHEET_PRESUPUESTO_CSV`
- `GOOGLE_SHEET_HITOS_OBRA_CSV`
- `GOOGLE_SHEET_CATALOGOS_CSV`

Ejemplo de formato de exportacion:

`https://docs.google.com/spreadsheets/d/<ID>/export?format=csv&gid=<GID>`

Si una URL falla, el servidor registra un mensaje claro en consola con prefijo `[Dashboard CSV]`.

## Instalacion

> Requiere Node.js 20+ y npm 10+

```bash
npm install
npm run dev
```

Abrir: [http://localhost:3000](http://localhost:3000)

## Comandos utiles

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```

## Endpoints API (server-side)

- `GET /api/dashboard`
- `GET /api/transacciones`
- `GET /api/presupuesto`
- `GET /api/hitos`

## Modulos implementados

1. Dashboard ejecutivo
2. Transacciones
3. Presupuesto
4. Hitos de obra
5. Configuracion tecnica

## Despliegue en Vercel

1. Subir proyecto a GitHub
2. Importar repositorio en Vercel
3. Configurar las cuatro variables CSV
4. Deploy

La descarga de CSV ocurre solo en el servidor; no se incrustan secretos en el cliente.

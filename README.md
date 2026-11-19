This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Internacionalización (i18n)

La app soporta **es** (por defecto), **en** y **fr** con rutas por sub-ruta (`/es`, `/en`, `/fr`).

- `proxy.ts`: si la URL no trae idioma, redirige usando **cookie `NEXT_LOCALE` → `Accept-Language` → idioma por defecto**, y guarda la cookie (1 año).
- Selector de idioma en el navbar (`components/language-switcher.tsx`): guarda la cookie y mantiene la ruta y los filtros actuales.
- `i18n/config.ts`: lista de idiomas, idioma por defecto y metadatos.
- `i18n/dictionaries/<idioma>.json`: textos de la interfaz (un archivo por idioma).
- `i18n/get-dictionary.ts`: carga de diccionarios. En Server Components usa `getDictionary()` / `getLocale()`; en Client Components `useI18n()`.

> Solo se traduce la interfaz. El contenido de cada propiedad (título, descripción, ubicación, badges…) viene de Supabase y se muestra tal cual. Los valores de filtro (`House`, `FOR SALE`, `Swimming Pool`…) se mantienen en inglés en URL y base de datos; solo cambia la etiqueta visible (`propertyTypes`, `listingTypes`, `amenities` en los diccionarios). Si aparece un valor sin traducción, se muestra el valor original.

### Agregar un idioma

Ejemplo: alemán (`de`).

1. Copia `i18n/dictionaries/es.json` a `i18n/dictionaries/de.json` y traduce **los valores** (no las claves). Para plurales usa los sufijos `_one` / `_other` (y `_few`, `_many`, etc. si el idioma lo requiere).
2. En `i18n/config.ts` añade `"de"` a `locales` y su entrada en `localeMeta`:
   ```ts
   export const locales = ["es", "en", "fr", "de"] as const;
   // ...
   de: { label: "Deutsch", flag: "🇩🇪", intl: "de" },
   ```
3. En `i18n/get-dictionary.ts` registra el loader:
   ```ts
   de: () => import("./dictionaries/de.json").then((m) => m.default),
   ```
4. Ejecuta `pnpm exec tsc --noEmit`: TypeScript falla si falta el loader o si al JSON le faltan claves.

El selector de idioma, el proxy, `generateStaticParams` y los `hreflang` se actualizan automáticamente.

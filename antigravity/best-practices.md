# Buenas Prácticas, Recomendaciones e Ideas para Aplicaciones de Bienes Raíces en Next.js (Luxe Estate)

Este documento reúne los estándares técnicos, de arquitectura, rendimiento, SEO, experiencia de usuario (UX/UI) e ideas de producto que se deben aplicar y buscar en una plataforma inmobiliaria moderna construida con **Next.js (App Router)**, **React**, **Tailwind CSS** y **Supabase**.

---

## 1. Arquitectura y Renderizado en Next.js (App Router)

- **React Server Components (RSC) por defecto:**
  - Renderizar las páginas de catálogo, listados destacados, fichas técnicas de propiedades y secciones informativas directamente en el servidor para enviar la menor cantidad posible de JavaScript al navegador.
  - Realizar las consultas a Supabase directamente desde Server Components o mediante funciones de acceso a datos en `lib/` ejecutadas en el servidor.
- **Client Components quirúrgicos (`'use client'`):**
  - Limitar el uso de `'use client'` exclusivamente a los componentes hoja (*leaf components*) que requieran estado en el navegador o eventos del DOM: galerías/lightboxes de fotos, barras de filtros interactivos, botones de "Guardar en favoritos", mapas interactivos y calculadoras hipotecarias.
- **APIs dinámicas asíncronas (Next.js 15/16+):**
  - Tratar siempre `params`, `searchParams`, `cookies()` y `headers()` como promesas (`await params`, `await searchParams`) tanto en `page.tsx` como en `layout.tsx` y `generateMetadata`.
- **Estrategia de Caché y Revalidación Inteligente:**
  - Utilizar **ISR (Incremental Static Regeneration)** o caché basada en etiquetas (`revalidateTag` / `revalidatePath`) para las fichas de propiedades, de modo que carguen de forma instantánea pero se actualicen inmediatamente cuando un agente modifique el precio, las fotos o el estado (*En Venta*, *Reservada*, *Vendida*).
- **Streaming con `<Suspense>` y Esqueletos de Carga (`loading.tsx`):**
  - Envolver secciones independientes (ej. *"Propiedades similares en la zona"*, *"Estadísticas del vecindario"* o resultados de búsqueda) en límites de `<Suspense>` con *skeletons* que respeten las proporciones reales de las tarjetas para evitar bloqueos en la carga inicial.
- **Organización Modular de Carpetas:**
  - Separar componentes globales reutilizables (`components/ui/`, `components/navbar.tsx`) de los componentes específicos de cada vista (`components/home/`, `components/properties/`).
  - Centralizar las consultas y transformaciones de datos en `lib/` (ej. `lib/properties.ts`) y los contratos de tipos en `types/` (ej. `types/property.ts`).

---

## 2. Optimización de Imágenes y Multimedia (Crítico en Real Estate)

En bienes raíces, las fotografías venden la propiedad, pero también son la causa #1 de lentitud si no se optimizan:

- **Uso estricto del componente `<Image>` de `next/image`:**
  - Nunca usar etiquetas `<img>` estándar para fotos de propiedades. Aprovechar la optimización automática a formatos modernos (**AVIF** y **WebP**).
- **Definición precisa del atributo `sizes`:**
  - En grillas de tarjetas (ej. 1 columna en móvil, 2 en tablet, 3 en desktop), especificar `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"` para evitar que un teléfono descargue imágenes de escritorio de 2000px.
- **Priorización del LCP (*Largest Contentful Paint*):**
  - Añadir la propiedad `priority` (o `preload`) **únicamente** a la imagen principal (*Hero* de la portada o la primera fotografía en la vista de detalle de una propiedad).
  - Mantener el resto de las imágenes de la galería y del listado con carga diferida (*lazy loading* por defecto).
- **Prevención de Saltos Visuales (CLS - *Cumulative Layout Shift*):**
  - Definir siempre relaciones de aspecto fijas (`aspect-[4/3]`, `aspect-[16/10]` o dimensiones explícitas) en los contenedores de fotos y utilizar `placeholder="blur"` con un `blurDataURL` o un color de fondo suave acorde a la paleta (`#D9ECC8` *Hint of Green* o `#EEF6F6` *Clear Day*).
- **Seguridad en Dominios Remotos:**
  - Configurar explícitamente `images.remotePatterns` en `next.config.ts` restringiendo los orígenes únicamente al bucket de Supabase Storage o CDN autorizado.

---

## 3. Búsqueda, Filtrado y Gestión de Estado en la URL

- **La URL como única fuente de verdad (`searchParams`):**
  - Todos los filtros activos (ubicación, operación venta/renta, rango de precio `minPrice`/`maxPrice`, número de habitaciones, baños, tipo de inmueble, ordenamiento y página actual) deben reflejarse en los parámetros de la URL (`?city=marbella&minBeds=3&sort=price_asc`).
  - **Beneficios clave:** Permite compartir búsquedas exactas por WhatsApp/correo, guardar marcadores, navegar con los botones "Atrás/Adelante" del navegador y mejorar la indexación.
- **Actualizaciones no bloqueantes con `useTransition` y *Debounce*:**
  - Aplicar *debounce* (300ms–400ms) en campos de texto libre o *sliders* de precios antes de actualizar la URL con `router.replace` o `router.push(..., { scroll: false })`.
  - Combinar con `useTransition` para mostrar un indicador visual sutil de actualización sin congelar la interfaz mientras el servidor filtra los resultados.
- **Paginación Eficiente y Conteo Total:**
  - Evitar traer cientos de propiedades de golpe. Implementar paginación en el servidor (con `.range(from, to)` y `{ count: 'exact' }` en Supabase) o botón de *"Cargar más propiedades"* manteniendo el rendimiento constante.
- **Estados Vacíos (*Empty States*) Útiles:**
  - Cuando una combinación de filtros no arroje resultados, mostrar un estado vacío elegante con un botón claro para *"Limpiar filtros"* y sugerencias de propiedades destacadas cercanas.

---

## 4. SEO Inmobiliario y Descubribilidad Orgánica

- **Metadatos Dinámicos por Propiedad (`generateMetadata`):**
  - Generar dinámicamente `title`, `description`, `alternates.canonical` y etiquetas **Open Graph / Twitter Cards** en cada página `/properties/[slug]`.
  - Incluir en el título y descripción: tipo de propiedad, número de habitaciones, ubicación/zona y precio formateado (ej. *"Villa Contemporánea de 4 Hab. en Sierra Blanca, Marbella | $2,450,000 - Luxe Estate"*).
  - Configurar imágenes Open Graph de alta calidad para que al compartir un enlace en WhatsApp, iMessage o redes sociales se visualice una tarjeta atractiva con la foto principal de la casa.
- **Datos Estructurados con JSON-LD (`Schema.org`):**
  - Inyectar un bloque `<script type="application/ld+json">` en las páginas de detalle utilizando los esquemas `RealEstateListing`, `SingleFamilyResidence` / `Apartment`, `Offer` (precio, moneda `USD`/`EUR`, disponibilidad) y `BreadcrumbList`. Esto habilita *Rich Snippets* en Google.
- **URLs Semánticas y Amigables (*Slugs*):**
  - Preferir rutas descriptivas (`/properties/villa-horizonte-marbella`) sobre identificadores opacos (`/properties/98a7f-12b3`), o combinar slug + ID corto para garantizar unicidad y legibilidad.
- **Sitemap y Robots Dinámicos (`app/sitemap.ts` y `app/robots.ts`):**
  - Generar automáticamente el `sitemap.xml` consultando las propiedades activas y las páginas de categorías/ciudades para asegurar que los motores de búsqueda indexen nuevos inmuebles apenas se publiquen.

---

## 5. Base de Datos, Seguridad y Rendimiento (Supabase)

- **Proyección Selectiva de Columnas (Evitar `SELECT *` en listados):**
  - En las vistas de catálogo o grillas, consultar únicamente los campos necesarios para renderizar la tarjeta (`id, slug, title, price, location, bedrooms, bathrooms, area, main_image, status, is_featured`), dejando las descripciones largas, galerías completas y coordenadas detalladas para la vista de detalle.
- **Indexación en PostgreSQL:**
  - Crear índices en Supabase para las columnas utilizadas frecuentemente en filtros y ordenamientos: `status`, `price`, `city`/`location`, `property_type`, `bedrooms` y `created_at`.
  - Utilizar búsqueda de texto completo (*Full-Text Search* con `tsvector` o la extensión `pg_trgm`) para búsquedas rápidas por nombre de proyecto, colonia o palabras clave.
- **Seguridad a Nivel de Filas (RLS - *Row Level Security*):**
  - Activar RLS en todas las tablas de Supabase.
  - Permitir `SELECT` público (`anon`) únicamente en propiedades cuyo estado sea activo/publicado, ocultando borradores o propiedades dadas de baja.
  - Restringir operaciones `INSERT`, `UPDATE` y `DELETE` exclusivamente a roles autenticados y autorizados.
- **Validación en el Servidor para Captación de Leads:**
  - Procesar los formularios de contacto (*"Agendar visita"*, *"Solicitar más información"*) mediante **Server Actions** o **Route Handlers**, validando estrictamente los datos de entrada en el servidor (nombre, email, teléfono, mensaje) e implementando medidas anti-spam (*honeypot* o *rate limiting*).

---

## 6. Buenas Prácticas de UX/UI y Conversión en Luxe Estate

- **Fidelidad al Sistema de Diseño y Paleta de Colores:**
  - **Nordic (`#19322F`):** Textos principales, encabezados, barra de navegación y elementos de máxima jerarquía.
  - **Mosque (`#006655`):** Botones de acción primaria (CTAs), enlaces activos, badges de énfasis e íconos destacados.
  - **Hint of Green (`#D9ECC8`):** Fondos suaves para tarjetas destacadas, chips de características o secciones de alto valor.
  - **Clear Day (`#EEF6F6`):** Fondo general de la aplicación para transmitir amplitud, limpieza y lujo minimalista.
  - **Tipografía:** Uso consistente de **SF Pro Display** con jerarquía clara de pesos y tamaños.
- **Anatomía de una Tarjeta de Propiedad (`PropertyCard`) Efectiva:**
  - **Escaneabilidad en 3 segundos:** El usuario debe identificar de inmediato:
    1. Fotografía atractiva con badge de estado (*Destacada*, *Nueva*, *En Venta* / *Renta*).
    2. Precio claramente formateado según la divisa local (usando `Intl.NumberFormat`).
    3. Título de la propiedad y ubicación (Zona / Ciudad).
    4. Los 3–4 indicadores clave con íconos limpios: Habitaciones, Baños, Área construida ($\text{m}^2$ o $\text{ sq ft}$) y Estacionamientos.
- **Fricción Cero en la Conversión (Generación de Leads):**
  - En la página de detalle de la propiedad, mantener una **tarjeta de contacto fija (*sticky sidebar* en desktop y barra inferior fija en móvil)** que muestre el precio, la foto/nombre del agente inmobiliario, un formulario corto de contacto y un botón directo a **WhatsApp** con un mensaje prellenado que incluya el nombre y enlace de la propiedad.
- **Accesibilidad (a11y) y Diseño Responsivo (*Mobile-First*):**
  - Más del 65% del tráfico inmobiliario proviene de dispositivos móviles: asegurar áreas táctiles mínimas de `44x44px` en botones de galería y filtros, soporte de gestos (*swipe*) en carruseles y contraste WCAG AA/AAA entre texto (`#19322F`) y fondos (`#EEF6F6` / `#D9ECC8`).

---

## 7. Recomendaciones e Ideas de Valor Agregado (Diferenciadores de Producto)

Para que **Luxe Estate** destaque frente a portales inmobiliarios tradicionales, se recomiendan las siguientes funcionalidades e ideas:

- **Calculadora Hipotecaria y de Gastos en Tiempo Real:**
  - Incluir en la página de detalle un módulo interactivo donde el comprador ajuste el porcentaje de enganche, plazo en años y tasa de interés estimada para visualizar al instante su pago mensual aproximado (incluyendo impuestos y mantenimiento).
- **Vista Dividida con Mapa Interactivo Sincronizado:**
  - Permitir alternar o dividir la pantalla entre la cuadrícula de propiedades y un mapa estilizado (con pines que muestren el precio).
  - Al pasar el cursor (*hover*) sobre una tarjeta de propiedad, resaltar su pin en el mapa; al mover o hacer zoom en el mapa, ofrecer la opción *"Buscar en esta zona"*.
- **Comparador de Propiedades Lado a Lado:**
  - Permitir al usuario seleccionar hasta 3 propiedades y abrir una tabla comparativa limpia que contraste: precio total, precio por $\text{m}^2$, dimensiones, amenidades (alberca, seguridad 24/7, terraza, gimnasio), año de construcción y ubicación.
- **Guía de Estilo de Vida y Contexto del Vecindario:**
  - Enriquecer la ficha de cada propiedad con datos de su entorno: puntos de interés cercanos (colegios internacionales, campos de golf, marinas, hospitales, restaurantes), tiempos estimados de traslado y nivel de tranquilidad/caminabilidad.
- **Planos Arquitectónicos Interactivos y Tours 360°:**
  - Integrar pestañas en la galería multimedia para alternar entre **Fotografías**, **Tour Virtual 360° / Video Walkthrough** y **Planos de Planta (Floor Plans)**, esenciales para compradores de propiedades de lujo o inversores extranjeros que compran a distancia.
- **Selector de Divisa y Unidades de Medida:**
  - En el mercado inmobiliario de lujo es muy común el comprador internacional: ofrecer un selector rápido en el header o en la ficha para visualizar precios en `USD`, `EUR` o `MXN` y áreas en metros cuadrados ($\text{m}^2$) o pies cuadrados ($\text{sq ft}$).
- **Búsqueda en Lenguaje Natural / Asistente IA (Futuro / Fase Avanzada):**
  - Aprovechar `pgvector` en Supabase para permitir búsquedas semánticas del estilo: *"Casa moderna con vista al mar, jardín amplio para perros y oficina iluminada"* además de los filtros tradicionales.
- **Favoritos sin Registro Inicial (LocalStorage + Sincronización Opcional):**
  - Permitir que el visitante guarde sus propiedades favoritas inmediatamente usando `localStorage` para no interrumpir su navegación con un muro de inicio de sesión, y ofrecerle después compartir su lista de favoritos mediante un enlace único o guardarla en su cuenta.
- **Historial de Precios y Potencial de Inversión:**
  - Mostrar indicadores de valor como el **Precio por $\text{m}^2$** comparado con el promedio de la zona y la rentabilidad estimada en caso de alquiler (*ROI / Cap Rate estimado*).


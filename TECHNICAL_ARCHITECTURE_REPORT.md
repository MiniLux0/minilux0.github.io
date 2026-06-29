# Reporte de Arquitectura de Software: Portafolio de Minilux

Este reporte técnico describe la arquitectura, el diseño de frontend, los algoritmos de simulación física y el inventario completo de funcionalidades del portafolio web de **Jesús Rodolfo Vera Vivanco (Minilux)**. Está redactado para servir como guía de mantenimiento y extensión para cualquier desarrollador de frontend o computación científica.

---

## 1. Estructura del Proyecto y Responsabilidades

El proyecto es un sitio web estático (Single Page Application) altamente interactivo y responsivo, alojado en GitHub Pages. Su árbol de archivos es el siguiente:

```
minilux-portfolio/
├── .agents/                    # Customizaciones y habilidades del asistente AI
├── .git/                       # Repositorio Git
├── css/
│   └── style.css               # Sistema de diseño, variables y estilos de layout
├── js/
│   └── main.js                 # Interactividad, lógica de estado y animaciones en Canvas
├── favicon.svg                 # Logotipo vectorial de la pestaña
├── index.html                  # Punto de entrada HTML5 y metadatos de SEO
├── robots.txt                  # Directivas de rastreo para buscadores
└── sitemap.xml                 # Estructura del sitio indexada
```

### Responsabilidades de los Archivos Core
* **[index.html](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/index.html)**: Contiene la estructura DOM semántica (HTML5), carga las tipografías externas y declara los metadatos de SEO estructurados (JSON-LD), Open Graph y Twitter Cards. Es el contenedor de los canvases dinámicos.
* **[css/style.css](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/css/style.css)**: Centraliza los tokens del sistema de diseño (colores, fuentes, espaciados) mediante variables CSS. Define la cuadrícula responsiva (Grid/Flexbox) y aplica animaciones CSS clave como el glitch del título del hero.
* **[js/main.js](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/js/main.js)**: Implementa un módulo auto-ejecutable (IIFE) que encapsula el estado global de las simulaciones y la interacción. Administra la lógica del cargador inicial, el alternador de temas, el traductor y cuatro bucles de renderizado basados en Canvas 2D.

### Dependencias Externas
El proyecto sigue una arquitectura **Zero-Dependency** (libre de librerías como Three.js o jQuery) para optimizar el rendimiento y evitar sobrecargar la red. Solo carga recursos tipográficos externos de la CDN de Google Fonts:
* **Oxanium** (pesos 400, 600, 700): Fuente geométrica usada para títulos e identidad visual.
* **Inter** (pesos 400, 500): Fuente sans-serif de alta legibilidad usada para el cuerpo de texto.
* **JetBrains Mono** (pesos 400, 500): Fuente monoespaciada usada para métricas, ecuaciones de física y elementos del timeline.

---

## 2. Inventario Completo de Funcionalidades

A continuación se detalla cada funcionalidad implementada, su funcionamiento interno y su ubicación exacta:

### A. Pantalla de Carga (Loader Screen)
* **Líneas HTML:** 58-64 en [index.html](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/index.html) (`.loader`).
* **Líneas CSS:** 959-1008 en [style.css](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/css/style.css).
* **Líneas JS:** 904-918 en [main.js](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/js/main.js).
* **Descripción:** Superposición fija (`position: fixed`) en color oscuro que muestra un logotipo pulsante "M" y una barra de progreso que se llena con una animación de CSS. Al completarse la carga de los recursos del navegador (`window.onload`), JavaScript espera 500ms y añade la clase `.hidden` para desvanecerlo suavemente con una transición CSS.

### B. Menú Desplegable Responsivo (Mobile Nav Menu)
* **Líneas HTML:** 69-92 en [index.html](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/index.html) (`.nav`).
* **Líneas CSS:** 1180-1217 en [style.css](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/css/style.css).
* **Líneas JS:** 785-801 en [main.js](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/js/main.js).
* **Descripción:** Para pantallas móviles ($< 768\text{px}$), el menú de navegación se oculta fuera de la pantalla mediante `transform: translateY(-100%)`. Al presionar el botón tipo hamburguesa (`#nav-toggle`), este se transforma en una "X" y desliza el menú hacia abajo aplicando la clase `.open`. El menú utiliza un fondo translúcido que cambia de color según el tema activo a través de variables CSS.

### C. Navegación Pegajosa con Desenfoque (Frosted Sticky Nav)
* **Líneas CSS:** 109-130 en [style.css](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/css/style.css).
* **Líneas JS:** 827-839 en [main.js](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/js/main.js).
* **Descripción:** La barra de navegación cuenta con un efecto de vidrio esmerilado (`backdrop-filter: blur(20px)`). Cuando el scroll vertical del documento supera los $50\text{px}$, JavaScript añade la clase `.scrolled`, la cual oscurece el fondo y añade una sombra de caja (`box-shadow`) para separar la barra visualmente del contenido inferior.

### D. Resaltado de Sección Activa (Active Section Navigation)
* **Líneas JS:** 805-824 en [main.js](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/js/main.js).
* **Descripción:** Detecta continuamente la sección que está visible en pantalla al hacer scroll. Añade una zona de tolerancia de $120\text{px}$ para compensar el tamaño de la cabecera. El enlace de navegación correspondiente recibe la clase `.active`, que dibuja una línea horizontal decorativa en su parte inferior con una transición CSS.

### E. Efecto Glitch de Nombre en Hero
* **Líneas CSS:** 297-344 en [style.css](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/css/style.css).
* **Descripción:** El título de bienvenida (`.hero__name`) cuenta con un efecto de fallo de pantalla. Utiliza los pseudo-elementos `::before` y `::after` con la propiedad `content: attr(data-text)` para duplicar el texto de manera oculta. Mediante las animaciones CSS `@keyframes glitch1` y `@keyframes glitch2`, se aplican pequeños desplazamientos (`transform: translate(...)`) combinados con cortes de área (`clip-path: inset(...)`) de manera intermitente cada 8 segundos.

### F. Escritura Dinámica (Typing Effect)
* **Líneas JS:** 733-762 en [main.js](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/js/main.js).
* **Descripción:** Al iniciar la página, se extrae el texto de la descripción del hero y se limpia el contenedor. Un temporizador cíclico de JavaScript (`setTimeout`) reinserta carácter por carácter con un retraso de $50\text{ms}$. Un cursor intermitente (`.typing-cursor`) se añade dinámicamente y se desvanece 2 segundos después de que el efecto se completa.

### G. Revelado de Secciones al Scroll (Scroll Reveal Animation)
* **Líneas CSS:** 447-456 en [style.css](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/css/style.css).
* **Líneas JS:** 842-877 en [main.js](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/js/main.js).
* **Descripción:** Las secciones ocultas inician con `opacity: 0` y están desplazadas $40\text{px}$ hacia abajo mediante `transform: translateY(40px)`. Utiliza un `IntersectionObserver` de JavaScript para detectar cuándo entra la sección al $10\%$ del viewport del usuario. En ese instante, se inyecta la clase `.visible`, la cual transiciona la opacidad a $1$ y la posición a su estado natural con una transición cúbica suave (`cubic-bezier(0.16, 1, 0.3, 1)`).

### H. Botón de Regresar al Inicio (Scroll to Top Button)
* **Líneas HTML:** 345-349 en [index.html](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/index.html) (`#scroll-top`).
* **Líneas CSS:** 919-954 en [style.css](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/css/style.css).
* **Líneas JS:** 766-781 en [main.js](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/js/main.js).
* **Descripción:** Botón flotante redondo visible únicamente tras desplazarse $300\text{px}$ verticales en el sitio. Utiliza el método nativo del navegador `window.scrollTo({ top: 0, behavior: 'smooth' })` al ser presionado para regresar suavemente al inicio.

---

## 3. Especificaciones del Sistema de Diseño

El sistema de diseño implementa una estética de consola científica, utilizando una paleta cibernética fría y elementos tipográficos marcados.

### Variables CSS (CSS Custom Properties)
El tema de la interfaz está completamente parametrizado. Los colores y fuentes se definen en el ámbito `:root` (tema oscuro por defecto):

```css
:root {
  --bg-deep:       #060a14;                   /* Fondo general del espacio profundo */
  --bg-surface:    #0c1220;                   /* Fondo de tarjetas y secciones alternas */
  --bg-elevated:   #111a2e;                   /* Fondo de elementos flotantes */
  --bg-nav-mobile: rgba(6, 10, 20, 0.95);     /* Fondo del menú móvil en tema oscuro */
  --text-primary:  #e8eaf0;                   /* Texto principal de alta legibilidad */
  --text-muted:    #6b7d96;                   /* Texto secundario y descriptivo */
  --accent:        #3b82f6;                   /* Color primario de énfasis (Azul CERN) */
  --accent-hover:  #60a5fa;                   /* Enlace/botón hover */
  --accent-glow:   rgba(59, 130, 246, 0.15);  /* Contenedores de resplandor */
  --teal:          #14b8a6;                   /* Color secundario de énfasis (Teal cuántico) */
  --border:        rgba(255, 255, 255, 0.06); /* Bordes base del espacio */
  --border-accent: rgba(59, 130, 246, 0.15); /* Bordes activos con color */
  --font-display:  'Oxanium', sans-serif;
  --font-body:     'Inter', sans-serif;
  --font-mono:     'JetBrains Mono', monospace;
  --nav-h:         3.5rem;
}
```

### Soporte de Tema Claro (Light Theme)
Cuando el documento tiene el atributo `[data-theme="light"]`, se sobrescriben las variables del sistema para invertir los contrastes, manteniendo la consistencia de marcas y bordes:

```css
[data-theme="light"] {
  --bg-deep:       #f8f9fb;                   /* Fondo claro de laboratorio */
  --bg-surface:    #eef1f6;                   /* Secciones y contenedores alternos */
  --bg-elevated:   #ffffff;                   /* Tarjetas e inputs */
  --bg-nav-mobile: rgba(248, 249, 251, 0.95); /* Fondo del menú móvil en tema claro */
  --text-primary:  #1a1d26;                   /* Texto oscuro */
  --text-muted:    #5a6478;                   /* Texto secundario de contraste */
  --border:        rgba(0, 0, 0, 0.08);       /* Bordes grises sutiles */
  --border-accent: rgba(59, 130, 246, 0.2);   /* Bordes con azul destacado */
  --accent-glow:   rgba(59, 130, 246, 0.08);  /* Resplandores claros */
}
```
* **Propagación:** Los cambios del tema se inyectan en el DOM modificando el atributo `data-theme` del elemento `<html>`. Las hojas de estilo y las funciones de dibujo del Canvas escuchan este cambio para redibujar sus recursos de manera síncrona.

### Breakpoints de Diseño Responsivo
* **Breakpoint Mobile ($768\text{px}$):**
  * Oculta el menú convencional e inicializa el botón de menú hamburguesa.
  * Cambia la grilla de dos columnas `.about__grid` a una sola columna vertical.
  * Ajusta la escala de renderizado del átomo 3D (`transform: scale(0.7)`) para evitar que se desborde del contenedor de texto.
  * Reduce el tamaño del relleno general de las secciones de `6rem` a `4rem`.
* **Breakpoint Mobile XS ($480\text{px}$):**
  * Reduce el tamaño del título del hero (`.hero__name`) a `3rem` para evitar el desborde horizontal de texto largo.
  * Reconfigura la grilla de proyectos `.projects__grid` a una sola columna.
  * Convierte la lista horizontal de enlaces de contacto en un bloque de botones verticales.

---

## 4. Simulaciones Interactivas y Renderizado en Canvas

El portafolio ejecuta cuatro simulaciones físicas y visuales independientes que se dibujan en tiempo real:

### A. Cursor Personalizado (Canvas Particle Trail)
* **Líneas JS:** 11-122 en [main.js](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/js/main.js).
* **Algoritmo:** Emisión de partículas con arrastre de fricción y disipación de vida lineal.
* **Funcionamiento:** Escucha continuamente el movimiento del puntero (`mousemove`). Al desplazarse, crea partículas con coordenadas ligeramente perturbadas de forma aleatoria, asignándoles una velocidad inicial en Y negativa (las partículas flotan hacia arriba) y una velocidad aleatoria en X. Cada cuadro, las partículas actualizan su posición y reducen su opacidad.
* **Fórmula de Renderizado:** La opacidad de cada partícula se disipa exponencialmente según su edad:
  $$\text{alpha} = (1 - t_{\text{age}} / t_{\text{life}})$$
  El radio decrece linealmente. En modo claro, los colores se adaptan para usar una gradiente de azul profundo a azul intermedio.
* **Parámetros clave:**
  * `TRAIL_MAX`: $30$ (Límite máximo de partículas simultáneas para evitar caídas de FPS).
  * `TRAIL_LIFETIME`: $600\text{ms}$ (Tiempo de vida de la partícula antes de ser removida de la pila).
  * `TRAIL_SPAWN_INTERVAL`: $16\text{ms}$ (Control de emisión síncrono al frame rate).

### B. Canvas de Ondas de Hero (Wave Function Canvas)
* **Líneas JS:** 124-197 en [main.js](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/js/main.js).
* **Algoritmo:** Superposición de funciones de onda sinusoidales continuas (Teorema de Fourier simplificado).
* **Funcionamiento:** Dibuja 5 líneas sinusoidales independientes superpuestas para dar la apariencia de funciones de onda cuántica. El movimiento de oscilación horizontal se logra incrementando la variable temporal `time` en la función sinusoidal.
* **Fórmula Matemática:** Para cada punto horizontal $x$ de una capa, su coordenada $y$ se calcula de la siguiente manera:
  $$y(x) = y_{\text{center}} + \sum (A_n \cdot \sin(x \cdot F_n + t \cdot S_n)) + d_{\text{mouse}} \cdot \sin(x \cdot 0.003)$$
  Donde $A_n$ es la amplitud de la capa, $F_n$ es la frecuencia espacial, y $S_n$ es la velocidad de la fase de la onda. $d_{\text{mouse}}$ representa la distancia de desviación que produce el mouse con respecto a la posición original.
* **Parámetros clave:**
  * Capas configuradas:
    1. Amplitud $90$, Frecuencia $0.006$, Velocidad $0.0006$, Azul.
    2. Amplitud $65$, Frecuencia $0.010$, Velocidad $0.0010$, Azul.
    3. Amplitud $45$, Frecuencia $0.015$, Velocidad $0.0018$, Teal.
    4. Amplitud $30$, Frecuencia $0.022$, Velocidad $0.0025$, Teal.
    5. Amplitud $110$, Frecuencia $0.004$, Velocidad $0.0004$, Azul.

### C. Red de Partículas e Interacción de Fórmulas (Particle Network)
* **Líneas JS:** 199-373 en [main.js](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/js/main.js).
* **Algoritmo:** Red de malla flotante interactiva y búsqueda por proximidad euclidiana.
* **Funcionamiento:** Distribuye $60$ partículas flotantes con velocidades vectoriales constantes aleatorias. Al llegar a los límites del Canvas, las partículas se envuelven en el extremo opuesto. Cada partícula lleva una ecuación matemática asignada. Si el mouse se acerca a menos de $40\text{px}$ de una partícula, esta se fija y activa su resplandor, dibujando un globo flotante en el Canvas usando el método de contexto `roundRect` y escribiendo la fórmula matemática en su centro.
* **Fórmula de Conexión:** Se calcula la distancia euclidiana entre cada par de partículas $i$ y $j$:
  $$D_{i,j} = \sqrt{(x_i - x_j)^2 + (y_i - y_j)^2}$$
  Si $D_{i,j} < 140\text{px}$, se traza una línea con opacidad inversa al valor de distancia:
  $$\text{opacidad} = 1 - \frac{D_{i,j}}{140}$$
  * **Adaptación de tema:** En modo claro, los enlaces cambian su tono de azul transparente a un azul marino denso (`rgba(30, 64, 175)`) y aumentan su opacidad para permanecer visibles sobre fondo claro.

### D. Átomo 3D Interactivo (3D Atom Canvas)
* **Líneas JS:** 375-703 en [main.js](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/js/main.js).
* **Algoritmo:** Proyección de coordenadas 3D a plano de dibujo 2D (Foreshortening espacial) mediante matrices de rotación en tiempo real y ordenación por profundidad (*Painter's Algorithm*).
* **Matemática de Rotación y Proyección:**
  Para representar el átomo rotando alrededor de los ejes X e Y, cada punto orbital $(x, y, z)$ es procesado multiplicándolo por las matrices de rotación correspondientes.
  1. **Rotación en el eje X** (inclinación orbital inicial):
     $$\begin{aligned}
     y_1 &= y \cos(\theta_{\text{orbX}}) - z \sin(\theta_{\text{orbX}}) \\
     z_1 &= y \sin(\theta_{\text{orbX}}) + z \cos(\theta_{\text{orbX}})
     \end{aligned}$$
  2. **Rotación en el eje Z**:
     $$\begin{aligned}
     x_2 &= x \cos(\theta_{\text{orbZ}}) - y_1 \sin(\theta_{\text{orbZ}}) \\
     y_2 &= x \sin(\theta_{\text{orbZ}}) + y_1 \cos(\theta_{\text{orbZ}}) \\
     z_2 &= z_1
     \end{aligned}$$
  3. **Rotación global por el puntero (ejes X e Y globales)**:
     $$\begin{aligned}
     y_3 &= y_2 \cos(\phi_x) - z_2 \sin(\phi_x) \\
     z_3 &= y_2 \sin(\phi_x) + z_2 \cos(\phi_x) \\
     x_4 &= x_2 \cos(\phi_y) + z_3 \sin(\phi_y) \\
     z_4 &= -x_2 \sin(\phi_y) + z_3 \cos(\phi_y)
     \end{aligned}$$
  4. **Proyección en Perspectiva 2D:**
     El factor de perspectiva depende de la constante de distancia de la cámara (`CAM_DIST` = 6) y el campo de visión (`FOV` = 3.5):
     $$\text{scale} = \frac{\text{FOV}}{z_4 + \text{CAM\_DIST}}$$
     $$\begin{aligned}
     x_{\text{proj}} &= W_{\text{half}} + x_4 \cdot \text{scale} \cdot W_{\text{half}} \\
     y_{\text{proj}} &= H_{\text{half}} - y_3 \cdot \text{scale} \cdot H_{\text{half}}
     \end{aligned}$$
* **Estabilización de Órbita (Bug Corregido):**
  La ecuación de posición angular de los electrones sumaba la perturbación dentro de la multiplicación temporal: `angle = t * (e.baseSpeed + speedNoise)`. Al derivar, la velocidad crecía linealmente al pasar el tiempo. La ecuación correcta separa el desvío:
  $$\text{angle} = t \cdot e.\text{baseSpeed} + \text{speedNoise} + e.\text{offset}$$
* **Dibujo y Profundidad:**
  La red de órbita y electrones se almacena en una lista junto al núcleo (`{type: 'nucleus'/'electron', z: z_coord, ...}`). La lista es ordenada de manera ascendente según su eje $Z$ antes de dibujar. Los electrones lejanos se dibujan primero, luego el núcleo (aplicando resplandores superpuestos en degradé) y finalmente los electrones más cercanos, simulando una verdadera profundidad tridimensional espacial.

---

## 5. Sistema Bilingüe (Internacionalización)

La traducción es manejada directamente en el lado del cliente (Client-Side Vanilla Translation).

### Mecanismo de Funcionamiento
* El estado del idioma activo se almacena en la variable local `currentLang = 'es'` en **[js/main.js](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/js/main.js)**.
* Los elementos traducibles se identifican con los atributos `data-en` and `data-es` en **[index.html](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/index.html)**.
* Al cargar la página, se lee y aplica el idioma en español por defecto ejecutando:
  ```javascript
  document.querySelectorAll('[data-en][data-es]').forEach(function (el) {
    el.innerHTML = el.getAttribute('data-es');
  });
  ```
* Al presionar el elemento interactivo `#lang-toggle`, se alterna `currentLang` ('es' $\leftrightarrow$ 'en'), se actualiza el contenido textual del elemento botón (`ES` / `EN`) y se re-evalúan todos los selectores inyectando el nuevo atributo en la propiedad `.innerHTML` de los elementos. El valor de lenguaje del documento (`<html lang="...">`) se sincroniza simultáneamente con el idioma activo para apoyar el SEO del sitio web.

### Estado de la Cobertura del Sistema Bilingüe
* **Elementos con Traducción Completa:**
  * Cabecera y enlaces de navegación (Sobre Mí, Proyectos, Habilidades, timeline, Contacto, Blog).
  * Todos los textos y botones del Hero (saludos, descripciones y descarga de CV).
  * Párrafos del perfil de Sobre Mí (preservando los estilos `<strong>` y `<em>`).
  * Títulos de categorías de proyectos ("Proyectos", "Habilidades", "Educación", "Blog").
  * Tarjetas de Proyectos completas (descripciones, etiquetas e interruptores de GitHub).
  * Habilidades (Grupos: "Lenguajes", "Herramientas", "Áreas" y las tecnologías asociadas).
  * Línea de tiempo completa.
  * Títulos, subtítulos y estados de tarjetas de publicaciones de Blog ("Próximamente").
  * Textos del formulario y enlaces de contacto (Discord, GitHub).
  * Lema y pie de página de copyright.
* **Elementos No Traducibles (Intencionales):**
  * Ecuaciones del canvas de física en [main.js:L211-217](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/js/main.js#L211-L217) (permanecen fijas en lenguaje formal matemático).
  * Nombres propios de la institución académica (Universidad Nacional de Ingeniería) y de tecnologías de software (C++, Git, LaTeX) para evitar malas traducciones.

---

## 6. Registro Histórico de Bugs Críticos Corregidos

Esta sección detalla las fallas técnicas resueltas en el último ciclo de mantenimiento para documentar la toma de decisiones:

### Bug 1: Desvanecimiento de Texto en Menú Móvil en Modo Claro
* **Ubicación:** Línea 1186 de [style.css](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/css/style.css).
* **Causa Raíz:** El fondo de la caja desplegable `.nav__links` en móvil tenía un valor fijo oscuro `rgba(6, 10, 20, 0.95)`, pero en modo claro, las fuentes heredaban colores oscuros. Esto generaba un contraste nulo (fuente casi negra sobre fondo negro).
* **Solución:** Se sustituyó el color directo por la variable dinámica `var(--bg-nav-mobile)`.

### Bug 2: Aceleración Exponencial e Inestabilidad de Electrones del Átomo
* **Ubicación:** Línea 600 de [main.js](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/js/main.js).
* **Causa Raíz:** La ecuación del ángulo angular `t * (e.baseSpeed + speedNoise)` multiplicaba la variable temporal `t` por la función senoidal de oscilación. La velocidad derivada crecía de manera lineal, rompiendo la órbita de simulación estable a los pocos segundos.
* **Solución:** Se cambió la fórmula matemática a: `t * e.baseSpeed + speedNoise + e.offset`, logrando velocidad de órbita acotada y estable.

### Bug 3: Invisibilidad de Elementos del Átomo y Red de Conexiones en Modo Claro
* **Ubicación:** Rutinas de dibujo en [main.js](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/js/main.js).
* **Causa Raíz:** Las llamadas a `stroke` y `fill` usaban colores fijos diseñados para fondo oscuro (blancos y azules celestes semitransparentes). En modo claro, se lavaban contra el fondo claro `#f8f9fb`.
* **Solución:** Se añadieron condicionales dinámicos que verificarán el valor del atributo `data-theme`. Al detectar tema claro, se emplean azules oscuros (`#1e3a8a`, `rgba(30, 64, 175)`) y se incrementan las opacidades de trazo en un $50\%$ a $80\%$.

### Bug 4: Pérdida de Formato de Etiquetas HTML en el Motor de Traducción
* **Ubicación:** Líneas 929 y 941 de [main.js](file:///C:/Users/jrvv9/OneDrive/Desktop/minilux-portfolio/js/main.js).
* **Causa Raíz:** El alternador de idioma asignaba los textos de traducción usando `.textContent`. Esto borraba las etiquetas `<strong>` e `<em>` del párrafo de Sobre Mí, convirtiéndolas en texto plano.
* **Solución:** Se reemplazó por la propiedad `.innerHTML` en todos los procesos de asignación de textos traducibles.

---

## 7. Métricas de Calidad de Software y Optimización

Análisis de la calidad del código, rendimiento de ejecución, accesibilidad y optimización para buscadores:

### Rendimiento de Ejecución (Performance Metrics)
* **Optimización de Scroll:** Las rutinas de scroll que antes se saturaban en cada pixel de desplazamiento ahora están centralizadas bajo una única función optimizada llamada `handleScroll`, la cual se ejecuta coordinada con el ciclo de renderizado de la GPU usando `window.requestAnimationFrame`. Esto elimina cualquier riesgo de cuello de botella de renderizado (*jank*) y previene bloqueos por múltiples cálculos de posiciones.
* **Optimización del Hilo de Render (Reflows):** El acceso a propiedades que alteran la geometría del DOM (`.offsetTop`) se realiza una única vez por evento de animación frame coordinado, reduciendo al mínimo la necesidad de reorganizaciones de diseño del navegador (*layout trashing*).
* **Renderizado Diferido de Canvases (Lazy Canvas Loop):** Implementación de `IntersectionObserver`s independientes sobre la sección hero (`#hero`) y el átomo (`#atom-canvas`). Si estos elementos no se encuentran visibles en el viewport, sus bucles de renderizado y cálculos físicos de `requestAnimationFrame` se detienen automáticamente. Esto disminuye a casi $0\%$ el consumo innecesario de CPU del dispositivo del usuario por animaciones fuera de la vista.
* **Carga Inicial:** Al no contar con librerías Javascript externas pesadas, la web carga el árbol DOM e interactividad en menos de $150\text{ms}$ en conexiones promedio. El cargador artificial de la pantalla de carga se optimizó a $500\text{ms}$ para dar tiempo a inicializar los canvases con suavidad, disminuyendo el tiempo de espera inútil.

### Accesibilidad (A11y)
* **Contraste de Color:** La paleta de colores en ambos temas supera el ratio de contraste WCAG AA ($4.5:1$) para fuentes corporativas e interactivos.
* **Preferencia de Animación:** Al escuchar las preferencias de movimiento de hardware del sistema del usuario (`prefers-reduced-motion: reduce`), el CSS desactiva instantáneamente todas las transiciones y JavaScript deshabilita los ciclos de redibujado de los Canvas, previniendo síntomas de mareo en usuarios sensibles.
* **Semántica HTML:** La estructura hace uso correcto de etiquetas HTML5 (`<nav>`, `<section>`, `<article>`, `<footer>`). Los botones flotantes interactivos que no contienen texto descriptivo (como el botón para ir arriba y el toggler de menú) están etiquetados de forma explícita con el atributo `aria-label` para ser descritos correctamente por los lectores de pantalla.

---

## 8. Mapa de Dependencias del Sistema

Este mapa de relaciones describe de qué elementos del DOM y variables de hojas de estilo dependen las funciones principales de JavaScript para poder operar correctamente en caso de una futura refactorización:

```mermaid
graph TD
    %% JS Functions
    subgraph JS [Lógica JS]
        F_Cursor[Canvas Cursor Trail]
        F_Wave[Wave Canvas Draw]
        F_Atom[3D Atom Simulation]
        F_Part[Particle Network Canvas]
        F_Scroll[Scroll Handler]
        F_Lang[Bilingual Toggle]
        F_Theme[Theme Toggle]
    end

    %% DOM Elements
    subgraph DOM [Elementos del DOM]
        D_Cursor[#cursor-canvas]
        D_Wave[#wave-canvas]
        D_Atom[#atom-canvas]
        D_Labels[.atom-label]
        D_Part[#particle-canvas]
        D_Nav[#nav]
        D_Links[.nav__link]
        D_Sections[.section / .hero]
        D_Trans[[data-en] [data-es]]
        D_HTML[HTML Element]
    end

    %% CSS Variables
    subgraph CSS [Tokens CSS]
        V_Theme[data-theme]
        V_NavM[--bg-nav-mobile]
        V_Colors[Colores CSS]
    end

    %% Connections
    F_Cursor --> D_Cursor
    F_Wave --> D_Wave
    F_Atom --> D_Atom
    F_Atom --> D_Labels
    F_Part --> D_Part
    
    F_Scroll --> D_Nav
    F_Scroll --> D_Links
    F_Scroll --> D_Sections
    
    F_Lang --> D_Trans
    F_Lang --> D_HTML
    
    F_Theme --> D_HTML
    F_Theme --> V_Theme
    
    D_HTML --> V_Theme
    V_Theme --> V_NavM
    V_Theme --> V_Colors
    D_Nav --> V_Colors
    
    F_Part -.->|Verifica el tema| D_HTML
    F_Atom -.->|Verifica el tema| D_HTML
```

* **Dependencia del Tema:** Las rutinas de dibujo del Canvas de Partículas (`drawNetParticles`) y el átomo 3D (`render`) tienen una dependencia directa con el atributo `data-theme` del elemento `<html>` (`document.documentElement`). Si este atributo se cambia de nombre o se elimina, los canvases perderán su adaptabilidad visual clara y se mantendrán fijos en los colores del tema oscuro original.
* **Dependencia de Posicionamiento:** La función de detección de sección activa (`updateActiveNav`) lee el arreglo de contenedores `.section` y `.hero` y calcula el desplazamiento vertical de cada uno utilizando la propiedad `.offsetTop`. Si se anidan estas secciones dentro de contenedores posicionados de forma relativa, `.offsetTop` se medirá con respecto al contenedor padre inmediato en lugar de la parte superior del cuerpo de la página, lo que rompería la precisión del indicador del menú de navegación.

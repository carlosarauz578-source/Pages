# CODELINGUA — v0.2: motor curricular modular

Plataforma web estática preparada para GitHub Pages. Esta versión separa la interfaz del contenido curricular de cada lenguaje.

## Probar localmente

No abras `index.html` directamente con `file://` porque los navegadores bloquean `fetch()` de los archivos JSON locales. Ejecuta un servidor estático desde la carpeta del proyecto:

```bash
python -m http.server 8000
```

Después abre `http://localhost:8000`. También puedes usar Live Server en VS Code.

## Publicar en GitHub Pages

1. Sube el contenido completo de esta carpeta a la raíz del repositorio.
2. En GitHub abre **Settings → Pages**.
3. Selecciona **Deploy from a branch**, rama `main`, carpeta `/ (root)`.
4. Guarda y espera a que GitHub publique el sitio.

**Importante:** sube también la carpeta `data/`; sin ella no se cargarán las lecciones.

## Incluido en v0.2

- Panel principal, catálogo, ruta de dominio, tutor demostrativo, laboratorio y progreso.
- 13 currículos independientes en JSON: Python, Bash, HTML, JavaScript, TypeScript, SQL, PowerShell, Go, Rust, Solidity, C, C++ y Assembly.
- Cada currículo contiene objetivo, módulos con explicación, ejemplo y desafío, además de una comprobación inicial.
- Vista individual por lenguaje con módulos desplegables.
- Registro local de módulos comprendidos, resultados de evaluación y prácticas mediante `localStorage`.
- Interfaz adaptable a escritorio y móvil.

## Arquitectura

```text
CODELINGUA/
├── index.html                 # estructura y vistas
├── styles.css                 # diseño visual
├── app.js                     # navegación y motor del cliente
├── data/                      # contenido independiente por lenguaje
│   ├── python.json
│   ├── bash.json
│   ├── html.json
│   ├── javascript.json
│   ├── typescript.json
│   ├── sql.json
│   ├── powershell.json
│   ├── go.json
│   ├── rust.json
│   ├── solidity.json
│   ├── c.json
│   ├── cpp.json
│   └── assembly.json
└── docs/
    └── ARQUITECTURA.md
```

## Límites conocidos

- El tutor es una demostración local; no hay modelo de IA conectado.
- El laboratorio no ejecuta ni compila código.
- El progreso se guarda solo en el navegador actual y no se sincroniza entre dispositivos.
- Las preguntas de evaluación actuales son diagnósticos iniciales, no pruebas suficientes para certificar dominio.
- AI-Script se mantiene como concepto transversal pendiente de definición técnica; no se presenta como lenguaje estándar.

## Siguiente evolución

1. Diagnóstico adaptativo de varios niveles para identificar conocimientos previos y permitir saltar contenidos ya dominados.
2. Más ejercicios por concepto: lectura, predicción de salida, escritura, depuración y transferencia entre lenguajes.
3. Tutor IA conectado mediante backend seguro; las claves de API nunca deben estar en `app.js` ni en el repositorio público.
4. Ejecución de código en entornos aislados y limitados por recursos.
5. Cuenta y sincronización de progreso.

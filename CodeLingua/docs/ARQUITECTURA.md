# Arquitectura educativa de CODELINGUA

## Principio de diseño

El motor de aprendizaje es común; el currículo, los ejemplos, la sintaxis y las evaluaciones pertenecen a cada lenguaje. El objetivo es reutilizar conceptos transferibles sin fingir que todos los lenguajes funcionan igual.

## Componentes

- **Catálogo:** identifica los lenguajes, sus categorías y estado de aprendizaje.
- **Currículo JSON:** define objetivos, módulos, explicaciones, ejemplos, desafíos y evaluaciones.
- **Motor de lecciones:** presenta el contenido, registra evidencia y calcula avance.
- **Motor de evaluación:** debe medir lectura, escritura, razonamiento, depuración y criterio al utilizar IA.
- **Tutor IA:** futuro servicio que recibe el contexto del estudiante y el currículo activo.
- **Laboratorio:** futuro entorno aislado para ejecutar o compilar código.
- **Persistencia:** `localStorage` en esta versión; base de datos con cuentas en una fase posterior.

## Contrato de un currículo

Cada archivo `data/<slug>.json` usa `schemaVersion`, `slug`, `name`, `category`, `goal`, `learningPrinciple`, `modules[]` y `assessment`. Cada módulo tiene `id`, `title`, `explanation`, `example`, `challenge` y `estimatedMinutes`.

## Aprendizaje acelerado sin superficialidad

1. Diagnosticar lo que el estudiante ya sabe.
2. Permitir omitir conceptos demostrados, conservando una prueba de evidencia.
3. Enseñar primero las diferencias propias del lenguaje y reutilizar conceptos ya comprendidos.
4. Combinar lectura, predicción, modificación, construcción y depuración.
5. Volver a evaluar conceptos con recuperación espaciada.
6. Avanzar por evidencia, no por horas ni por finalización mecánica de lecciones.

## Integración segura de IA

El navegador nunca debe contener una clave secreta de proveedor. El flujo previsto es:

`Navegador → API propia autenticada → proveedor de IA`

El backend deberá aplicar límites de uso, validación de entradas, protección de datos, registro mínimo, cuotas y controles de coste. El prompt del tutor debe incluir el lenguaje, el módulo, el nivel demostrado y el objetivo pedagógico. Debe explicar y preguntar; no limitarse a entregar soluciones completas.

## Ejecución de código

No ejecutar código arbitrario en el navegador principal ni en el servidor de la web. Una futura ejecución debe utilizar un servicio aislado, con límites de CPU, memoria, tiempo, tamaño de salida, red deshabilitada por defecto y eliminación del entorno después de cada ejecución.

## Límites de la versión actual

La v0.2 ofrece currículos iniciales y registro local. No realiza diagnóstico adaptativo robusto, no ejecuta código y no está conectada a una IA externa.

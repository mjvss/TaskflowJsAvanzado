# TaskFlow — Productividad Diaria

TaskFlow es una aplicación web de gestión de tareas (To-Do List) moderna, rápida y adaptable. Su diseño busca reducir la fricción diaria entregando una experiencia visual premium y fluida, construida únicamente con Vanilla JavaScript, HTML5 y CSS3 moderno (sin frameworks externos).

## Características Principales

*   **Diseño Premium y Dark Mode:** Interfaz oscurecida (Glassmorphism), fuentes elegantes, indicadores visuales de estado y una paleta de colores cuidadosamente seleccionada para reducir la fatiga visual.
*   **Diseño Mobile-first y Thumb Zone:** Integración de la Ley de Fitts ubicando los campos de respuesta más utilizados (como la adición de tareas) convenientemente al alcance de los pulgares.
*   **Separación de Conceptos:** Código limpio (Clean Code) dividido en diferentes partes (HTML, JS, CSS separadamente) mejorando la mantenibilidad, escalabilidad y legibilidad de la arquitectura del proyecto.
*   **Interactividad Autónoma:** Funcionalidades de añadir, editar (inline styling), descartar tareas, más feedback instantáneo y limitaciones inteligentes de campo.
*   **Gestión Inteligente y Sincronizada:** Capacidad de recordar tus últimas tareas (LocalStorage), de sincronizarse esporádicamente de manera asíncrona hacia APIs públicas experimentales e incluír recuentos automáticos en el dashboard.

## Uso

1. Tipea tu tarea en la barra inferior indicadora. (Nota que se rige por un contador inteligente máximo de 50 caracteres para promover que crees tareas accionables directas).
2. Toca "Agregar" o pulsa la tecla `Enter`.
3. Navega por las diferentes tarjetas entre categorías "Todas", "Pendientes" y "Superadas" y mantén el control total.
4. Para **Editar**, pulsa en el botón del lapicito ✎ directamente en una tarea de tu lista.

## Conceptos JS Avanzados Aplicados

*   **POO y Clases:** Gestión estructural separando comportamiento propio (`class Tarea`) de la orquestación superior de conjunto (`class GestorTareas`).
*   **Promesas y Async/Await:** Lectura asíncrona (Mock API syncing fetching y simulaciones de timeout intencionales para feedback UX).
*   **Manipulación DOM de alto rendimiento:** Adherencia a delegación de eventos, creación programática limpia y reflow/repaints eficientes.

---

> Desarrollado como parte de las prácticas intensivas orientadas al ecosistema Frontend y Experiencia de Usuario.

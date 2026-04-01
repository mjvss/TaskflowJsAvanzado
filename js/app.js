// ═══════════════════════════════════════════
// 1. ORIENTACIÓN A OBJETOS (OOP)
// ═══════════════════════════════════════════

/**
 * Clase Tarea — representa una tarea individual.
 * Propiedades: id, descripcion, estado (completada), fecha, etiqueta, color.
 */
class Tarea {
    constructor(id, descripcion, completada = false, etiqueta = null, colorEtiqueta = null, fecha = null) {
        this.id = id;
        this.descripcion = descripcion;
        this.completada = completada;
        this.etiqueta = etiqueta;
        this.colorEtiqueta = colorEtiqueta;
        this.fecha = fecha;
    }

    /** Alterna el estado pendiente ↔ completada */
    alternarEstado() {
        this.completada = !this.completada;
    }
}

/**
 * Clase GestorTareas — administra la lista completa de tareas.
 * Implementa métodos CRUD y persistencia en localStorage.
 */
class GestorTareas {
    constructor() {
        const stored = localStorage.getItem('taskflow_tasks');
        if (stored) {
            this.tareas = JSON.parse(stored).map(
                t => new Tarea(t.id, t.descripcion, t.completada, t.etiqueta, t.colorEtiqueta, t.fecha)
            );
        } else {
            this.tareas = [];
        }
    }

    // ── Persistencia ──────────────────────────
    guardarDatos() {
        localStorage.setItem('taskflow_tasks', JSON.stringify(this.tareas));
    }

    // ── CRUD ─────────────────────────────────
    agregarTarea(descripcion) {
        const nuevaTarea = new Tarea(Date.now(), descripcion);
        nuevaTarea.fecha = { texto: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), destaque: false };
        this.tareas.unshift(nuevaTarea);
        this.guardarDatos();
        return nuevaTarea.id;
    }

    eliminarTarea(id) {
        this.tareas = this.tareas.filter(t => t.id !== id);
        this.guardarDatos();
    }

    alternarEstado(id) {
        const tarea = this.tareas.find(t => t.id === id);
        if (tarea) {
            tarea.alternarEstado();
            this.guardarDatos();
        }
    }

    obtenerEstadisticas() {
        const total = this.tareas.length;
        const completadas = this.tareas.filter(t => t.completada).length;
        const pendientes = total - completadas;
        const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;
        return { total, completadas, pendientes, porcentaje };
    }
}

// ═══════════════════════════════════════════
// 2. CARACTERÍSTICAS ES6+
//    - const/let (no var)
//    - Template literals
//    - Arrow functions
//    - Destructuring, spread/rest
// ═══════════════════════════════════════════

// ── DOM References (destructuring pattern) ──
const UI = {
    btnNewTask: document.getElementById('btn-new-task'),
    form: document.getElementById('todo-form'),
    input: document.getElementById('task-input'),
    btnSubmit: document.getElementById('submit-task'),
    lista: document.getElementById('task-list'),
    btnFilters: document.getElementById('btn-filters'),
    filterMenu: document.getElementById('filter-menu'),
    filterOptions: document.querySelectorAll('.filter-option'),
    taskCounter: document.getElementById('task-counter'),
    progressBar: document.getElementById('progress-bar'),
    emptyState: document.getElementById('empty-state'),
    emptyTitle: document.getElementById('empty-title'),
    emptyText: document.getElementById('empty-text')
};

const gestor = new GestorTareas();
let currentFilter = 'all';
let lastAddedId = null;
let isSaving = false;

// ═══════════════════════════════════════════
// 3. EVENTOS Y MANIPULACIÓN DEL DOM
//    - submit, click, mouseover, keyup, keydown
// ═══════════════════════════════════════════

// ── Toggle New Task Form ──────────────────
UI.btnNewTask.addEventListener('click', () => {
    UI.form.classList.toggle('active');
    if (UI.form.classList.contains('active')) {
        UI.input.focus();
    }
});

// ── Save Task via FORM SUBMIT ─────────────
// Usando <form> semántico + evento 'submit' como pide la instrucción
UI.form.addEventListener('submit', (e) => {
    e.preventDefault();
    guardarTarea();
});

/**
 * Guarda tarea con retardo simulado (setTimeout) — Paso 4.
 * Muestra estado "Saving…" en el botón durante 1s.
 */
function guardarTarea() {
    const texto = UI.input.value.trim();
    if (!texto || isSaving) return;

    isSaving = true;
    UI.btnSubmit.textContent = 'Saving…';
    UI.btnSubmit.disabled = true;
    UI.btnSubmit.classList.add('is-saving');

    // setTimeout — simula retardo de red (Paso 4 de las instrucciones)
    setTimeout(() => {
        lastAddedId = gestor.agregarTarea(texto);
        UI.input.value = '';
        UI.form.classList.remove('active');

        // Restaurar botón
        UI.btnSubmit.textContent = 'Save';
        UI.btnSubmit.disabled = false;
        UI.btnSubmit.classList.remove('is-saving');
        isSaving = false;

        render();

        // Notificación en consola tras 2 segundos (Paso 4)
        setTimeout(() => {
            console.log(`✅ Task "${texto}" added successfully`);
        }, 2000);
    }, 1000);
}

// ── Filter Logic ──────────────────────────
UI.btnFilters.addEventListener('click', (e) => {
    e.stopPropagation();
    UI.filterMenu.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!UI.btnFilters.contains(e.target) && !UI.filterMenu.contains(e.target)) {
        UI.filterMenu.classList.remove('active');
    }
});

UI.filterOptions.forEach(btn => {
    btn.addEventListener('click', () => {
        UI.filterOptions.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        UI.filterMenu.classList.remove('active');
        actualizarBotonFiltro();
        render();
    });
});

function actualizarBotonFiltro() {
    const oldBadge = UI.btnFilters.querySelector('.filter-badge');
    if (oldBadge) oldBadge.remove();

    if (currentFilter !== 'all') {
        const badge = document.createElement('span');
        badge.className = 'filter-badge';
        badge.textContent = currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1);
        UI.btnFilters.appendChild(badge);
    }
}

// ── Keyboard Shortcuts (keydown + keyup) ──
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        UI.form.classList.remove('active');
        UI.filterMenu.classList.remove('active');
    }
});

// keyup en input — live validation / feedback (requerido por instrucciones)
UI.input.addEventListener('keyup', () => {
    const len = UI.input.value.trim().length;
    UI.btnSubmit.disabled = len === 0 || isSaving;
});

// ── Event Delegation — eliminando globals/onclick ──
// Un solo listener en el contenedor maneja checkbox toggles y eliminación
UI.lista.addEventListener('click', (e) => {
    const { target } = e;

    // ── Delete button ──
    const deleteBtn = target.closest('.btn-delete');
    if (deleteBtn) {
        const li = deleteBtn.closest('.task-item');
        const id = Number(li.dataset.taskId);
        li.classList.add('removing');
        li.addEventListener('animationend', () => {
            gestor.eliminarTarea(id);
            render();
        }, { once: true });
        return;
    }

    // ── Checkbox toggle ──
    const checkbox = target.closest('input[type="checkbox"]');
    if (checkbox) {
        const li = checkbox.closest('.task-item');
        const id = Number(li.dataset.taskId);
        gestor.alternarEstado(id);
        render();
    }
});

// ── Mouseover en task items (requerido por instrucciones) ──
UI.lista.addEventListener('mouseover', (e) => {
    const taskItem = e.target.closest('.task-item');
    if (taskItem && !taskItem.classList.contains('is-hovered')) {
        taskItem.classList.add('is-hovered');
    }
});

UI.lista.addEventListener('mouseout', (e) => {
    const taskItem = e.target.closest('.task-item');
    if (taskItem) {
        // Solo quitar si el mouse realmente salió del item
        const related = e.relatedTarget;
        if (!taskItem.contains(related)) {
            taskItem.classList.remove('is-hovered');
        }
    }
});

// ═══════════════════════════════════════════
// 4. JAVASCRIPT ASÍNCRONO
//    - setTimeout (en guardarTarea, arriba)
//    - setInterval (contador periódico)
// ═══════════════════════════════════════════

// setInterval — contador de tareas activo cada 5 segundos (Paso 4)
setInterval(() => {
    const { total, completadas, pendientes } = gestor.obtenerEstadisticas();
    console.log(`📊 Task counter — Total: ${total} | Completed: ${completadas} | Pending: ${pendientes}`);
}, 5000);

// ═══════════════════════════════════════════
// 5. CONSUMO DE APIs CON JAVASCRIPT
//    - fetch() + async/await + try/catch
//    - localStorage (ya implementado en GestorTareas)
// ═══════════════════════════════════════════

/**
 * Obtiene tareas de JSONPlaceholder API y las agrega al gestor.
 * Se usa para la carga inicial cuando no hay datos en localStorage.
 * Maneja errores con try/catch.
 */
async function obtenerTareasAPI() {
    try {
        // Mostrar skeleton loader durante la carga
        mostrarSkeleton();

        const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5');

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();
        console.log('📡 Datos obtenidos de la API:', data);

        // Mapear datos de la API a instancias de Tarea
        const tareasAPI = data.map(item => {
            const tarea = new Tarea(
                item.id,
                item.title.charAt(0).toUpperCase() + item.title.slice(1), // Capitalizar
                item.completed
            );
            tarea.fecha = { texto: 'From API', destaque: false };
            return tarea;
        });

        // Spread operator para fusionar tareas existentes con las de la API
        gestor.tareas = [...tareasAPI, ...gestor.tareas];
        gestor.guardarDatos();

        // Ocultar skeleton y renderizar
        ocultarSkeleton();
        render();
    } catch (error) {
        console.error('❌ Error al obtener datos de la API:', error);
        ocultarSkeleton();
        render();
    }
}

// ── Skeleton Loader ───────────────────────
function mostrarSkeleton() {
    UI.lista.innerHTML = '';
    UI.emptyState.classList.remove('visible');
    UI.lista.style.display = '';

    for (let i = 0; i < 3; i++) {
        const skeleton = document.createElement('li');
        skeleton.className = 'task-item skeleton-item';
        skeleton.setAttribute('data-index', i);
        skeleton.innerHTML = `
            <div class="skeleton-checkbox"></div>
            <div class="task-content">
                <div class="skeleton-line skeleton-title"></div>
                <div class="skeleton-line skeleton-meta"></div>
            </div>
        `;
        UI.lista.appendChild(skeleton);
    }
}

function ocultarSkeleton() {
    const skeletons = UI.lista.querySelectorAll('.skeleton-item');
    skeletons.forEach(s => s.remove());
}

// ═══════════════════════════════════════════
// Estadísticas y Empty State
// ═══════════════════════════════════════════

function actualizarEstadisticas() {
    const { total, completadas, porcentaje } = gestor.obtenerEstadisticas();
    UI.taskCounter.innerHTML = `<span class="count-highlight">${total}</span> task${total !== 1 ? 's' : ''} · ${completadas} completed`;
    UI.progressBar.style.width = `${porcentaje}%`;
}

function actualizarEmptyState(tareasFiltradas) {
    if (tareasFiltradas.length === 0) {
        UI.emptyState.classList.add('visible');
        UI.lista.style.display = 'none';

        if (gestor.tareas.length === 0) {
            UI.emptyTitle.textContent = 'No tasks yet';
            UI.emptyText.textContent = 'Click "New Task" to create your first one';
        } else {
            const filterName = currentFilter === 'pending' ? 'pending' : 'completed';
            UI.emptyTitle.textContent = `No ${filterName} tasks`;
            UI.emptyText.textContent = 'Try changing the filter to see other tasks';
        }
    } else {
        UI.emptyState.classList.remove('visible');
        UI.lista.style.display = '';
    }
}

// ═══════════════════════════════════════════
// Main Render
// ═══════════════════════════════════════════

function render() {
    UI.lista.innerHTML = '';

    const tareasFiltradas = gestor.tareas.filter(tarea => {
        if (currentFilter === 'pending') return !tarea.completada;
        if (currentFilter === 'completed') return tarea.completada;
        return true;
    });

    actualizarEstadisticas();
    actualizarEmptyState(tareasFiltradas);

    tareasFiltradas.forEach((tarea, index) => {
        const li = document.createElement('li');
        li.className = `task-item ${tarea.completada ? 'is-completed' : ''}`;
        li.setAttribute('data-index', index);
        li.setAttribute('data-task-id', tarea.id);

        // Highlight para tarea recién agregada
        if (tarea.id === lastAddedId) {
            li.classList.add('just-added');
            lastAddedId = null;
        }

        // Checkbox con SVG animado (sin onclick inline — delegación de eventos)
        const checkboxHTML = `
            <label class="checkbox-container">
                <input type="checkbox" ${tarea.completada ? 'checked' : ''}>
                <span class="checkmark">
                    <svg class="checkmark-svg" viewBox="0 0 12 12">
                        <polyline points="2 6 5 9 10 3"></polyline>
                    </svg>
                </span>
            </label>
        `;

        // Meta data
        let metaHTML = '';
        if (tarea.fecha) {
            const orangeClass = tarea.fecha.destaque ? 'date-orange' : '';
            metaHTML = `
                <div class="task-meta">
                    <span class="task-meta-item ${orangeClass}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        ${tarea.fecha.texto}
                    </span>
                    ${ !tarea.completada ? `
                    <span class="task-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        ${tarea.id % 3 + 1}
                    </span>
                    ${tarea.etiqueta === 'LaunchPad' ? `
                    <span class="task-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                        1
                    </span>` : ''}
                    ` : '' }
                </div>
            `;
        }

        // Tags
        let tagsHTML = '';
        if (tarea.etiqueta) {
            tagsHTML = `
                <div class="task-tags">
                    <div class="tag" style="color: ${tarea.colorEtiqueta}">
                        <div class="tag-dot" style="background-color: ${tarea.colorEtiqueta}"></div>
                        ${tarea.etiqueta}
                    </div>
                </div>
            `;
        }

        // Task content
        const contentHTML = `
            <div class="task-content">
                <h3 class="task-title">${tarea.descripcion}</h3>
                ${metaHTML}
                ${tagsHTML}
            </div>
        `;

        // Delete button (sin onclick inline — delegación de eventos)
        const deleteHTML = `
            <div class="task-actions">
                <button class="btn-delete" title="Delete task" aria-label="Delete task: ${tarea.descripcion}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;

        li.innerHTML = checkboxHTML + contentHTML + deleteHTML;
        UI.lista.appendChild(li);
    });
}

// ═══════════════════════════════════════════
// Boot
// ═══════════════════════════════════════════

// Si hay datos en localStorage, renderizar directamente.
// Si no, cargar desde la API (primera visita).
if (gestor.tareas.length > 0) {
    render();
} else {
    obtenerTareasAPI();
}

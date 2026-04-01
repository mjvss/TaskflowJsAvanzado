class Tarea {
    constructor(id, descripcion, completada = false, etiqueta = null, colorEtiqueta = null, fecha = null) {
        this.id = id;
        this.descripcion = descripcion;
        this.completada = completada;
        this.etiqueta = etiqueta;
        this.colorEtiqueta = colorEtiqueta;
        this.fecha = fecha;
    }

    alternarEstado() {
        this.completada = !this.completada;
    }
}

class GestorTareas {
    constructor() {
        const stored = localStorage.getItem('taskflow_tasks');
        if (stored) {
            this.tareas = JSON.parse(stored).map(t => new Tarea(t.id, t.descripcion, t.completada, t.etiqueta, t.colorEtiqueta, t.fecha));
        } else {
            this.tareas = this.cargarDatosMock() || [];
            this.guardarDatos();
        }
    }

    guardarDatos() {
        localStorage.setItem('taskflow_tasks', JSON.stringify(this.tareas));
    }

    cargarDatosMock() {
        // Datos iniciales para que la interfaz se vea idéntica a la imagen adjunta
        const t1 = new Tarea(Date.now() + 1, "Finish user onboarding");
        t1.fecha = { texto: "Tomorrow", destaque: true };
        
        const t2 = new Tarea(Date.now() + 2, "Solve the Dabble prioritisation issue");
        t2.fecha = { texto: "Jan 8, 2022", destaque: false };
        t2.etiqueta = "LaunchPad";
        t2.colorEtiqueta = "#8b5cf6"; // Púrpura

        const t3 = new Tarea(Date.now() + 3, "Hold to reorder on mobile");
        t3.fecha = { texto: "Jan 10, 2022", destaque: false };
        t3.etiqueta = "Dabble";
        t3.colorEtiqueta = "#ec4899"; // Rosa

        const t4 = new Tarea(Date.now() + 4, "Update onboarding workflow templates", true);
        
        return [t1, t2, t3, t4];
    }

    agregarTarea(descripcion) {
        const nuevaTarea = new Tarea(Date.now(), descripcion);
        // Generamos fecha aleatoria para mantener la estética
        nuevaTarea.fecha = { texto: "Jan 15, 2022", destaque: false };
        this.tareas.push(nuevaTarea);
        this.guardarDatos();
    }

    alternarEstado(id) {
        const tarea = this.tareas.find(t => t.id === id);
        if (tarea) {
            tarea.alternarEstado();
            this.guardarDatos();
        }
    }
}

// Controladores DOM
const UI = {
    btnNewTask: document.getElementById('btn-new-task'),
    form: document.getElementById('todo-form'),
    input: document.getElementById('task-input'),
    btnSubmit: document.getElementById('submit-task'),
    lista: document.getElementById('task-list'),
    btnFilters: document.getElementById('btn-filters'),
    filterMenu: document.getElementById('filter-menu'),
    filterOptions: document.querySelectorAll('.filter-option')
};

const gestor = new GestorTareas();
let currentFilter = 'all';

// Toggle New Task Form
UI.btnNewTask.addEventListener('click', () => {
    UI.form.classList.toggle('active');
    if(UI.form.classList.contains('active')) {
        UI.input.focus();
    }
});

// Guardar nueva tarea
function guardarTarea() {
    const texto = UI.input.value.trim();
    if (texto) {
        gestor.agregarTarea(texto);
        UI.input.value = '';
        UI.form.classList.remove('active');
        render();
    }
}

UI.btnSubmit.addEventListener('click', guardarTarea);
UI.input.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') guardarTarea();
});

// Filters Logic
UI.btnFilters.addEventListener('click', () => {
    UI.filterMenu.classList.toggle('active');
});

// Cierra el menu clickeando fuera
document.addEventListener('click', (e) => {
    if (!UI.btnFilters.contains(e.target) && !UI.filterMenu.contains(e.target)) {
        UI.filterMenu.classList.remove('active');
    }
});

UI.filterOptions.forEach(btn => {
    btn.addEventListener('click', (e) => {
        UI.filterOptions.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        UI.filterMenu.classList.remove('active');
        render();
    });
});

// Render global
function render() {
    UI.lista.innerHTML = '';

    const tareasFiltradas = gestor.tareas.filter(tarea => {
        if (currentFilter === 'pending') return !tarea.completada;
        if (currentFilter === 'completed') return tarea.completada;
        return true;
    });

    tareasFiltradas.forEach(tarea => {
        const li = document.createElement('li');
        li.className = `task-item ${tarea.completada ? 'is-completed' : ''}`;

        // Checkbox HTML
        const checkboxHTML = `
            <label class="checkbox-container">
                <input type="checkbox" onchange="toggleTarea(${tarea.id})" ${tarea.completada ? 'checked' : ''}>
                <span class="checkmark"></span>
            </label>
        `;

        // Metadatos HTML
        let metaHTML = '';
        if (tarea.fecha) {
            const orangeClass = tarea.fecha.destaque ? 'date-orange' : '';
            // Iconos SVG de calendario y comentarios harcodeados para la estética
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

        // Título de la tarea
        const contentHTML = `
            <div class="task-content">
                <h3 class="task-title">${tarea.descripcion}</h3>
                ${metaHTML}
                ${tagsHTML}
            </div>
        `;

        li.innerHTML = checkboxHTML + contentHTML;
        UI.lista.appendChild(li);
    });
}

// Función global para que la pueda llamar el evento onchange inline
window.toggleTarea = function(id) {
    gestor.alternarEstado(id);
    render();
}

// Arranque
render();

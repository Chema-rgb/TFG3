const user = getUser();
const isAdmin = user?.rol === 'ADMIN';

if (!isAdmin) document.getElementById('btnNuevoCurso').style.display = 'none';

async function cargarProfesoresSelect() {
    const profesores = await apiFetch('/profesores');
    const select = document.getElementById('cursoProfesor');
    profesores?.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.nombre + ' ' + p.apellidos;
        select.appendChild(opt);
    });
}

async function cargarCursos() {
    const tbody = document.getElementById('tbodyCursos');
    const cursos = await apiFetch('/cursos');
    if (!cursos || cursos.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="8">No hay cursos registrados</td></tr>';
        return;
    }
    tbody.innerHTML = cursos.map(c => `
        <tr>
            <td>${c.id}</td>
            <td>${c.nombre}</td>
            <td>${c.nivel || '-'}</td>
            <td>${c.capacidad || '-'}</td>
            <td>${c.precio ? c.precio + '€' : '-'}</td>
            <td>${c.profesor ? c.profesor.nombre + ' ' + c.profesor.apellidos : '-'}</td>
            <td><span class="badge badge-${c.estado?.toLowerCase()}">${c.estado}</span></td>
            <td class="actions-cell">
                ${isAdmin ? `
                <button class="btn btn-sm btn-icon" onclick="editarCurso(${c.id})">Editar</button>
                <button class="btn btn-sm btn-icon btn-danger" onclick="eliminarCurso(${c.id})">Borrar</button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

document.getElementById('btnNuevoCurso')?.addEventListener('click', () => {
    document.getElementById('formCurso').reset();
    document.getElementById('cursoId').value = '';
    document.getElementById('modalCursoTitle').textContent = 'Nuevo Curso';
    abrirModal('modalCurso');
});

async function editarCurso(id) {
    const c = await apiFetch('/cursos/' + id);
    document.getElementById('cursoId').value = c.id;
    document.getElementById('cursoNombre').value = c.nombre;
    document.getElementById('cursoNivel').value = c.nivel || '';
    document.getElementById('cursoCapacidad').value = c.capacidad || '';
    document.getElementById('cursoPrecio').value = c.precio || '';
    document.getElementById('cursoProfesor').value = c.profesor?.id || '';
    document.getElementById('cursoEstado').value = c.estado;
    document.getElementById('cursoDescripcion').value = c.descripcion || '';
    document.getElementById('modalCursoTitle').textContent = 'Editar Curso';
    abrirModal('modalCurso');
}

async function eliminarCurso(id) {
    if (!confirm('¿Eliminar este curso?')) return;
    await apiFetch('/cursos/' + id, { method: 'DELETE' });
    cargarCursos();
}

document.getElementById('formCurso').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('cursoId').value;
    const profesorId = document.getElementById('cursoProfesor').value;

    const body = {
        nombre: document.getElementById('cursoNombre').value,
        nivel: document.getElementById('cursoNivel').value,
        capacidad: document.getElementById('cursoCapacidad').value || null,
        precio: document.getElementById('cursoPrecio').value || null,
        descripcion: document.getElementById('cursoDescripcion').value,
        estado: document.getElementById('cursoEstado').value,
        profesor: profesorId ? { id: parseInt(profesorId) } : null
    };

    try {
        if (id) {
            await apiFetch('/cursos/' + id, { method: 'PUT', body: JSON.stringify(body) });
        } else {
            await apiFetch('/cursos', { method: 'POST', body: JSON.stringify(body) });
        }
        cerrarModal('modalCurso');
        cargarCursos();
    } catch (err) {
        alert('Error: ' + err.message);
    }
});

cargarProfesoresSelect();
cargarCursos();

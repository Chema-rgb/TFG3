const user = obtenerUsuario();
const isAdmin = user?.rol === 'ADMIN';

if (!isAdmin) document.getElementById('btnNuevoProfesor').style.display = 'none';

async function cargarProfesores() {
    const tbody = document.getElementById('tbodyProfesores');
    var profesores = await llamarApi('/profesores');
    if (!profesores || profesores.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="8">No hay profesores registrados</td></tr>';
        return;
    }
    tbody.innerHTML = profesores.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.nombre}</td>
            <td>${p.apellidos}</td>
            <td>${p.dni || '-'}</td>
            <td>${p.telefono || '-'}</td>
            <td>${p.especialidad || '-'}</td>
            <td><span class="badge badge-${p.estado?.toLowerCase()}">${p.estado}</span></td>
            <td class="actions-cell">
                ${isAdmin ? `
                <button class="btn btn-sm btn-icon" onclick="editarProfesor(${p.id})">Editar</button>
                <button class="btn btn-sm btn-icon btn-danger" onclick="eliminarProfesor(${p.id})">Borrar</button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

document.getElementById('btnNuevoProfesor')?.addEventListener('click', () => {
    document.getElementById('formProfesor').reset();
    document.getElementById('profesorId').value = '';
    document.getElementById('modalProfesorTitle').textContent = 'Nuevo Profesor';
    abrirModal('modalProfesor');
});

async function editarProfesor(id) {
    const profesores = await llamarApi('/profesores');
    const p = profesores.find(x => x.id === id);
    if (!p) return;
    document.querySelector('#profesorId').value = p.id;
    document.querySelector('#profesorNombre').value = p.nombre;
    document.getElementById('profesorApellidos').value = p.apellidos;
    document.getElementById('profesorDni').value = p.dni || '';
    document.getElementById('profesorTelefono').value = p.telefono || '';
    document.getElementById('profesorEspecialidad').value = p.especialidad || '';
    document.getElementById('profesorEmail').value = p.email || '';
    document.getElementById('profesorEstado').value = p.estado;
    document.getElementById('modalProfesorTitle').textContent = 'Editar Profesor';
    abrirModal('modalProfesor');
}

async function eliminarProfesor(id) {
    if (!confirm('¿Eliminar este profesor?')) return;
    await llamarApi('/profesores/' + id, { method: 'DELETE' });
    cargarProfesores();
}

document.getElementById('formProfesor').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('profesorId').value;

    const body = {
        nombre: document.getElementById('profesorNombre').value,
        apellidos: document.getElementById('profesorApellidos').value,
        dni: document.getElementById('profesorDni').value,
        telefono: document.getElementById('profesorTelefono').value,
        especialidad: document.getElementById('profesorEspecialidad').value,
        email: document.getElementById('profesorEmail').value || null,
        estado: document.getElementById('profesorEstado').value
    };

    try {
        if (id) {
            await llamarApi('/profesores/' + id, { method: 'PUT', body: JSON.stringify(body) });
        } else {
            await llamarApi('/profesores', { method: 'POST', body: JSON.stringify(body) });
        }
        cerrarModal('modalProfesor');
        cargarProfesores();
    } catch (err) {
        alert('Error: ' + err.message);
    }
});

cargarProfesores();

const user = getUser();
const isAdmin = user?.rol === 'ADMIN';

if (!isAdmin) document.getElementById('btnNuevoAlumno').style.display = 'none';

async function cargarAlumnos() {
    const tbody = document.getElementById('tbodyAlumnos');
    const alumnos = await apiFetch('/alumnos');
    if (!alumnos || alumnos.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="7">No hay alumnos registrados</td></tr>';
        return;
    }
    tbody.innerHTML = alumnos.map(a => `
        <tr>
            <td>${a.id}</td>
            <td>${a.nombre}</td>
            <td>${a.apellidos}</td>
            <td>${a.dni || '-'}</td>
            <td>${a.telefono || '-'}</td>
            <td><span class="badge badge-${a.estado?.toLowerCase()}">${a.estado}</span></td>
            <td class="actions-cell">
                ${isAdmin ? `
                <button class="btn btn-sm btn-icon" onclick="editarAlumno(${a.id})">Editar</button>
                <button class="btn btn-sm btn-icon btn-danger" onclick="eliminarAlumno(${a.id})">Borrar</button>
                ` : '<button class="btn btn-sm btn-icon" onclick="verAlumno(' + a.id + ')">Ver</button>'}
            </td>
        </tr>
    `).join('');
}

document.getElementById('btnNuevoAlumno')?.addEventListener('click', () => {
    document.getElementById('formAlumno').reset();
    document.getElementById('alumnoId').value = '';
    document.getElementById('modalAlumnoTitle').textContent = 'Nuevo Alumno';
    abrirModal('modalAlumno');
});

async function editarAlumno(id) {
    const a = await apiFetch('/alumnos/' + id);
    document.getElementById('alumnoId').value = a.id;
    document.getElementById('alumnoNombre').value = a.nombre;
    document.getElementById('alumnoApellidos').value = a.apellidos;
    document.getElementById('alumnoDni').value = a.dni || '';
    document.getElementById('alumnoTelefono').value = a.telefono || '';
    document.getElementById('alumnoDireccion').value = a.direccion || '';
    document.getElementById('alumnoFechaNacimiento').value = a.fechaNacimiento || '';
    document.getElementById('alumnoEmail').value = a.email || '';
    document.getElementById('alumnoEstado').value = a.estado;
    document.getElementById('modalAlumnoTitle').textContent = 'Editar Alumno';
    abrirModal('modalAlumno');
}

async function eliminarAlumno(id) {
    if (!confirm('¿Eliminar este alumno?')) return;
    await apiFetch('/alumnos/' + id, { method: 'DELETE' });
    cargarAlumnos();
}

document.getElementById('formAlumno').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('alumnoId').value;

    const body = {
        nombre: document.getElementById('alumnoNombre').value,
        apellidos: document.getElementById('alumnoApellidos').value,
        dni: document.getElementById('alumnoDni').value,
        telefono: document.getElementById('alumnoTelefono').value,
        direccion: document.getElementById('alumnoDireccion').value,
        fechaNacimiento: document.getElementById('alumnoFechaNacimiento').value || null,
        email: document.getElementById('alumnoEmail').value || null,
        estado: document.getElementById('alumnoEstado').value,
    };

    try {
        if (id) {
            await apiFetch('/alumnos/' + id, { method: 'PUT', body: JSON.stringify(body) });
        } else {
            await apiFetch('/alumnos', { method: 'POST', body: JSON.stringify(body) });
        }
        cerrarModal('modalAlumno');
        cargarAlumnos();
    } catch (err) {
        alert('Error: ' + err.message);
    }
});

cargarAlumnos();

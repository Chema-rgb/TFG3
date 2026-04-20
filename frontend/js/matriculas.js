const user = obtenerUsuario();
const isAdmin = user?.rol === 'ADMIN';

if (!isAdmin) document.getElementById('btnNuevaMatricula').style.display = 'none';

async function cargarSelects() {
    const [alumnos, cursos] = await Promise.all([llamarApi('/alumnos'), llamarApi('/cursos')]);
    const selAlumno = document.getElementById('matriculaAlumno');
    const selCurso = document.getElementById('matriculaCurso');

    alumnos?.forEach(function(a) {
      const opt = document.createElement('option');
        opt.value = a.id;
        opt.textContent = a.nombre + ' ' + a.apellidos;
        selAlumno.appendChild(opt);
    });

    cursos?.forEach(function(c) {
        const opt = document.createElement('option');
        opt.value = c.id;
          opt.textContent = c.nombre;
        selCurso.appendChild(opt);
    });
}

async function cargarMatriculas() {
    const tbody = document.getElementById('tbodyMatriculas');
    var matriculas = await llamarApi('/matriculas');
    if (!matriculas || matriculas.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No hay matrículas registradas</td></tr>';
        return;
    }
    tbody.innerHTML = matriculas.map(m => `
        <tr>
            <td>${m.id}</td>
            <td>${m.alumno ? m.alumno.nombre + ' ' + m.alumno.apellidos : '-'}</td>
            <td>${m.curso?.nombre || '-'}</td>
            <td>${m.fechaMatricula || '-'}</td>
            <td><span class="badge badge-${m.estado?.toLowerCase()}">${m.estado}</span></td>
            <td class="actions-cell">
                ${isAdmin ? `
                <button class="btn btn-sm btn-icon" onclick="editarMatricula(${m.id})">Editar</button>
                <button class="btn btn-sm btn-icon btn-danger" onclick="eliminarMatricula(${m.id})">Borrar</button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

document.getElementById('btnNuevaMatricula')?.addEventListener('click', () => {
    document.getElementById('formMatricula').reset();
    document.getElementById('matriculaId').value = '';
    document.getElementById('modalMatriculaTitle').textContent = 'Nueva Matrícula';
    abrirModal('modalMatricula');
});

async function editarMatricula(id) {
    var matriculas = await llamarApi('/matriculas');
    const m = matriculas.find(x => x.id === id);
    if (!m) return;
    document.getElementById('matriculaId').value = m.id;
    document.getElementById('matriculaAlumno').value = m.alumno?.id || '';
    document.getElementById('matriculaCurso').value = m.curso?.id || '';
    document.getElementById('matriculaEstado').value = m.estado;
    document.getElementById('modalMatriculaTitle').textContent = 'Editar Matrícula';
    abrirModal('modalMatricula');
}

async function eliminarMatricula(id) {
    if (!confirm('¿Eliminar esta matrícula?')) return;
    await llamarApi('/matriculas/' + id, { method: 'DELETE' });
    cargarMatriculas();
}

document.getElementById('formMatricula').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('matriculaId').value;

    const body = {
        alumno: { id: parseInt(document.getElementById('matriculaAlumno').value) },
        curso: { id: parseInt(document.getElementById('matriculaCurso').value) },
        estado: document.getElementById('matriculaEstado').value
    };

    try {
        if (id) {
            await llamarApi('/matriculas/' + id, { method: 'PUT', body: JSON.stringify(body) });
        } else {
            await llamarApi('/matriculas', { method: 'POST', body: JSON.stringify(body) });
        }
        cerrarModal('modalMatricula');
        cargarMatriculas();
    } catch (err) {
        // si el curso está lleno muestro el modal de aviso
        if (err.message.includes('CURSO_COMPLETO')) {
            cerrarModal('modalMatricula');
            abrirModal('modalCursoCompleto');
        } else {
            alert('Error: ' + err.message);
        }
    }
});

cargarSelects();
cargarMatriculas();

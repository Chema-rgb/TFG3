async function cargarSelects() {
    const [alumnos, cursos] = await Promise.all([apiFetch('/alumnos'), apiFetch('/cursos')]);
    const selAlumno = document.getElementById('pagoAlumno');
    const selCurso = document.getElementById('pagoCurso');
    alumnos?.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.id;
        opt.textContent = a.nombre + ' ' + a.apellidos;
        selAlumno.appendChild(opt);
    });
    cursos?.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.nombre;
        selCurso.appendChild(opt);
    });
}

async function cargarPagos() {
    const tbody = document.getElementById('tbodyPagos');
    const pagos = await apiFetch('/pagos');
    if (!pagos || pagos.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="9">No hay pagos registrados</td></tr>';
        return;
    }
    tbody.innerHTML = pagos.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.alumno ? p.alumno.nombre + ' ' + p.alumno.apellidos : '-'}</td>
            <td>${p.curso?.nombre || '-'}</td>
            <td>${p.concepto || '-'}</td>
            <td>${p.importe}€</td>
            <td>${p.fechaPago || '-'}</td>
            <td>${p.fechaVencimiento || '-'}</td>
            <td><span class="badge badge-${p.estado?.toLowerCase()}">${p.estado}</span></td>
            <td class="actions-cell">
                <button class="btn btn-sm btn-icon" onclick="editarPago(${p.id})">Editar</button>
                <button class="btn btn-sm btn-icon btn-danger" onclick="eliminarPago(${p.id})">Borrar</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('btnNuevoPago').addEventListener('click', () => {
    document.getElementById('formPago').reset();
    document.getElementById('pagoId').value = '';
    document.getElementById('modalPagoTitle').textContent = 'Registrar Pago';
    abrirModal('modalPago');
});

async function editarPago(id) {
    const pagos = await apiFetch('/pagos');
    const p = pagos.find(x => x.id === id);
    if (!p) return;
    document.getElementById('pagoId').value = p.id;
    document.getElementById('pagoAlumno').value = p.alumno?.id || '';
    document.getElementById('pagoCurso').value = p.curso?.id || '';
    document.getElementById('pagoConcepto').value = p.concepto || '';
    document.getElementById('pagoImporte').value = p.importe;
    document.getElementById('pagoFecha').value = p.fechaPago || '';
    document.getElementById('pagoVencimiento').value = p.fechaVencimiento || '';
    document.getElementById('pagoEstado').value = p.estado;
    document.getElementById('pagoObservaciones').value = p.observaciones || '';
    document.getElementById('modalPagoTitle').textContent = 'Editar Pago';
    abrirModal('modalPago');
}

async function eliminarPago(id) {
    if (!confirm('¿Eliminar este pago?')) return;
    await apiFetch('/pagos/' + id, { method: 'DELETE' });
    cargarPagos();
}

document.getElementById('formPago').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('pagoId').value;
    const cursoId = document.getElementById('pagoCurso').value;

    const body = {
        alumno: { id: parseInt(document.getElementById('pagoAlumno').value) },
        curso: cursoId ? { id: parseInt(cursoId) } : null,
        concepto: document.getElementById('pagoConcepto').value,
        importe: parseFloat(document.getElementById('pagoImporte').value),
        fechaPago: document.getElementById('pagoFecha').value || null,
        fechaVencimiento: document.getElementById('pagoVencimiento').value || null,
        estado: document.getElementById('pagoEstado').value,
        observaciones: document.getElementById('pagoObservaciones').value
    };

    try {
        if (id) {
            await apiFetch('/pagos/' + id, { method: 'PUT', body: JSON.stringify(body) });
        } else {
            await apiFetch('/pagos', { method: 'POST', body: JSON.stringify(body) });
        }
        cerrarModal('modalPago');
        cargarPagos();
    } catch (err) {
        alert('Error: ' + err.message);
    }
});

cargarSelects();
cargarPagos();

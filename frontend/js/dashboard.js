const user = obtenerUsuario();

async function cargarEstadisticas() {
    const statsGrid = document.getElementById('statsGrid');
    const actionsGrid = document.getElementById('actionsGrid');

    const stats = [];
    const actions = [];

    if (user.rol === 'ADMIN') {
        // el admin ve todos los contadores
        const [alumnos, profesores, cursos, pagos] = await Promise.all([
            llamarApi('/alumnos'),
            llamarApi('/profesores'),
            llamarApi('/cursos'),
            llamarApi('/pagos')
        ]);

        stats.push(
            { number: alumnos?.length || 0,    label: 'Alumnos' },
            { number: profesores?.length || 0, label: 'Profesores' },
            { number: cursos?.length || 0,     label: 'Cursos' },
            { number: pagos?.length || 0,      label: 'Pagos Totales' }
        );

        actions.push(
            { icon: '👨‍🎓', label: 'Alumnos', href: 'alumnos.html' },
            { icon: '👨‍🏫', label: 'Profesores', href: 'profesores.html' },
            { icon: '📚', label: 'Cursos', href: 'cursos.html' },
            { icon: '📋', label: 'Matrículas', href: 'matriculas.html' },
            { icon: '💰', label: 'Pagos', href: 'pagos.html' },
            { icon: '⚙️', label: 'Administración', href: 'administracion.html' }
        );

    } else if (user.rol === 'PROFESOR') {
        const [alumnos, cursos] = await Promise.all([
            llamarApi('/alumnos'),
            llamarApi('/cursos')
        ]);
        stats.push(
            { number: alumnos?.length || 0, label: 'Total Alumnos' },
            { number: cursos?.length || 0,  label: 'Total Cursos' }
        );
        actions.push(
            { icon: '👨‍🎓', label: 'Alumnos', href: 'alumnos.html' },
            { icon: '📚', label: 'Cursos', href: 'cursos.html' },
            { icon: '📋', label: 'Matrículas', href: 'matriculas.html' }
        );

    } else {
        // si es alumno solo ve sus cursos y pagos
        actions.push(
            { icon: '📚', label: 'Mis Cursos', href: 'cursos.html' },
            { icon: '💰', label: 'Mis Pagos', href: 'pagos.html' }
        );
    }

    statsGrid.innerHTML = stats.map(s => `
        <div class="stat-card">
            <div class="stat-number">${s.number}</div>
            <div class="stat-label">${s.label}</div>
        </div>
    `).join('');

    actionsGrid.innerHTML = actions.map(a => `
        <div class="action-card" onclick="location.href='${a.href}'">
            <div class="action-icon">${a.icon}</div>
            <div class="action-label">${a.label}</div>
        </div>
    `).join('');
}

cargarEstadisticas();

const user = obtenerUsuario();

async function cargarEstadisticas() {
    const statsGrid = document.getElementById('statsGrid');
    const actionsGrid = document.getElementById('actionsGrid');

    var stats = [];
    var actions = [];

    if (user.rol === 'ADMIN') {
        // el admin ve todos los contadores
        var alumnos = await llamarApi('/alumnos');
        var profesores = await llamarApi('/profesores');
        var cursos = await llamarApi('/cursos');
        var pagos = await llamarApi('/pagos');

        stats.push({ number: alumnos ? alumnos.length : 0, label: 'Alumnos' });
        stats.push({ number: profesores ? profesores.length : 0, label: 'Profesores' });
        stats.push({ number: cursos ? cursos.length : 0, label: 'Cursos' });
        stats.push({ number: pagos ? pagos.length : 0, label: 'Pagos Totales' });

        actions.push({ icon: '👨‍🎓', label: 'Alumnos', href: 'alumnos.html' });
        actions.push({ icon: '👨‍🏫', label: 'Profesores', href: 'profesores.html' });
        actions.push({ icon: '📚', label: 'Cursos', href: 'cursos.html' });
        actions.push({ icon: '📋', label: 'Matrículas', href: 'matricula.html' });
        actions.push({ icon: '💰', label: 'Pagos', href: 'pagos_lista.html' });
        actions.push({ icon: '⚙️', label: 'Administración', href: 'admin.html' });

    } else if (user.rol === 'PROFESOR') {
        var alumnos = await llamarApi('/alumnos');
        var cursos = await llamarApi('/cursos');

        stats.push({ number: alumnos ? alumnos.length : 0, label: 'Total Alumnos' });
        stats.push({ number: cursos ? cursos.length : 0, label: 'Total Cursos' });

        actions.push({ icon: '👨‍🎓', label: 'Alumnos', href: 'alumnos.html' });
        actions.push({ icon: '📚', label: 'Cursos', href: 'cursos.html' });
        actions.push({ icon: '📋', label: 'Matrículas', href: 'matricula.html' });

    } else {
        // si es alumno solo ve sus cursos y pagos
        actions.push({ icon: '📚', label: 'Mis Cursos', href: 'cursos.html' });
        actions.push({ icon: '💰', label: 'Mis Pagos', href: 'pagos_lista.html' });
    }

    var htmlStats = '';
    for (var i = 0; i < stats.length; i++) {
        htmlStats += '<div class="stat-card">';
        htmlStats += '<div class="stat-number">' + stats[i].number + '</div>';
        htmlStats += '<div class="stat-label">' + stats[i].label + '</div>';
        htmlStats += '</div>';
    }
    statsGrid.innerHTML = htmlStats;

    var htmlActions = '';
    for (var j = 0; j < actions.length; j++) {
        htmlActions += '<div class="action-card" onclick="location.href=\'' + actions[j].href + '\'">';
        htmlActions += '<div class="action-icon">' + actions[j].icon + '</div>';
        htmlActions += '<div class="action-label">' + actions[j].label + '</div>';
        htmlActions += '</div>';
    }
    actionsGrid.innerHTML = htmlActions;
}

cargarEstadisticas();

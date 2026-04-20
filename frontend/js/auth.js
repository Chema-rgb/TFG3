const API = 'http://localhost:8082/api';

function obtenerToken() { return localStorage.getItem('token'); }
function obtenerUsuario() { return JSON.parse(localStorage.getItem('user') || 'null'); }

function cerrarSesion() {
    localStorage.clear();
    window.location.href = '/index.html';
}

function verificarAcceso() {
    if (!obtenerToken()) {
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

function verificarRol(...roles) {
    var user = obtenerUsuario();
    if (!user || !roles.includes(user.rol)) {
        window.location.href = '/pages/dashboard.html';
        return false;
    }
    return true;
}

// hace las peticiones al backend con el token en el header
async function llamarApi(path, opts = {}) {
    const tok = obtenerToken();
    const res = await fetch(API + path, {
        ...opts,
        headers: {
            'Content-Type': 'application/json',
            ...(tok ? { 'Authorization': 'Bearer ' + tok } : {}),
            ...(opts.headers || {})
        }
    });
    if (res.status === 401) { cerrarSesion(); return null; }
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || res.statusText);
    }
    if (res.status === 204) return null;
    return res.json();
}

// construye el menú según el rol del usuario
function construirMenu() {
    const user = obtenerUsuario();
    if (!user) return;

    const navUsername = document.getElementById('navUsername');
    const navRol = document.getElementById('navRol');
    const navLinks = document.getElementById('navLinks');

    if (navUsername) navUsername.textContent = user.username;
    if (navRol) {
        navRol.textContent = user.rol;
        navRol.className = 'badge badge-' + user.rol.toLowerCase();
    }

    if (!navLinks) return;

    const links = [
        { href: 'dashboard.html', label: 'Panel', roles: ['ADMIN', 'PROFESOR', 'ALUMNO'] },
        { href: 'alumnos.html', label: 'Alumnos', roles: ['ADMIN', 'PROFESOR'] },
        { href: 'profesores.html', label: 'Profesores', roles: ['ADMIN'] },
        { href: 'cursos.html', label: 'Cursos', roles: ['ADMIN', 'PROFESOR', 'ALUMNO'] },
        { href: 'matriculas.html', label: 'Matrículas', roles: ['ADMIN', 'PROFESOR'] },
        { href: 'pagos.html', label: 'Pagos', roles: ['ADMIN'] },
        { href: 'administracion.html', label: 'Administración', roles: ['ADMIN'] },
    ];

    // solo muestro los links que corresponden al rol del usuario
    links.filter(l => l.roles.includes(user.rol)).forEach(function(l) {
        const a = document.createElement('a');
        a.href = l.href;
        a.textContent = l.label;
        if (window.location.pathname.endsWith(l.href)) a.classList.add('active');
        navLinks.appendChild(a);
    });
}

function cerrarModal(id) {
    document.getElementById(id).style.display = 'none';
}

function abrirModal(id) {
    document.getElementById(id).style.display = 'flex';
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const errorEl = document.getElementById('loginError');
        errorEl.style.display = 'none';
        try {
            const res = await fetch(API + '/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  username: document.getElementById('username').value,
                    password: document.getElementById('password').value
                })
            });
            if (!res.ok) throw new Error('Credenciales incorrectas');
            const data = await res.json();
            console.log(data);
              localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({ username: data.username, rol: data.rol }));
            window.location.href = 'pages/dashboard.html';
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.style.display = 'block';
        }
    });
} else {
    if (!obtenerToken()) window.location.href = '/index.html';
    construirMenu();
}

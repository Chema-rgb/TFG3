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

// función genérica para todas las llamadas al backend
async function llamarApi(path, opts) {
    var metodo = opts ? opts.method || 'GET' : 'GET';
    var cuerpo = opts ? opts.body : null;
    var tok = obtenerToken();

    var cabeceras = { 'Content-Type': 'application/json' };
    if (tok) cabeceras['Authorization'] = 'Bearer ' + tok;

    var res = await fetch(API + path, {
        method: metodo,
        headers: cabeceras,
        body: cuerpo || null
    });

    if (res.status === 401) { cerrarSesion(); return null; }
    if (!res.ok) {
        var msg = await res.text();
        throw new Error(msg || 'Error en la petición');
    }
    if (res.status === 204) return null;
    return res.json();
}

// pongo los links del menú según el rol que tenga el usuario
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

// muestro un aviso verde abajo a la derecha cuando algo se guarda bien
function mostrarExito(msg) {
    var toast = document.createElement('div');
    toast.className = 'toast-ok';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(function() { document.body.removeChild(toast); }, 2500);
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

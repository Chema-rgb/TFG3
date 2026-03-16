package com.academia.controller;

import com.academia.model.Usuario;
import com.academia.repository.UsuarioRepository;
import com.academia.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping("/usuarios")
    public List<Usuario> listarUsuarios() {
        return usuarioService.listarTodos();
    }

    @PostMapping("/usuarios")
    public Usuario crearUsuario(@RequestBody UsuarioRequest req) {
        return usuarioService.crear(req.getUsername(), req.getPassword(), req.getEmail(), req.getRol());
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
        if (!usuarioRepository.existsById(id)) return ResponseEntity.notFound().build();
        usuarioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    public static class UsuarioRequest {
        private String username;
        private String password;
        private String email;
        private Usuario.Rol rol;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public Usuario.Rol getRol() { return rol; }
        public void setRol(Usuario.Rol rol) { this.rol = rol; }
    }
}

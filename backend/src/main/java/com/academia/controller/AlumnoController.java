package com.academia.controller;

import com.academia.model.Alumno;
import com.academia.repository.AlumnoRepository;
import com.academia.repository.MatriculaRepository;
import com.academia.repository.PagoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alumnos")
public class AlumnoController {

    @Autowired
    private AlumnoRepository alumnoRepository;

    @Autowired
    private PagoRepository pagoRepository;

    @Autowired
    private MatriculaRepository matriculaRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROFESOR')")
    public List<Alumno> listar() {
        return alumnoRepository.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESOR','ALUMNO')")
    public ResponseEntity<Alumno> obtener(@PathVariable Long id) {
        Alumno alumno = alumnoRepository.findById(id).orElse(null);
        if (alumno == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(alumno);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Alumno crear(@RequestBody Alumno alumno) {
        return alumnoRepository.save(alumno);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Alumno> actualizar(@PathVariable Long id, @RequestBody Alumno datos) {
        Alumno existing = alumnoRepository.findById(id).orElse(null);
        if (existing == null) return ResponseEntity.notFound().build();
        existing.setNombre(datos.getNombre());
        existing.setApellidos(datos.getApellidos());
        existing.setDni(datos.getDni());
        existing.setTelefono(datos.getTelefono());
        existing.setDireccion(datos.getDireccion());
        existing.setEmail(datos.getEmail());
        existing.setFechaNacimiento(datos.getFechaNacimiento());
        existing.setEstado(datos.getEstado());
        return ResponseEntity.ok(alumnoRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!alumnoRepository.existsById(id)) return ResponseEntity.notFound().build();
        pagoRepository.deleteByAlumnoId(id);
        matriculaRepository.deleteByAlumnoId(id);
        alumnoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

package com.academia.controller;

import com.academia.model.Curso;
import com.academia.model.Profesor;
import com.academia.repository.CursoRepository;
import com.academia.repository.ProfesorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/profesores")
public class ProfesorController {

    @Autowired
    private ProfesorRepository profesorRepository;

    @Autowired
    private CursoRepository cursoRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROFESOR')")
    public List<Profesor> listar() {
        return profesorRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> crear(@RequestBody Profesor profesor) {
        if (profesor.getDni() != null && !profesor.getDni().isEmpty()) {
            if (profesorRepository.findByDni(profesor.getDni()).isPresent()) {
                return ResponseEntity.badRequest().body("Ya existe un profesor con ese DNI");
            }
        }
        if (profesor.getTelefono() != null && !profesor.getTelefono().isEmpty()) {
            if (profesorRepository.findByTelefono(profesor.getTelefono()).isPresent()) {
                return ResponseEntity.badRequest().body("Ya existe un profesor con ese teléfono");
            }
        }
        return ResponseEntity.ok(profesorRepository.save(profesor));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Profesor datos) {
        Profesor prof = profesorRepository.findById(id).orElse(null);
        if (prof == null) return ResponseEntity.notFound().build();
        if (datos.getDni() != null && !datos.getDni().isEmpty()) {
            Optional<Profesor> existente = profesorRepository.findByDni(datos.getDni());
            if (existente.isPresent() && !existente.get().getId().equals(id)) {
                return ResponseEntity.badRequest().body("Ya existe un profesor con ese DNI");
            }
        }
        if (datos.getTelefono() != null && !datos.getTelefono().isEmpty()) {
            Optional<Profesor> existente = profesorRepository.findByTelefono(datos.getTelefono());
            if (existente.isPresent() && !existente.get().getId().equals(id)) {
                return ResponseEntity.badRequest().body("Ya existe un profesor con ese teléfono");
            }
        }
        prof.setNombre(datos.getNombre());
        prof.setApellidos(datos.getApellidos());
        prof.setDni(datos.getDni());
        prof.setTelefono(datos.getTelefono());
        prof.setEspecialidad(datos.getEspecialidad());
        prof.setEmail(datos.getEmail());
        prof.setEstado(datos.getEstado());
        return ResponseEntity.ok(profesorRepository.save(prof));
    }

    // si borro un profesor los cursos que tenía asignados se quedan sin nadie
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!profesorRepository.existsById(id)) return ResponseEntity.notFound().build();

        try {
            List<Curso> cursos = cursoRepository.findByProfesorId(id);
            for (Curso c : cursos) {
                c.setProfesor(null);
                cursoRepository.save(c);
            }
            profesorRepository.deleteById(id);
        } catch (Exception e) {
            // por si algo falla al desasignar los cursos
            System.out.println("error al borrar profesor: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }

        return ResponseEntity.noContent().build();
    }
}

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
    public Profesor crear(@RequestBody Profesor profesor) {
        return profesorRepository.save(profesor);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Profesor> actualizar(@PathVariable Long id, @RequestBody Profesor datos) {
        Profesor existing = profesorRepository.findById(id).orElse(null);
        if (existing == null) return ResponseEntity.notFound().build();
        existing.setNombre(datos.getNombre());
        existing.setApellidos(datos.getApellidos());
        existing.setDni(datos.getDni());
        existing.setTelefono(datos.getTelefono());
        existing.setEspecialidad(datos.getEspecialidad());
        existing.setEmail(datos.getEmail());
        existing.setEstado(datos.getEstado());
        return ResponseEntity.ok(profesorRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!profesorRepository.existsById(id)) return ResponseEntity.notFound().build();
        List<Curso> cursos = cursoRepository.findByProfesorId(id);
        for (Curso c : cursos) {
            c.setProfesor(null);
            cursoRepository.save(c);
        }
        profesorRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

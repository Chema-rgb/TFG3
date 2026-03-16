package com.academia.controller;

import com.academia.model.Matricula;
import com.academia.repository.MatriculaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matriculas")
public class MatriculaController {

    @Autowired
    private MatriculaRepository matriculaRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROFESOR')")
    public List<Matricula> listar() {
        return matriculaRepository.findAll();
    }

    @GetMapping("/alumno/{alumnoId}")
    public List<Matricula> porAlumno(@PathVariable Long alumnoId) {
        return matriculaRepository.findByAlumnoId(alumnoId);
    }

    @GetMapping("/curso/{cursoId}")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESOR')")
    public List<Matricula> porCurso(@PathVariable Long cursoId) {
        return matriculaRepository.findByCursoId(cursoId);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> crear(@RequestBody Matricula matricula) {
        Long alumnoId = matricula.getAlumno().getId();
        Long cursoId = matricula.getCurso().getId();

        if (matriculaRepository.existsByAlumnoIdAndCursoId(alumnoId, cursoId)) {
            return ResponseEntity.badRequest().body("El alumno ya está matriculado en este curso");
        }

        return ResponseEntity.ok(matriculaRepository.save(matricula));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Matricula> actualizar(@PathVariable Long id, @RequestBody Matricula matricula) {
        if (!matriculaRepository.existsById(id)) return ResponseEntity.notFound().build();
        matricula.setId(id);
        return ResponseEntity.ok(matriculaRepository.save(matricula));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!matriculaRepository.existsById(id)) return ResponseEntity.notFound().build();
        matriculaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

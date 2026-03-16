package com.academia.controller;

import com.academia.model.Curso;
import com.academia.repository.CursoRepository;
import com.academia.repository.HorarioRepository;
import com.academia.repository.MatriculaRepository;
import com.academia.repository.PagoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cursos")
public class CursoController {

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private MatriculaRepository matriculaRepository;

    @Autowired
    private PagoRepository pagoRepository;

    @Autowired
    private HorarioRepository horarioRepository;

    @GetMapping
    public List<Curso> listar() {
        return cursoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Curso> obtener(@PathVariable Long id) {
        Curso curso = cursoRepository.findById(id).orElse(null);
        if (curso == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(curso);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Curso crear(@RequestBody Curso curso) {
        return cursoRepository.save(curso);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Curso> actualizar(@PathVariable Long id, @RequestBody Curso datos) {
        Curso existing = cursoRepository.findById(id).orElse(null);
        if (existing == null) return ResponseEntity.notFound().build();
        existing.setNombre(datos.getNombre());
        existing.setDescripcion(datos.getDescripcion());
        existing.setNivel(datos.getNivel());
        existing.setCapacidad(datos.getCapacidad());
        existing.setPrecio(datos.getPrecio());
        existing.setProfesor(datos.getProfesor());
        existing.setEstado(datos.getEstado());
        return ResponseEntity.ok(cursoRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!cursoRepository.existsById(id)) return ResponseEntity.notFound().build();
        pagoRepository.deleteByCursoId(id);
        matriculaRepository.deleteByCursoId(id);
        horarioRepository.deleteByCursoId(id);
        cursoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

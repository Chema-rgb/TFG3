package com.academia.controller;

import com.academia.model.Horario;
import com.academia.repository.HorarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/horarios")
public class HorarioController {

    @Autowired
    private HorarioRepository horarioRepository;

    @GetMapping
    public List<Horario> listar() {
        return horarioRepository.findAll();
    }

    // horarios filtrados por curso
    @GetMapping("/curso/{cursoId}")
    public List<Horario> porCurso(@PathVariable Long cursoId) {
        return horarioRepository.findByCursoId(cursoId);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Horario crear(@RequestBody Horario horario) {
        return horarioRepository.save(horario);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!horarioRepository.existsById(id)) return ResponseEntity.notFound().build();
        horarioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

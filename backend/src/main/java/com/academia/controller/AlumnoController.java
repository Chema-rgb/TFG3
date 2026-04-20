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
import java.util.Optional;

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
    public ResponseEntity<?> crear(@RequestBody Alumno alumno) {
        // compruebo que el dni no esté ya usado
        if (alumno.getDni() != null && !alumno.getDni().isEmpty()) {
            if (alumnoRepository.findByDni(alumno.getDni()).isPresent()) {
                return ResponseEntity.badRequest().body("Ya existe un alumno con ese DNI");
            }
        }
        if (alumno.getTelefono() != null && !alumno.getTelefono().isEmpty()) {
            if (alumnoRepository.findByTelefono(alumno.getTelefono()).isPresent()) {
                return ResponseEntity.badRequest().body("Ya existe un alumno con ese teléfono");
            }
        }
        return ResponseEntity.ok(alumnoRepository.save(alumno));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Alumno datos) {
        Alumno alumno = alumnoRepository.findById(id).orElse(null);
        if (alumno == null) return ResponseEntity.notFound().build();

        // si cambia el dni compruebo que no lo tenga ya otro alumno
        if (datos.getDni() != null && !datos.getDni().isEmpty()) {
            Optional<Alumno> existente = alumnoRepository.findByDni(datos.getDni());
            if (existente.isPresent() && !existente.get().getId().equals(id)) {
                return ResponseEntity.badRequest().body("Ya existe un alumno con ese DNI");
            }
        }
        if (datos.getTelefono() != null && !datos.getTelefono().isEmpty()) {
            Optional<Alumno> existente = alumnoRepository.findByTelefono(datos.getTelefono());
            if (existente.isPresent() && !existente.get().getId().equals(id)) {
                return ResponseEntity.badRequest().body("Ya existe un alumno con ese teléfono");
            }
        }

        // por si acaso compruebo que el nombre no venga vacío
        if (datos.getNombre() != null && !datos.getNombre().isEmpty()) {
            alumno.setNombre(datos.getNombre());
        }
        alumno.setApellidos(datos.getApellidos());
        alumno.setDni(datos.getDni());
        alumno.setTelefono(datos.getTelefono());
        alumno.setDireccion(datos.getDireccion());
        alumno.setEmail(datos.getEmail());
        alumno.setFechaNacimiento(datos.getFechaNacimiento());
        alumno.setEstado(datos.getEstado());

        System.out.println("alumno actualizado: " + id);
        return ResponseEntity.ok(alumnoRepository.save(alumno));
    }


    // al borrar un alumno hay que borrar también sus pagos y matrículas
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

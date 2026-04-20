package com.academia.controller;

import com.academia.model.Pago;
import com.academia.repository.PagoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    @Autowired
    private PagoRepository pagoRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Pago> listar() {
        return pagoRepository.findAll();
    }

    // pagos de un alumno concreto
    @GetMapping("/alumno/{alumnoId}")
    public List<Pago> porAlumno(@PathVariable Long alumnoId) {
        return pagoRepository.findByAlumnoId(alumnoId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Pago> obtener(@PathVariable Long id) {
        Pago pago = pagoRepository.findById(id).orElse(null);
        if (pago == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(pago);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Pago crear(@RequestBody Pago pago) {
        return pagoRepository.save(pago);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Pago> actualizar(@PathVariable Long id, @RequestBody Pago datos) {
        Pago pago = pagoRepository.findById(id).orElse(null);
        if (pago == null) return ResponseEntity.notFound().build();
        pago.setAlumno(datos.getAlumno());
        pago.setCurso(datos.getCurso());
        pago.setImporte(datos.getImporte());
        pago.setFechaPago(datos.getFechaPago());
        pago.setFechaVencimiento(datos.getFechaVencimiento());
        pago.setEstado(datos.getEstado());
        pago.setConcepto(datos.getConcepto());
        pago.setObservaciones(datos.getObservaciones());
        return ResponseEntity.ok(pagoRepository.save(pago));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!pagoRepository.existsById(id)) return ResponseEntity.notFound().build();
        pagoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

package com.academia.config;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

// captura los errores de base de datos y devuelve un mensaje más claro
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrity(DataIntegrityViolationException ex) {
        String msg = "Error de integridad de datos";
        String cause = ex.getMostSpecificCause().getMessage();

        // miro qué tipo de error es para dar un mensaje entendible
        if (cause.contains("unique constraint")) {
            if (cause.contains("username")) {
                msg = "El nombre de usuario ya existe";
            } else if (cause.contains("email")) {
                msg = "El email ya existe";
            } else if (cause.contains("dni")) {
                msg = "El DNI ya existe";
            } else {
                msg = "Ya existe un registro con esos datos";
            }
        } else if (cause.contains("foreign key")) {
            msg = "No se puede realizar la operación: existen registros relacionados";
        }

        Map<String, String> body = new HashMap<>();
        body.put("error", msg);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }
}

package com.academia;

import com.academia.model.Usuario;
import com.academia.repository.UsuarioRepository;
import com.academia.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@RequiredArgsConstructor
public class AcademiaApplication {

    public static void main(String[] args) {
        SpringApplication.run(AcademiaApplication.class, args);
    }

    @Bean
    CommandLineRunner initData(UsuarioRepository usuarioRepository, UsuarioService usuarioService) {
        return args -> {
            // Crear admin por defecto si no existe
            if (!usuarioRepository.existsByUsername("admin")) {
                usuarioService.crear("admin", "admin123", "admin@academia.com", Usuario.Rol.ADMIN);
                System.out.println("Usuario admin creado: admin / admin123");
            }
        };
    }
}

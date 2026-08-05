package cm.merombe.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import cm.merombe.backend.repository.LocalRepository;
import cm.merombe.backend.repository.VilleRepository;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	// Verification temporaire de la lecture, a supprimer plus tard
	@Bean
	CommandLineRunner testerLecture(VilleRepository villes, LocalRepository locaux) {
		return args -> {
			System.out.println("=== Villes : " + villes.count() + " ===");
			System.out.println("=== Locaux : " + locaux.count() + " ===");
			locaux.findAll().forEach(l ->
				System.out.println("  - " + l.getQuartier() + " -> " + l.getPosition()));
		};
	}

}
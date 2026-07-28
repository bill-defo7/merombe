package cm.merombe.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import cm.merombe.backend.repository.VilleRepository;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	// Verification temporaire : on prouve que Java lit bien la base.
	// A supprimer une fois la lecture confirmee.
	@Bean
	CommandLineRunner testerLectureVilles(VilleRepository villes) {
		return args -> {
			System.out.println("=== Villes en base : " + villes.count() + " ===");
			villes.findAll().forEach(v ->
				System.out.println("  - " + v.getNom() + " (" + v.getRegion() + ")"));
		};
	}

}
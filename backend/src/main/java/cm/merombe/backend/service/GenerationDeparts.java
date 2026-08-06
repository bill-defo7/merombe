package cm.merombe.backend.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cm.merombe.backend.entity.Depart;
import cm.merombe.backend.entity.Horaire;
import cm.merombe.backend.repository.DepartRepository;
import cm.merombe.backend.repository.HoraireRepository;

/**
 * Fabrique les departs reels des prochains jours a partir des
 * horaires recurrents declares par les agences.
 */
@Service
public class GenerationDeparts {

    // on remplit toujours deux semaines d'avance
    private static final int JOURS_A_GENERER = 14;

    private final HoraireRepository horaires;
    private final DepartRepository departs;

    public GenerationDeparts(HoraireRepository horaires, DepartRepository departs) {
        this.horaires = horaires;
        this.departs = departs;
    }

    // chaque nuit a 2h du matin
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public int genererProchainsJours() {
        int crees = 0;
        List<Horaire> tous = horaires.findAll();
        LocalDate aujourdhui = LocalDate.now();

        for (int jour = 0; jour < JOURS_A_GENERER; jour++) {
            LocalDate date = aujourdhui.plusDays(jour);
            for (Horaire horaire : tous) {
                if (!circuleLe(horaire.getJours(), date)) {
                    continue;
                }
                // ne jamais creer deux fois le meme depart
                if (departs.existsByHoraireIdAndDateDepart(horaire.getId(), date)) {
                    continue;
                }
                departs.save(new Depart(horaire, date, horaire.getPlaces()));
                crees++;
            }
        }

        System.out.println(">>> Generation des departs : " + crees + " cree(s)");
        return crees;
    }

    /**
     * Interprete le champ 'jours' : 'tous' ou une liste comme 'lun,mer,ven'.
     */
    boolean circuleLe(String jours, LocalDate date) {
        if (jours == null || jours.isBlank() || "tous".equalsIgnoreCase(jours.trim())) {
            return true;
        }
        Set<String> declares = Set.of(jours.toLowerCase().split("\\s*,\\s*"));
        return declares.contains(abreviation(date.getDayOfWeek()));
    }

    private String abreviation(DayOfWeek jour) {
        return switch (jour) {
            case MONDAY -> "lun";
            case TUESDAY -> "mar";
            case WEDNESDAY -> "mer";
            case THURSDAY -> "jeu";
            case FRIDAY -> "ven";
            case SATURDAY -> "sam";
            case SUNDAY -> "dim";
        };
    }
}
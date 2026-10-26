import type { Dict } from './index';

export const de: Dict = {
  // meta
  meta_title: "Ashutosh Nayak — Agentic-AI-Ingenieur, Cloud/DevOps",
  meta_description:
    "Ashutosh Nayak baut Agenten, die Software bauen, und die Cloud-Systeme, auf denen sie laufen: Agentic AI, Agentic SDLC, GenAI, AWS, Terraform und CI/CD. Ansässig in Indien.",

  // chapter labels
  chapter_word: "Kapitel",
  chapter_00: "00",
  chapter_01: "01",
  chapter_02: "02",
  chapter_03: "03",
  chapter_04: "04",
  chapter_05: "05",
  chapter_06: "06",
  chapter_07: "07",

  // nav
  nav_aria: "Hauptnavigation",
  nav_skip: "Zum Inhalt springen",
  nav_stats: "Im Einsatz",
  nav_voice: "Ein Anruf",
  nav_agents: "Agenten",
  nav_infra: "Infrastruktur",
  nav_work: "Projekte",
  nav_path: "Werdegang",
  nav_contact: "Kontakt",
  nav_cta: "Sprechen wir",
  nav_language_label: "Sprache",
  nav_mode_to_light: "Zum hellen Modus wechseln",
  nav_mode_to_dark: "Zum dunklen Modus wechseln",
  nav_menu_open: "Menü öffnen",
  nav_menu_close: "Menü schließen",
  lang_name_en: "English",
  lang_name_de: "Deutsch",
  lang_name_nl: "Nederlands",
  lang_name_pl: "Polski",

  // loader
  loader_initialising: "Wird initialisiert",
  loader_orchestrator: "Der Orchestrator erwacht",
  loader_shaping: "Der Kern nimmt Form an",
  loader_aligning: "Die Ringe werden ausgerichtet",
  loader_ready: "Bereit",
  loader_skip: "Klicken zum Überspringen",
  loader_progress_aria: "Lädt, {pct} Prozent",

  // 00 hero
  hero_name: "Ashutosh Nayak",
  hero_role: "GenAI-Entwickler & Cloud/DevOps-Ingenieur",
  hero_eyebrow: "00 · Hallo",
  hero_promise_1: "Ich baue Agenten, die Software bauen.",
  hero_promise_2: "Und die Systeme, auf denen sie laufen.",
  hero_context_1: "Ingenieur für Agentic AI und Agentic SDLC.",
  hero_context_2: "GenAI und Cloud/DevOps · Indien · 5+ Jahre.",
  hero_cta: "Sehen Sie sich ein System von Anfang bis Ende an",
  hero_cta_secondary: "Kontakt aufnehmen",
  hero_visual_label: "Animierte goldene Engine: leuchtende Ringe um einen facettierten Kern, durchzogen von elektrischen Signalen",

  // 01 stats
  stats_eyebrow: "01 · Im Einsatz",
  stats_headline: "Zahlen, mit ihrem Geltungsbereich.",
  stats_vessels_label: "Schiffe verfolgt",
  stats_vessels_scope: "Track-&-Trace-Plattform für einen 3PL",
  stats_provisioning_label: "Bereitstellungszeit",
  stats_provisioning_scope: "n8n + Terraform, IaC auf Abruf",
  stats_uptime_label: "Plattform-Verfügbarkeit",
  stats_uptime_scope: "Enterprise-AWS-Hosting-Plattform",
  stats_certs_label: "AWS-Zertifizierungen",
  stats_certs_scope: "darunter GenAI Developer Professional, Early Adopter",
  stats_years_label: "Jahre Erfahrung",
  stats_years_scope: "von Full Stack bis Agentic AI und DevOps",

  // 02 one call
  voice_eyebrow: "02 · Ein Anruf, Schritt für Schritt",
  voice_headline: "Ein Anrufer spricht seine Sprache. Der Bot antwortet darin. Live.",
  voice_lead:
    "Ich habe diesen mehrsprachigen Voice-Bot von Anfang bis Ende gebaut, und er läuft produktiv. Verfolgen Sie einen Hindi-Anruf vom ersten Klingeln bis zur gesprochenen Antwort.",
  voice_languages: "हिन्दी · Englisch · internationale Sprachen",
  voice_ring_title: "Klingeln",
  voice_ring_body: "Der Anruf kommt über SIP aus dem Telefonnetz, landet auf Asterisk und wird an LiveKit übergeben.",
  voice_hear_title: "Hören",
  voice_hear_body: "Streaming-Spracherkennung (STT) transkribiert den Anrufer, noch während er spricht.",
  voice_translate_title: "Übersetzen",
  voice_translate_body: "Echtzeit-Übersetzung (RTT) trägt die Worte des Anrufers zum Bot und die Antwort des Bots in der Sprache des Anrufers zurück.",
  voice_think_title: "Denken",
  voice_think_body: "Ein selbst gehostetes LLM, das ich bereitgestellt habe, erarbeitet die Antwort.",
  voice_speak_title: "Sprechen",
  voice_speak_body: "Sprachsynthese (TTS) antwortet in der Sprache des Anrufers, direkt zurück in die Leitung.",
  voice_monitor_title: "Im Betrieb überwacht",
  voice_monitor_row_1: "Anrufpfad",
  voice_monitor_row_2: "Sprache und Übersetzung",
  voice_monitor_row_3: "Modell-Serving",

  // 03 agents
  agents_eyebrow: "03 · Wie ich mit Agenten baue",
  agents_headline: "Eine Spezifikation. Ein Schwarm von Agenten. Ein geprüftes Release.",
  agents_lead:
    "Ich habe für mein Team ein Agentic-SDLC-Framework gebaut und arbeite bei allem spezifikationsgetrieben. Hier läuft es auf einer Mail-Service-Plattform: eine User Story, von der Spezifikation bis zum gemergten Code.",
  agents_pill_spec: "SPEC",
  agents_pill_plan: "PLAN",
  agents_pill_build: "BAUEN",
  agents_pill_verify: "PRÜFEN",
  agents_pill_ship: "RELEASE",
  agents_gate_1: "Gate 1 · Spezifikation",
  agents_gate_2: "Gate 2 · Plan",
  agents_gate_3: "Gate 3 · Merge",
  agents_approved: "freigegeben",
  agents_status_spec: "Ein Design-Agent interviewt mich und schreibt die Spezifikation. Ein Reviewer in einer frischen Sitzung prüft sie.",
  agents_status_plan: "Der Developer-Agent ordnet jede Anforderung einer Aufgabe zu. Der Plan wird per Skript geprüft.",
  agents_status_build: "Agenten bauen Aufgabe für Aufgabe, test-first, parallel, jeweils in einer frischen Sitzung.",
  agents_status_verify: "Build, Tests, Mutation Testing und statische Analyse, danach ein unabhängiges Code-Review.",
  agents_status_ship: "Ein Mensch mergt an Gate 3. Die Pipeline deployt.",
  agents_limits: "Agenten geben nie frei, mergen nie und deployen nie. Das tue ich.",

  // 04 infra
  infra_eyebrow: "04 · Infrastruktur erwacht",
  infra_headline: "Intelligenz braucht einen Ort zum Laufen.",
  infra_lead:
    "Terraform und n8n für Infrastruktur auf Abruf, eine Enterprise-AWS-Plattform, die sich selbst heilt, CloudWatch, das sie überwacht, und CI/CD, das sie ausliefert.",
  infra_chip_aria: "Illustration eines CPU- und GPU-Chips, der Block für Block aufleuchtet",
  infra_chip_compute: "COMPUTE",
  infra_chip_schedulers: "SCHEDULER",
  infra_chip_cache: "CACHE",
  infra_chip_inference: "INFERENZ",
  infra_chip_agents: "AGENTEN",
  infra_chip_memory: "EINHEITLICHER SPEICHER · DATEN",
  infra_chip_cicd: "CI/CD",
  infra_chip_observability: "OBSERVABILITY",
  infra_chip_network: "NETZWERK",
  infra_term_1: "power on ✓",
  infra_term_2: "terraform apply ✓ Compute online",
  infra_term_3: "serve llm ✓ Inferenz bereit",
  infra_term_4: "agents start ✓ orchestriert",
  infra_term_5: "pipeline deploy ✓ blue/green",
  infra_term_6: "cloudwatch ✓ alles gesund",

  // 05 work
  work_eyebrow: "05 · Ausgewählte Projekte",
  work_headline: "Was ich gebaut und am Laufen gehalten habe.",
  work_featured: "Im Fokus",
  work_problem: "Problem",
  work_approach: "Ansatz",
  work_stack: "Stack",
  work_outcome: "Ergebnis",

  proj_voice_category: "Voice AI",
  proj_voice_title: "Mehrsprachiger Voice-Bot",
  proj_voice_problem: "Anrufer wollen ihre eigene Sprache sprechen und trotzdem eine echte Antwort auf einer Live-Telefonleitung bekommen.",
  proj_voice_approach:
    "LiveKit, SIP und Asterisk tragen den Anruf. Streaming-STT, Echtzeit-Übersetzung, ein selbst gehostetes LLM und TTS antworten in der Sprache des Anrufers, mit Monitoring rundherum.",
  proj_voice_outcome: "Von mir von Anfang bis Ende gebaut und im Produktivbetrieb.",

  proj_sdlc_category: "Agentic SDLC",
  proj_sdlc_title: "Agentic-SDLC-Framework",
  proj_sdlc_problem: "KI-Agenten schreiben schnell Code. Ohne Struktur kann niemand dem vertrauen, was sie ausliefern.",
  proj_sdlc_approach:
    "Spezifikationsgetrieben, in zwei Phasen, geführt von spezialisierten Rollen-Agenten. Aufgaben entstehen test-first in frischen Sitzungen, werden unabhängig geprüft, und ein Mensch gibt jedes der drei Gates frei.",
  proj_sdlc_outcome: "Für mein Team gebaut und in meiner gesamten Arbeit im Einsatz. Agenten geben nie frei, mergen nie und deployen nie.",
  proj_sdlc_repo_label: "Das Framework auf GitHub ansehen",

  proj_rag_category: "GenAI",
  proj_rag_title: "RAG-Chatbot mit Agentic AI",
  proj_rag_problem: "Enterprise-Workflows brauchten einen Assistenten, der handeln kann und nicht nur antwortet.",
  proj_rag_approach:
    "Konversations-KI auf Enterprise-Niveau, angetrieben von AWS Bedrock mit Tool-Aufrufen für dynamische Aufgabenausführung, Prompt Engineering und LLM-Fine-Tuning.",
  proj_rag_outcome: "Dynamische Aufgabenausführung über Enterprise-Workflows hinweg.",

  proj_scraping_category: "Agentic AI",
  proj_scraping_title: "Agentic Scraping + MCP",
  proj_scraping_problem: "Scraper brechen, wenn sich Seiten ändern.",
  proj_scraping_approach:
    "Selbstheilendes Web-Scraping mit natürlichsprachiger Steuerung. Ein MCP-Server bindet E-Mail, Excel-Protokollierung, Anomalieerkennung und Datenbank-Updates in Echtzeit ein.",
  proj_scraping_outcome: "Ein Scraper, der sich selbst repariert und meldet, was er findet.",

  proj_track_category: "Logistik-KI",
  proj_track_title: "Track & Trace — 3PL",
  proj_track_problem: "Supply-Chain-Teams brauchten Echtzeit-Schiffssichtbarkeit und verlässliche ETAs.",
  proj_track_approach:
    "AIS-Feeds, Geofencing und eine interaktive Weltkarte, mit ML-Algorithmen und LLM-gestütztem Schlussfolgern über Fahrpläne, Hafenstau und Ereignisse. GenAI-Analytik (Qlik, ThoughtSpot, RAG-Dashboards) in 5+ Anwendungen ergänzt.",
  proj_track_outcome: "15.000+ Schiffe weltweit verfolgt bei 99 % Verfügbarkeit und Analytik für 300+ globale Nutzer.",

  proj_hosting_category: "Cloud-Plattform",
  proj_hosting_title: "Cloud-Hosting-Plattform für Unternehmen",
  proj_hosting_problem: "Mehrere Unternehmensanwendungen brauchten ein verlässliches Zuhause.",
  proj_hosting_approach:
    "Eine zentralisierte AWS-Hosting-Plattform, End-to-End-IaC mit Terraform, automatisiertes Monitoring, Self-Healing und Alerting.",
  proj_hosting_outcome: "99 %+ Plattform-Verfügbarkeit.",

  proj_n8n_category: "Automatisierung",
  proj_n8n_title: "n8n Terraform-Automatisierung",
  proj_n8n_problem: "Infrastruktur sollte auf Abruf bereitgestellt werden.",
  proj_n8n_approach: "Eine n8n-Pipeline, die Terraform-Skripte auf Abruf erzeugt.",
  proj_n8n_outcome: "80 % weniger Bereitstellungszeit für Infrastruktur.",

  proj_drainage_category: "IoT · Hackathon",
  proj_drainage_title: "Smart Drainage System — Gewinner",
  proj_drainage_problem: "Überflutung braucht frühe Erkennung und Echtzeit-Steuerung.",
  proj_drainage_approach:
    "Ein IoT-basiertes intelligentes Entwässerungssystem mit Hochwassererkennung und Echtzeit-Management, gebaut für die Regierung von Odisha.",
  proj_drainage_outcome: "Gewinner des Smart Odisha Hackathon 2018.",

  // path
  path_eyebrow: "06 · Werdegang",
  path_headline: "Wie ich hierher kam.",
  path_dates_1: "Jun 2025 → heute",
  path_dates_2: "Jun 2023 → Jun 2025",
  path_dates_3: "Jun 2021 → Mär 2023",
  path_dates_4: "2018",
  path_dates_5: "2017 → 2021",
  path_title_1: "Senior Technical Manager, DevOps & Innovation Lead",
  path_title_2: "Technical Manager, DevOps & Innovation Lead",
  path_title_3: "Full Stack & Cloud Platform Engineer",
  path_title_4: "Smart Odisha Hackathon, Gewinner",
  path_title_5: "B.Tech, Informatik",
  path_org_cozentus: "Cozentus Technologies",
  path_org_hackathon: "Regierung von Odisha / BPUT",
  path_org_college: "Silicon Institute of Technology",
  path_body_1: "Im Jun 2025 befördert. Weiterhin Leiter für DevOps und Innovation.",
  path_body_2:
    "RAG-Chatbot mit Agentic AI auf AWS Bedrock, selbstheilendes Agentic Scraping mit MCP und n8n + Terraform-Automatisierung, die die Bereitstellungszeit um 80 % senkte. Cloud-Kostenoptimierung und CloudWatch-Monitoring. 15+ Cloud- und GenAI-Workshops für 20+ Entwickler. Vier Jahre in Folge CEO-Bonus, 95 % Projekterfolgsquote.",
  path_body_3:
    "KI-gestützte Schiffsverfolgung für einen 3PL mit prädiktiven ETAs für 15.000+ Schiffe. AWS-Hosting für unternehmenskritische Supply-Chain-Anwendungen und CI/CD-Pipelines für 10+ Anwendungen.",
  path_body_4: "Gewonnen mit dem Smart Drainage System, gebaut während des Studiums.",
  path_body_5: "Hier hat alles begonnen.",

  // credentials
  credentials_eyebrow: "06 · Zertifizierungen",
  credentials_headline: "Vier AWS-Zertifizierungen, auf Credly verifiziert.",
  credentials_verify: "Prüfen ↗",
  credentials_early: "Early Adopter",

  // skills
  skills_eyebrow: "06 · Werkzeugkasten",
  skills_headline: "Womit ich arbeite.",
  skill_genai: "GenAI-Stack",
  skill_aws: "AWS Cloud",
  skill_devops: "DevOps & Infrastruktur",
  skill_langs: "Sprachen & Frameworks",
  skill_aiml: "KI / ML & Analytik",
  skill_security: "Sicherheit & Netzwerk",

  // 07 contact
  contact_eyebrow: "07 · Kontakt",
  contact_headline: "Bauen wir das nächste.",
  contact_lead: "E-Mail ist der beste Einstieg.",
  contact_email_label: "E-Mail",
  contact_linkedin_label: "LinkedIn",
  contact_github_label: "GitHub",

  // footer
  footer_copyright: "© 2026 Ashutosh Nayak",
  footer_location: "Indien",
  footer_top: "Nach oben",
};

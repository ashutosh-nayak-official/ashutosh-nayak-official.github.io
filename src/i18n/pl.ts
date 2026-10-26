import type { Dict } from './index';

export const pl: Dict = {
  // meta
  meta_title: "Ashutosh Nayak — inżynier Agentic AI, Cloud/DevOps",
  meta_description:
    "Ashutosh Nayak buduje agentów, które budują oprogramowanie, oraz systemy chmurowe, na których działają: agentic AI, Agentic SDLC, GenAI, AWS, Terraform i CI/CD. Pracuje w Indiach.",

  // chapter labels
  chapter_word: "Rozdział",
  chapter_00: "00",
  chapter_01: "01",
  chapter_02: "02",
  chapter_03: "03",
  chapter_04: "04",
  chapter_05: "05",
  chapter_06: "06",
  chapter_07: "07",

  // nav
  nav_aria: "Nawigacja główna",
  nav_skip: "Przejdź do treści",
  nav_stats: "Na produkcji",
  nav_voice: "Jedna rozmowa",
  nav_agents: "Agenci",
  nav_infra: "Infrastruktura",
  nav_work: "Projekty",
  nav_path: "Ścieżka",
  nav_contact: "Kontakt",
  nav_cta: "Porozmawiajmy",
  nav_language_label: "Język",
  nav_mode_to_light: "Przełącz na tryb jasny",
  nav_mode_to_dark: "Przełącz na tryb ciemny",
  nav_menu_open: "Otwórz menu",
  nav_menu_close: "Zamknij menu",
  lang_name_en: "English",
  lang_name_de: "Deutsch",
  lang_name_nl: "Nederlands",
  lang_name_pl: "Polski",

  // loader
  loader_initialising: "Inicjalizacja",
  loader_orchestrator: "Budzenie orkiestratora",
  loader_shaping: "Kształtowanie rdzenia",
  loader_aligning: "Ustawianie pierścieni",
  loader_ready: "Gotowe",
  loader_skip: "kliknij, aby pominąć",
  loader_progress_aria: "Ładowanie, {pct} procent",

  // 00 hero
  hero_name: "Ashutosh Nayak",
  hero_role: "Programista GenAI i inżynier Cloud/DevOps",
  hero_eyebrow: "00 · Cześć",
  hero_promise_1: "Buduję agentów, które budują oprogramowanie.",
  hero_promise_2: "I systemy, na których działają.",
  hero_context_1: "Inżynier agentic AI i Agentic SDLC.",
  hero_context_2: "GenAI i Cloud/DevOps · Indie · 5+ lat.",
  hero_cta: "Zobacz jeden system, od początku do końca",
  hero_cta_secondary: "Skontaktuj się",
  hero_visual_label: "Animowany złoty silnik: świecące pierścienie wokół fasetowanego rdzenia, z elektrycznymi sygnałami",

  // 01 stats
  stats_eyebrow: "01 · Na produkcji",
  stats_headline: "Liczby, z zakresem, którego dotyczą.",
  stats_vessels_label: "śledzonych statków",
  stats_vessels_scope: "platforma Track & Trace dla firmy 3PL",
  stats_provisioning_label: "czasu udostępniania infrastruktury",
  stats_provisioning_scope: "n8n + Terraform, IaC na żądanie",
  stats_uptime_label: "dostępności platformy",
  stats_uptime_scope: "korporacyjna platforma hostingowa AWS",
  stats_certs_label: "certyfikaty AWS",
  stats_certs_scope: "w tym GenAI Developer Professional, Early Adopter",
  stats_years_label: "lat doświadczenia",
  stats_years_scope: "od full stack po agentic AI i DevOps",

  // 02 one call
  voice_eyebrow: "02 · Jedna rozmowa, krok po kroku",
  voice_headline: "Dzwoniący mówi w swoim języku. Bot odpowiada w nim. Na żywo.",
  voice_lead:
    "Zbudowałem tego wielojęzycznego voicebota od początku do końca i działa na produkcji. Prześledź jedną rozmowę po hindi od pierwszego dzwonka do wypowiedzianej odpowiedzi.",
  voice_languages: "हिन्दी · angielski · języki międzynarodowe",
  voice_ring_title: "Dzwonek",
  voice_ring_body: "Połączenie przychodzi z sieci telefonicznej przez SIP, trafia do Asterisk i zostaje przekazane do LiveKit.",
  voice_hear_title: "Słuchanie",
  voice_hear_body: "Strumieniowe rozpoznawanie mowy (STT) transkrybuje dzwoniącego, gdy jeszcze mówi.",
  voice_translate_title: "Tłumaczenie",
  voice_translate_body: "Tłumaczenie w czasie rzeczywistym (RTT) przekazuje słowa dzwoniącego botowi, a odpowiedź bota z powrotem w języku dzwoniącego.",
  voice_think_title: "Myślenie",
  voice_think_body: "Samodzielnie hostowany LLM, który wdrożyłem, wypracowuje odpowiedź.",
  voice_speak_title: "Mówienie",
  voice_speak_body: "Synteza mowy (TTS) odpowiada w języku dzwoniącego, prosto z powrotem do linii.",
  voice_monitor_title: "Monitorowane na produkcji",
  voice_monitor_row_1: "Ścieżka połączenia",
  voice_monitor_row_2: "Mowa i tłumaczenie",
  voice_monitor_row_3: "Serwowanie modelu",

  // 03 agents
  agents_eyebrow: "03 · Jak buduję z agentami",
  agents_headline: "Jedna specyfikacja. Rój agentów. Jedno zweryfikowane wydanie.",
  agents_lead:
    "Zbudowałem dla zespołu framework Agentic SDLC i przy wszystkim pracuję zgodnie z podejściem spec-first. Tutaj działa na platformie usługi pocztowej: jedna user story, od specyfikacji do scalonego kodu.",
  agents_pill_spec: "SPEC",
  agents_pill_plan: "PLAN",
  agents_pill_build: "BUDOWA",
  agents_pill_verify: "WERYFIKACJA",
  agents_pill_ship: "WYDANIE",
  agents_gate_1: "Bramka 1 · specyfikacja",
  agents_gate_2: "Bramka 2 · plan",
  agents_gate_3: "Bramka 3 · merge",
  agents_approved: "zatwierdzone",
  agents_status_spec: "Agent projektowy przeprowadza ze mną wywiad i pisze specyfikację. Recenzent w nowej sesji ją sprawdza.",
  agents_status_plan: "Agent deweloperski przypisuje każde wymaganie do zadania. Plan jest sprawdzany skryptem.",
  agents_status_build: "Agenci budują zadanie po zadaniu, test-first, równolegle, każdy w nowej sesji.",
  agents_status_verify: "Build, testy, mutation testing i analiza statyczna, a potem niezależny code review.",
  agents_status_ship: "Człowiek scala na Bramce 3. Pipeline wdraża.",
  agents_limits: "Agenci nigdy nie zatwierdzają, nie scalają i nie wdrażają. Robię to ja.",

  // 04 infra
  infra_eyebrow: "04 · Infrastruktura się budzi",
  infra_headline: "Inteligencja potrzebuje miejsca, w którym może działać.",
  infra_lead:
    "Terraform i n8n do infrastruktury na żądanie, korporacyjna platforma AWS, która sama się naprawia, CloudWatch, który jej pilnuje, i CI/CD, który ją dostarcza.",
  infra_chip_aria: "Ilustracja układu CPU i GPU rozświetlającego się blok po bloku",
  infra_chip_compute: "OBLICZENIA",
  infra_chip_schedulers: "SCHEDULERY",
  infra_chip_cache: "CACHE",
  infra_chip_inference: "INFERENCJA",
  infra_chip_agents: "AGENCI",
  infra_chip_memory: "PAMIĘĆ ZUNIFIKOWANA · DANE",
  infra_chip_cicd: "CI/CD",
  infra_chip_observability: "OBSERVABILITY",
  infra_chip_network: "SIEĆ",
  infra_term_1: "power on ✓",
  infra_term_2: "terraform apply ✓ compute online",
  infra_term_3: "serve llm ✓ inferencja gotowa",
  infra_term_4: "agents start ✓ zorkiestrowane",
  infra_term_5: "pipeline deploy ✓ blue/green",
  infra_term_6: "cloudwatch ✓ wszystko zdrowe",

  // 05 work
  work_eyebrow: "05 · Wybrane projekty",
  work_headline: "Co zbudowałem i utrzymuję przy życiu.",
  work_featured: "Wyróżniony",
  work_problem: "Problem",
  work_approach: "Podejście",
  work_stack: "Stos",
  work_outcome: "Rezultat",

  proj_voice_category: "Voice AI",
  proj_voice_title: "Wielojęzyczny voicebot",
  proj_voice_problem: "Dzwoniący chcą mówić w swoim języku i mimo to dostać prawdziwą odpowiedź na żywej linii telefonicznej.",
  proj_voice_approach:
    "LiveKit, SIP i Asterisk niosą rozmowę. Strumieniowe STT, tłumaczenie w czasie rzeczywistym, samodzielnie hostowany LLM i TTS odpowiadają w języku dzwoniącego, a wokół tego działa monitoring.",
  proj_voice_outcome: "Zbudowany przeze mnie od początku do końca i działający na produkcji.",

  proj_sdlc_category: "Agentic SDLC",
  proj_sdlc_title: "Framework Agentic SDLC",
  proj_sdlc_problem: "Agenci AI szybko piszą kod. Bez struktury nikt nie może zaufać temu, co dostarczają.",
  proj_sdlc_approach:
    "Spec-first, w dwóch fazach, prowadzone przez wyspecjalizowanych agentów w rolach. Zadania powstają test-first w nowych sesjach, są niezależnie recenzowane, a człowiek zatwierdza każdą z trzech bramek.",
  proj_sdlc_outcome: "Zbudowany dla mojego zespołu i używany w całej mojej pracy. Agenci nigdy nie zatwierdzają, nie scalają i nie wdrażają.",
  proj_sdlc_repo_label: "Zobacz framework na GitHubie",

  proj_rag_category: "GenAI",
  proj_rag_title: "Chatbot RAG z Agentic AI",
  proj_rag_problem: "Procesy korporacyjne potrzebowały asystenta, który potrafi działać, a nie tylko odpowiadać.",
  proj_rag_approach:
    "Konwersacyjna AI klasy enterprise na AWS Bedrock z wywołaniami narzędzi do dynamicznego wykonywania zadań, prompt engineering i fine-tuning LLM.",
  proj_rag_outcome: "Dynamiczne wykonywanie zadań w procesach korporacyjnych.",

  proj_scraping_category: "Agentic AI",
  proj_scraping_title: "Agentic Scraping + MCP",
  proj_scraping_problem: "Scrapery psują się, gdy zmieniają się strony.",
  proj_scraping_approach:
    "Samonaprawiający się web scraping sterowany językiem naturalnym. Serwer MCP integruje e-mail, logowanie Excel, wykrywanie anomalii i aktualizacje bazy danych w czasie rzeczywistym.",
  proj_scraping_outcome: "Scraper, który sam się naprawia i raportuje, co znalazł.",

  proj_track_category: "AI w logistyce",
  proj_track_title: "Track & Trace — 3PL",
  proj_track_problem: "Zespoły łańcucha dostaw potrzebowały widoczności statków w czasie rzeczywistym i wiarygodnych ETA.",
  proj_track_approach:
    "Feedy AIS, geofencing i interaktywna mapa świata, z algorytmami ML i rozumowaniem wspieranym przez LLM na podstawie rozkładów, zatłoczenia portów i zdarzeń. Analityka GenAI (Qlik, ThoughtSpot, dashboardy RAG) dodana do 5+ aplikacji.",
  proj_track_outcome: "15 000+ statków śledzonych na świecie przy 99% dostępności oraz analityka dla 300+ użytkowników globalnie.",

  proj_hosting_category: "Platforma chmurowa",
  proj_hosting_title: "Korporacyjna platforma hostingu w chmurze",
  proj_hosting_problem: "Kilka aplikacji korporacyjnych potrzebowało jednego niezawodnego domu.",
  proj_hosting_approach:
    "Scentralizowana platforma hostingowa AWS, end-to-end IaC z Terraform, automatyczny monitoring, self-healing i alerting.",
  proj_hosting_outcome: "99%+ dostępności platformy.",

  proj_n8n_category: "Automatyzacja",
  proj_n8n_title: "Automatyzacja n8n Terraform",
  proj_n8n_problem: "Infrastruktura miała być udostępniana na żądanie.",
  proj_n8n_approach: "Pipeline n8n, który generuje skrypty Terraform na żądanie.",
  proj_n8n_outcome: "O 80% krótszy czas udostępniania infrastruktury.",

  proj_drainage_category: "IoT · Hackathon",
  proj_drainage_title: "Smart Drainage System — Zwycięzca",
  proj_drainage_problem: "Powodzie wymagają wczesnego wykrywania i zarządzania w czasie rzeczywistym.",
  proj_drainage_approach:
    "Inteligentny system drenażowy oparty na IoT z detekcją powodzi i zarządzaniem w czasie rzeczywistym, zbudowany dla rządu Odisha.",
  proj_drainage_outcome: "Zwycięzca Smart Odisha Hackathon 2018.",

  // path
  path_eyebrow: "06 · Ścieżka",
  path_headline: "Jak się tu znalazłem.",
  path_dates_1: "cze 2025 → obecnie",
  path_dates_2: "cze 2023 → cze 2025",
  path_dates_3: "cze 2021 → mar 2023",
  path_dates_4: "2018",
  path_dates_5: "2017 → 2021",
  path_title_1: "Senior Technical Manager, DevOps & Innovation Lead",
  path_title_2: "Technical Manager, DevOps & Innovation Lead",
  path_title_3: "Full Stack & Cloud Platform Engineer",
  path_title_4: "Smart Odisha Hackathon, zwycięzca",
  path_title_5: "B.Tech, Informatyka",
  path_org_cozentus: "Cozentus Technologies",
  path_org_hackathon: "Rząd Odisha / BPUT",
  path_org_college: "Silicon Institute of Technology",
  path_body_1: "Awans w cze 2025. Nadal prowadzę DevOps i innowacje.",
  path_body_2:
    "Chatbot RAG z Agentic AI na AWS Bedrock, samonaprawiający się agentic scraping z MCP oraz automatyzacja n8n + Terraform, która skróciła czas wdrożeń o 80%. Optymalizacja kosztów chmury i monitoring CloudWatch. 15+ warsztatów cloud i GenAI dla 20+ deweloperów. Bonus CEO cztery lata z rzędu, 95% wskaźnik sukcesu projektów.",
  path_body_3:
    "Śledzenie statków oparte na AI dla firmy 3PL z predykcyjnymi ETA dla 15 000+ statków. Hosting AWS dla krytycznych aplikacji łańcucha dostaw oraz pipeline'y CI/CD dla 10+ aplikacji.",
  path_body_4: "Wygrana dzięki Smart Drainage System, zbudowanemu w czasie studiów.",
  path_body_5: "Tu się zaczęło.",

  // credentials
  credentials_eyebrow: "06 · Certyfikaty",
  credentials_headline: "Cztery certyfikaty AWS, zweryfikowane na Credly.",
  credentials_verify: "Zweryfikuj ↗",
  credentials_early: "Early Adopter",

  // skills
  skills_eyebrow: "06 · Skrzynka narzędzi",
  skills_headline: "Z czym pracuję.",
  skill_genai: "Stos GenAI",
  skill_aws: "Chmura AWS",
  skill_devops: "DevOps i Infrastruktura",
  skill_langs: "Języki i Frameworki",
  skill_aiml: "AI / ML i Analityka",
  skill_security: "Bezpieczeństwo i Sieci",

  // 07 contact
  contact_eyebrow: "07 · Kontakt",
  contact_headline: "Zbudujmy kolejny.",
  contact_lead: "E-mail to najlepszy początek.",
  contact_email_label: "E-mail",
  contact_linkedin_label: "LinkedIn",
  contact_github_label: "GitHub",

  // footer
  footer_copyright: "© 2026 Ashutosh Nayak",
  footer_location: "Indie",
  footer_top: "Do góry",
};

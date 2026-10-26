import type { Dict } from './index';

export const nl: Dict = {
  // meta
  meta_title: "Ashutosh Nayak — Agentic AI-engineer, Cloud/DevOps",
  meta_description:
    "Ashutosh Nayak bouwt agents die software bouwen, en de cloudsystemen waarop ze draaien: agentic AI, Agentic SDLC, GenAI, AWS, Terraform en CI/CD. Gevestigd in India.",

  // chapter labels
  chapter_word: "Hoofdstuk",
  chapter_00: "00",
  chapter_01: "01",
  chapter_02: "02",
  chapter_03: "03",
  chapter_04: "04",
  chapter_05: "05",
  chapter_06: "06",
  chapter_07: "07",

  // nav
  nav_aria: "Hoofdnavigatie",
  nav_skip: "Naar de inhoud",
  nav_stats: "In productie",
  nav_voice: "Eén gesprek",
  nav_agents: "Agents",
  nav_infra: "Infrastructuur",
  nav_work: "Werk",
  nav_path: "Loopbaan",
  nav_contact: "Contact",
  nav_cta: "Laten we praten",
  nav_language_label: "Taal",
  nav_mode_to_light: "Overschakelen naar lichte modus",
  nav_mode_to_dark: "Overschakelen naar donkere modus",
  nav_menu_open: "Menu openen",
  nav_menu_close: "Menu sluiten",
  lang_name_en: "English",
  lang_name_de: "Deutsch",
  lang_name_nl: "Nederlands",
  lang_name_pl: "Polski",

  // loader
  loader_initialising: "Initialiseren",
  loader_orchestrator: "De orchestrator wordt wakker",
  loader_shaping: "De kern krijgt vorm",
  loader_aligning: "De ringen worden uitgelijnd",
  loader_ready: "Klaar",
  loader_skip: "klik om over te slaan",
  loader_progress_aria: "Laden, {pct} procent",

  // 00 hero
  hero_name: "Ashutosh Nayak",
  hero_role: "GenAI-ontwikkelaar & Cloud/DevOps-engineer",
  hero_eyebrow: "00 · Hallo",
  hero_promise_1: "Ik bouw agents die software bouwen.",
  hero_promise_2: "En de systemen waarop ze draaien.",
  hero_context_1: "Engineer voor agentic AI en Agentic SDLC.",
  hero_context_2: "GenAI en Cloud/DevOps · India · 5+ jaar.",
  hero_cta: "Bekijk één systeem, van begin tot eind",
  hero_cta_secondary: "Neem contact op",
  hero_visual_label: "Geanimeerde gouden engine: gloeiende ringen rond een gefacetteerde kern, met elektrische signalen",

  // 01 stats
  stats_eyebrow: "01 · In productie",
  stats_headline: "Cijfers, met hun bereik.",
  stats_vessels_label: "schepen gevolgd",
  stats_vessels_scope: "Track & Trace-platform voor een 3PL",
  stats_provisioning_label: "provisioningtijd",
  stats_provisioning_scope: "n8n + Terraform, IaC op aanvraag",
  stats_uptime_label: "platform-uptime",
  stats_uptime_scope: "enterprise AWS-hostingplatform",
  stats_certs_label: "AWS-certificeringen",
  stats_certs_scope: "waaronder GenAI Developer Professional, Early Adopter",
  stats_years_label: "jaar ervaring",
  stats_years_scope: "van full stack tot agentic AI en DevOps",

  // 02 one call
  voice_eyebrow: "02 · Eén gesprek, stap voor stap",
  voice_headline: "Een beller spreekt zijn eigen taal. De bot antwoordt erin. Live.",
  voice_lead:
    "Ik heb deze meertalige voicebot van begin tot eind gebouwd, en hij draait in productie. Volg één Hindi-gesprek van de eerste beltoon tot het gesproken antwoord.",
  voice_languages: "हिन्दी · Engels · internationale talen",
  voice_ring_title: "Bellen",
  voice_ring_body: "Het gesprek komt via SIP binnen vanuit het telefoonnetwerk, landt op Asterisk en wordt overgedragen aan LiveKit.",
  voice_hear_title: "Horen",
  voice_hear_body: "Streaming spraak-naar-tekst (STT) transcribeert de beller terwijl die nog praat.",
  voice_translate_title: "Vertalen",
  voice_translate_body: "Realtime vertaling (RTT) brengt de woorden van de beller naar de bot en het antwoord van de bot in de taal van de beller weer terug.",
  voice_think_title: "Denken",
  voice_think_body: "Een zelfgehoste LLM die ik heb uitgerold, bedenkt het antwoord.",
  voice_speak_title: "Spreken",
  voice_speak_body: "Tekst-naar-spraak (TTS) antwoordt in de eigen taal van de beller, rechtstreeks terug de lijn op.",
  voice_monitor_title: "Bewaakt in productie",
  voice_monitor_row_1: "Gesprekspad",
  voice_monitor_row_2: "Spraak en vertaling",
  voice_monitor_row_3: "Model serving",

  // 03 agents
  agents_eyebrow: "03 · Zo bouw ik met agents",
  agents_headline: "Eén spec. Een zwerm agents. Eén geverifieerde release.",
  agents_lead:
    "Ik heb voor mijn team een Agentic SDLC-framework gebouwd en werk bij alles spec-first. Hier draait het op een platform voor e-maildiensten: één user story, van spec tot gemergde code.",
  agents_pill_spec: "SPEC",
  agents_pill_plan: "PLAN",
  agents_pill_build: "BOUWEN",
  agents_pill_verify: "CONTROLE",
  agents_pill_ship: "RELEASE",
  agents_gate_1: "Gate 1 · spec",
  agents_gate_2: "Gate 2 · plan",
  agents_gate_3: "Gate 3 · merge",
  agents_approved: "goedgekeurd",
  agents_status_spec: "Een design-agent interviewt mij en schrijft de spec. Een reviewer in een verse sessie controleert die.",
  agents_status_plan: "De developer-agent koppelt elke eis aan een taak. Het plan wordt met een script gecontroleerd.",
  agents_status_build: "Agents bouwen taak voor taak, test-first, parallel, elk in een verse sessie.",
  agents_status_verify: "Build, tests, mutation testing en statische analyse, daarna een onafhankelijke code review.",
  agents_status_ship: "Een mens merget bij Gate 3. De pipeline deployt.",
  agents_limits: "Agents keuren nooit goed, mergen nooit en deployen nooit. Dat doe ik.",

  // 04 infra
  infra_eyebrow: "04 · Infrastructuur ontwaakt",
  infra_headline: "Intelligentie heeft een plek nodig om te draaien.",
  infra_lead:
    "Terraform en n8n voor infrastructuur op aanvraag, een enterprise AWS-platform dat zichzelf herstelt, CloudWatch dat meekijkt en CI/CD dat het uitrolt.",
  infra_chip_aria: "Illustratie van een CPU- en GPU-chip die blok voor blok oplicht",
  infra_chip_compute: "COMPUTE",
  infra_chip_schedulers: "SCHEDULERS",
  infra_chip_cache: "CACHE",
  infra_chip_inference: "INFERENTIE",
  infra_chip_agents: "AGENTS",
  infra_chip_memory: "GEÏNTEGREERD GEHEUGEN · DATA",
  infra_chip_cicd: "CI/CD",
  infra_chip_observability: "OBSERVABILITY",
  infra_chip_network: "NETWERK",
  infra_term_1: "power on ✓",
  infra_term_2: "terraform apply ✓ compute online",
  infra_term_3: "serve llm ✓ inferentie gereed",
  infra_term_4: "agents start ✓ georkestreerd",
  infra_term_5: "pipeline deploy ✓ blue/green",
  infra_term_6: "cloudwatch ✓ alles gezond",

  // 05 work
  work_eyebrow: "05 · Geselecteerd werk",
  work_headline: "Wat ik bouwde en draaiende hield.",
  work_featured: "Uitgelicht",
  work_problem: "Probleem",
  work_approach: "Aanpak",
  work_stack: "Stack",
  work_outcome: "Resultaat",

  proj_voice_category: "Voice AI",
  proj_voice_title: "Meertalige voicebot",
  proj_voice_problem: "Bellers willen hun eigen taal spreken en toch een echt antwoord krijgen op een live telefoonlijn.",
  proj_voice_approach:
    "LiveKit, SIP en Asterisk dragen het gesprek. Streaming STT, realtime vertaling, een zelfgehoste LLM en TTS antwoorden in de taal van de beller, met monitoring eromheen.",
  proj_voice_outcome: "Door mij van begin tot eind gebouwd en draaiend in productie.",

  proj_sdlc_category: "Agentic SDLC",
  proj_sdlc_title: "Agentic SDLC-framework",
  proj_sdlc_problem: "AI-agents schrijven snel code. Zonder structuur kan niemand vertrouwen op wat ze opleveren.",
  proj_sdlc_approach:
    "Spec-first, in twee fasen, uitgevoerd door gespecialiseerde rol-agents. Taken worden test-first gebouwd in verse sessies, onafhankelijk beoordeeld, en een mens keurt elk van de drie gates goed.",
  proj_sdlc_outcome: "Gebouwd voor mijn team en gebruikt in al mijn werk. Agents keuren nooit goed, mergen nooit en deployen nooit.",
  proj_sdlc_repo_label: "Bekijk het framework op GitHub",

  proj_rag_category: "GenAI",
  proj_rag_title: "RAG-chatbot met Agentic AI",
  proj_rag_problem: "Bedrijfsworkflows hadden een assistent nodig die kan handelen, niet alleen antwoorden.",
  proj_rag_approach:
    "Conversationele AI op enterprise-niveau op AWS Bedrock met tool-aanroepen voor dynamische taakuitvoering, prompt engineering en LLM fine-tuning.",
  proj_rag_outcome: "Dynamische taakuitvoering binnen bedrijfsworkflows.",

  proj_scraping_category: "Agentic AI",
  proj_scraping_title: "Agentic Scraping + MCP",
  proj_scraping_problem: "Scrapers breken als pagina's veranderen.",
  proj_scraping_approach:
    "Zelfherstellend web scraping aangestuurd met natuurlijke taal. Een MCP-server koppelt e-mail, Excel-logging, anomaliedetectie en database-updates in realtime.",
  proj_scraping_outcome: "Een scraper die zichzelf herstelt en meldt wat hij vindt.",

  proj_track_category: "Logistieke AI",
  proj_track_title: "Track & Trace — 3PL",
  proj_track_problem: "Supply chain-teams hadden realtime scheepszichtbaarheid en betrouwbare ETA's nodig.",
  proj_track_approach:
    "AIS-feeds, geofencing en een interactieve wereldkaart, met ML-algoritmen en LLM-ondersteund redeneren over dienstregelingen, havencongestie en gebeurtenissen. GenAI-analytics (Qlik, ThoughtSpot, RAG-dashboards) toegevoegd aan 5+ apps.",
  proj_track_outcome: "15.000+ schepen wereldwijd gevolgd met 99% uptime, en analytics voor 300+ gebruikers wereldwijd.",

  proj_hosting_category: "Cloudplatform",
  proj_hosting_title: "Cloud-hostingplatform voor bedrijven",
  proj_hosting_problem: "Meerdere bedrijfsapplicaties hadden één betrouwbaar thuis nodig.",
  proj_hosting_approach:
    "Een gecentraliseerd AWS-hostingplatform, end-to-end IaC met Terraform, geautomatiseerde monitoring, self-healing en alerting.",
  proj_hosting_outcome: "99%+ platform-uptime.",

  proj_n8n_category: "Automatisering",
  proj_n8n_title: "n8n Terraform Automatisering",
  proj_n8n_problem: "Infrastructuur moest op aanvraag worden ingericht.",
  proj_n8n_approach: "Een n8n-pipeline die Terraform-scripts op aanvraag genereert.",
  proj_n8n_outcome: "80% minder provisioningtijd voor infrastructuur.",

  proj_drainage_category: "IoT · Hackathon",
  proj_drainage_title: "Smart Drainage Systeem — Winnaar",
  proj_drainage_problem: "Overstromingen vragen om vroege detectie en realtimebeheer.",
  proj_drainage_approach:
    "Een IoT-gebaseerd slim drainagesysteem met overstromingsdetectie en realtimebeheer, gebouwd voor de overheid van Odisha.",
  proj_drainage_outcome: "Winnaar van de Smart Odisha Hackathon 2018.",

  // path
  path_eyebrow: "06 · Loopbaan",
  path_headline: "Hoe ik hier kwam.",
  path_dates_1: "Jun 2025 → heden",
  path_dates_2: "Jun 2023 → Jun 2025",
  path_dates_3: "Jun 2021 → Mrt 2023",
  path_dates_4: "2018",
  path_dates_5: "2017 → 2021",
  path_title_1: "Senior Technical Manager, DevOps & Innovation Lead",
  path_title_2: "Technical Manager, DevOps & Innovation Lead",
  path_title_3: "Full Stack & Cloud Platform Engineer",
  path_title_4: "Smart Odisha Hackathon, winnaar",
  path_title_5: "B.Tech, Informatica",
  path_org_cozentus: "Cozentus Technologies",
  path_org_hackathon: "Overheid van Odisha / BPUT",
  path_org_college: "Silicon Institute of Technology",
  path_body_1: "Gepromoveerd in Jun 2025. Nog steeds de lead voor DevOps en innovatie.",
  path_body_2:
    "RAG-chatbot met Agentic AI op AWS Bedrock, zelfherstellende agentic scraping met MCP, en n8n + Terraform-automatisering die de deploymenttijd met 80% verkortte. Cloudkostenoptimalisatie en CloudWatch-monitoring. 15+ cloud- en GenAI-workshops voor 20+ ontwikkelaars. Vier jaar op rij CEO Bonus, 95% projectsuccesratio.",
  path_body_3:
    "AI-gestuurde scheepstracking voor een 3PL met voorspellende ETA's voor 15.000+ schepen. AWS-hosting voor bedrijfskritische supply chain-apps en CI/CD-pipelines voor 10+ applicaties.",
  path_body_4: "Gewonnen met het Smart Drainage Systeem, gebouwd tijdens de studie.",
  path_body_5: "Waar het begon.",

  // credentials
  credentials_eyebrow: "06 · Certificeringen",
  credentials_headline: "Vier AWS-certificeringen, geverifieerd op Credly.",
  credentials_verify: "Verifieer ↗",
  credentials_early: "Early Adopter",

  // skills
  skills_eyebrow: "06 · Gereedschapskist",
  skills_headline: "Waarmee ik werk.",
  skill_genai: "GenAI Stack",
  skill_aws: "AWS Cloud",
  skill_devops: "DevOps & Infrastructuur",
  skill_langs: "Talen & Frameworks",
  skill_aiml: "AI / ML en analyse",
  skill_security: "Beveiliging & Netwerken",

  // 07 contact
  contact_eyebrow: "07 · Contact",
  contact_headline: "Laten we de volgende bouwen.",
  contact_lead: "E-mail is de beste plek om te beginnen.",
  contact_email_label: "E-mail",
  contact_linkedin_label: "LinkedIn",
  contact_github_label: "GitHub",

  // footer
  footer_copyright: "© 2026 Ashutosh Nayak",
  footer_location: "India",
  footer_top: "Terug naar boven",
};

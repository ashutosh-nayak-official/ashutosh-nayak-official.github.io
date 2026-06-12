/* ============================================================
   "Shift" — scroll-story engine (milestones 2a + 2b)
   Hero pin + Chapters 1-5 (Benz blueprint → Model T → grand
   tourer → turbo wedge → electric hypercar) + speedometer +
   garage finale (projects / logbook / tool wall / certs / CTA).
   Classic script. Depends on: gsap, ScrollTrigger, Lenis (CDN).
   ============================================================ */

(function () {
  'use strict';

  // ----------------------------------------------------------
  // i18n
  // ----------------------------------------------------------
  var STORY_I18N = {
    en: {
      nav_contact: 'Contact',
      hero_kicker: 'THE DRIVE SO FAR',
      hero_role: 'GenAI Developer & Cloud/DevOps Engineer',
      hero_hint: 'Scroll to start the engine',
      ch1_era: 'THE FIRST IGNITION',
      ch1_stamp: 'BENZ PATENT-MOTORWAGEN · 1886',
      ch1_title: 'Chapter 01 · College Beginnings',
      ch1_caption: 'Every machine has a first spark. Mine lit at Silicon Institute of Technology, Bhubaneswar — a B.Tech in Computer Science and the first lines of code, drafted like Benz drafting the Patent-Motorwagen.',
      ch2_era: 'THE ASSEMBLY LINE',
      ch2_stamp: 'FORD MODEL T · 1908',
      ch2_title: 'Chapter 02 · Learning the Craft',
      ch2_caption: 'Fundamentals, frameworks, and late-night builds — shipping code the way Ford shipped cars: one reliable piece at a time. In 2018 the first trophy arrived — the Smart Odisha Hackathon, won with an IoT smart drainage system built for the Govt. of Odisha.',
      ch2_plaque: 'SMART ODISHA HACKATHON · WINNER 2018',
      ch3_era: 'THE OPEN ROAD',
      ch3_stamp: 'GRAND TOURER · 1965',
      ch3_title: 'Chapter 03 · First Professional Years',
      ch3_caption: 'Joining Cozentus Technologies as a Full Stack & Cloud Platform Engineer — delivering an AI-powered vessel tracking system with predictive ETAs for 15,000+ ships, on AWS infrastructure engineered for 99% uptime and CI/CD pipelines serving 10+ applications.',
      ch4_era: 'FORCED INDUCTION',
      ch4_stamp: 'TURBO ERA · 1987',
      ch4_title: 'Chapter 04 · The GenAI Shift',
      ch4_caption: 'The turbo spools: RAG chatbots with Agentic AI on AWS Bedrock, a self-healing scraper that speaks natural language through MCP, and an n8n + Terraform pipeline that cut infrastructure provisioning time by 80%.',
      ch4_chip1: 'RAG + AGENTIC AI',
      ch4_chip2: 'AWS BEDROCK',
      ch4_chip3: 'MCP · n8n · TERRAFORM −80% PROVISIONING',
      ch5_era: 'FULL CHARGE',
      ch5_stamp: 'ELECTRIC HYPERCAR · NOW',
      ch5_title: 'Chapter 05 · Lead Innovation',
      ch5_now: 'NOW',
      ch5_caption: 'Today: Technical Manager — Lead Innovation at Cozentus, architecting intelligent systems and the cloud beneath them, mentoring 20+ developers through 15+ workshops — with a CEO Bonus four years running.',
      stat_experience: 'Years Experience',
      stat_uptime: 'Platform Uptime',
      stat_workshops: 'AI/Cloud Workshops',
      stat_bonus: 'CEO Bonus Awarded',
      stat_success: 'Project Success Rate',
      garage_kicker: 'THE GARAGE',
      garage_title: "Everything I've Built & Carry",
      garage_projects: 'On the Lifts',
      garage_logbook: 'Service Logbook',
      garage_skills: 'The Tool Wall',
      garage_cta_line: 'The next chapter needs a co-driver.',
      garage_cta: 'START THE ENGINE',
      garage_driver: 'The Driver',
      driver_bio: "I design and develop intelligent systems that bridge the gap between large language models and real-world enterprise problems and build the cloud infrastructure that powers them. From designing RAG pipelines and Agentic AI workflows to deploying scalable infrastructure with Terraform, CI/CD pipelines, and AWS cloud architecture, I turn complex AI capabilities into products that teams actually ship. On the DevOps side, I've driven 80% faster provisioning with IaC automation, maintained 99%+ platform uptime, and led cloud cost optimization initiatives. My work spans logistics, supply chain, and finance, where I've built systems tracking 15,000+ vessels globally and led innovation teams that consistently deliver with a 95% success rate.",
      proj_1_title: "RAG Chatbot with Agentic AI", proj_1_desc: "Enterprise-grade conversational AI powered by AWS Bedrock with tool calling for dynamic task execution, prompt engineering, and LLM fine-tuning.",
      proj_2_title: "Agentic Scraping + MCP", proj_2_desc: "Self-healing web scraping with natural language interaction. MCP server integrates email, Excel logging, anomaly detection, and database updates in real-time.",
      proj_3_title: "Track & Trace — 3PL", proj_3_desc: "Real-time vessel visibility for 15,000+ ships globally. ML-powered predictive ETAs with AIS feeds, geofencing, and interactive global mapping.",
      proj_4_title: "Enterprise Cloud Hosting Platform", proj_4_desc: "Centralized AWS hosting platform serving as backbone for multiple enterprise apps. End-to-end IaC with Terraform, automated monitoring, self-healing, and alerting for rapid incident response.",
      proj_5_title: "n8n Terraform Automation", proj_5_desc: "Automation pipeline enabling on-demand Terraform script generation, reducing infrastructure provisioning time by 80% across the engineering org.",
      proj_6_title: "Smart Drainage System — Winner", proj_6_desc: "Smart Odisha Hackathon winning project: IoT-based smart drainage system with flood detection and real-time management for the Govt. of Odisha.",
      skill_genai: "GenAI Stack", skill_aws: "AWS Cloud", skill_devops: "DevOps & Infrastructure", skill_langs: "Languages & Frameworks", skill_aiml: "AI / ML & Analytics", skill_security: "Security & Networking",
      certs_label: "Certifications",
      role_title_1: "Technical Manager — Lead Innovation", role_title_2: "Full Stack & Cloud Platform Engineer",
      rh_1_1: 'Designed and Developed a <strong>RAG chatbot with Agentic AI & AWS Bedrock</strong>, integrating tool calling for dynamic task execution across enterprise workflows.',
      rh_1_2: 'Built a <strong>self-healing Agentic Scraping solution</strong> with MCP server integration — natural language interaction, email/Excel logging, and anomaly detection.',
      rh_1_3: 'Designed <strong>AWS cloud infrastructure</strong> for enterprise apps using EC2, VPC, S3, Lambda, API Gateway, CloudWatch, and DynamoDB with <strong>99%+ uptime</strong>.',
      rh_1_4: 'Designed an <strong>n8n + Terraform automation pipeline</strong> for on-demand IaC provisioning, cutting deployment time by <strong>80%</strong>. Standardized environments with <strong>Terraform & Ansible</strong>.',
      rh_1_5: 'Drove <strong>cloud cost optimization</strong> with AWS Cost Explorer, resource right-sizing, and reserved instances. Established <strong>proactive CloudWatch monitoring</strong> reducing MTTR for critical incidents.',
      rh_1_6: 'Led <strong>15+ cloud & GenAI workshops</strong> for 20+ developers, accelerating organizational adoption of cloud-native AI practices.',
      rh_1_7: 'Awarded <strong>CEO Bonus for 4 consecutive years</strong> for delivering high-impact innovative solutions with a <strong>95% project success rate</strong>.',
      rh_2_1: 'Delivered an <strong>AI-powered vessel tracking system</strong> for 3PL — real-time visibility and predictive ETAs for <strong>15,000+ vessels globally</strong> with 99% uptime.',
      rh_2_2: 'Designed and managed <strong>AWS cloud hosting infrastructure</strong> (EC2, S3, RDS, Lambda, CloudWatch) ensuring <strong>high availability and fault tolerance</strong> for mission-critical supply chain apps.',
      rh_2_3: 'Built and maintained <strong>CI/CD pipelines for 10+ applications</strong>, automating build, test, and deployment. Configured <strong>VPC, security groups, load balancers, and DNS</strong>.',
      rh_2_4: 'Enhanced ETA accuracy with <strong>ML algorithms & LLM-assisted reasoning</strong> analyzing schedules, port congestion, and event data.',
      rh_2_5: 'Integrated <strong>GenAI-powered analytics</strong> (Qlik, ThoughtSpot, RAG dashboards) into 5+ apps, improving data access for <strong>300+ global users</strong>.'
    },
    de: {
      nav_contact: 'Kontakt',
      hero_kicker: 'DIE FAHRT BIS HIERHER',
      hero_role: 'GenAI-Entwickler & Cloud/DevOps-Ingenieur',
      hero_hint: 'Scrollen, um den Motor zu starten',
      ch1_era: 'DIE ERSTE ZÜNDUNG',
      ch1_stamp: 'BENZ PATENT-MOTORWAGEN · 1886',
      ch1_title: 'Kapitel 01 · Anfänge im Studium',
      ch1_caption: 'Jede Maschine hat ihren ersten Funken. Meiner zündete am Silicon Institute of Technology in Bhubaneswar — ein B.Tech in Informatik und die ersten Zeilen Code, entworfen wie Benz einst den Patent-Motorwagen.',
      ch2_era: 'DAS FLIESSBAND',
      ch2_stamp: 'FORD MODEL T · 1908',
      ch2_title: 'Kapitel 02 · Das Handwerk lernen',
      ch2_caption: 'Grundlagen, Frameworks und nächtliche Builds — Code ausliefern, wie Ford Autos auslieferte: ein zuverlässiges Teil nach dem anderen. 2018 kam die erste Trophäe — der Smart Odisha Hackathon, gewonnen mit einem IoT-basierten intelligenten Entwässerungssystem für die Regierung von Odisha.',
      ch2_plaque: 'SMART ODISHA HACKATHON · GEWINNER 2018',
      ch3_era: 'DIE OFFENE STRASSE',
      ch3_stamp: 'GRAND TOURER · 1965',
      ch3_title: 'Kapitel 03 · Erste Berufsjahre',
      ch3_caption: 'Einstieg bei Cozentus Technologies als Full Stack & Cloud Platform Engineer — Bereitstellung eines KI-gestützten Schiffsverfolgungssystems mit prädiktiven ETAs für 15.000+ Schiffe, auf AWS-Infrastruktur mit 99% Verfügbarkeit und CI/CD-Pipelines für 10+ Anwendungen.',
      ch4_era: 'AUFLADUNG',
      ch4_stamp: 'TURBO-ÄRA · 1987',
      ch4_title: 'Kapitel 04 · Der GenAI-Wandel',
      ch4_caption: 'Der Turbo dreht hoch: RAG-Chatbots mit Agentic AI auf AWS Bedrock, ein selbstheilender Scraper, der über MCP natürliche Sprache spricht, und eine n8n + Terraform-Pipeline, die die Bereitstellungszeit der Infrastruktur um 80% verkürzte.',
      ch4_chip1: 'RAG + AGENTIC AI',
      ch4_chip2: 'AWS BEDROCK',
      ch4_chip3: 'MCP · n8n · TERRAFORM −80% BEREITSTELLUNGSZEIT',
      ch5_era: 'VOLLE LADUNG',
      ch5_stamp: 'ELEKTRO-HYPERCAR · JETZT',
      ch5_title: 'Kapitel 05 · Innovationsleitung',
      ch5_now: 'JETZT',
      ch5_caption: 'Heute: Technischer Manager — Innovationsleitung bei Cozentus, Architektur intelligenter Systeme und der Cloud darunter, Mentoring von 20+ Entwicklern in 15+ Workshops — mit dem CEO-Bonus vier Jahre in Folge.',
      stat_experience: 'Jahre Erfahrung',
      stat_uptime: 'Plattform-Verfügbarkeit',
      stat_workshops: 'AI/Cloud-Workshops',
      stat_bonus: 'CEO-Bonus erhalten',
      stat_success: 'Projekterfolgsquote',
      garage_kicker: 'DIE GARAGE',
      garage_title: 'Alles, was ich gebaut habe und mitbringe',
      garage_projects: 'Auf den Hebebühnen',
      garage_logbook: 'Serviceheft',
      garage_skills: 'Die Werkzeugwand',
      garage_cta_line: 'Das nächste Kapitel braucht einen Beifahrer.',
      garage_cta: 'MOTOR STARTEN',
      garage_driver: 'Der Fahrer',
      driver_bio: "Ich entwerfe und entwickle intelligente Systeme, die die Lücke zwischen großen Sprachmodellen und realen Unternehmensproblemen schließen und die Cloud-Infrastruktur aufbauen, die sie antreibt. Vom Design von RAG-Pipelines und Agentic AI-Workflows bis zum Deployment skalierbarer Infrastruktur mit Terraform, CI/CD-Pipelines und AWS-Cloud-Architektur verwandle ich komplexe KI-Fähigkeiten in Produkte, die Teams tatsächlich ausliefern. Auf der DevOps-Seite habe ich 80% schnellere Bereitstellung durch IaC-Automatisierung erreicht, eine 99%+ Plattform-Verfügbarkeit aufrechterhalten und Cloud-Kostenoptimierungsinitiativen geleitet. Meine Arbeit erstreckt sich über Logistik, Lieferkette und Finanzen, wo ich Systeme zur Verfolgung von 15.000+ Schiffen weltweit gebaut und Innovationsteams geleitet habe, die konsequent mit einer 95% Erfolgsquote liefern.",
      proj_1_title: "RAG-Chatbot mit Agentic AI", proj_1_desc: "Konversations-KI auf Enterprise-Niveau, angetrieben von AWS Bedrock mit Tool-Aufrufen für dynamische Aufgabenausführung, Prompt Engineering und LLM-Fine-Tuning.",
      proj_2_title: "Agentic Scraping + MCP", proj_2_desc: "Selbstheilendes Web-Scraping mit natürlichsprachiger Interaktion. MCP-Server integriert E-Mail, Excel-Protokollierung, Anomalieerkennung und Datenbank-Updates in Echtzeit.",
      proj_3_title: "Track & Trace — 3PL", proj_3_desc: "Echtzeit-Schiffssichtbarkeit für 15.000+ Schiffe weltweit. ML-gestützte prädiktive ETAs mit AIS-Feeds, Geofencing und interaktiver globaler Kartierung.",
      proj_4_title: "Enterprise Cloud-Hosting-Plattform", proj_4_desc: "Zentralisierte AWS-Hosting-Plattform als Backbone für mehrere Unternehmensanwendungen. End-to-End-IaC mit Terraform, automatisiertes Monitoring, Self-Healing und Alerting.",
      proj_5_title: "n8n Terraform-Automatisierung", proj_5_desc: "Automatisierungspipeline für die On-Demand-Generierung von Terraform-Skripten, Reduzierung der Infrastruktur-Bereitstellungszeit um 80%.",
      proj_6_title: "Smart Drainage System — Gewinner", proj_6_desc: "Smart Odisha Hackathon-Gewinnerprojekt: IoT-basiertes intelligentes Entwässerungssystem mit Hochwassererkennung und Echtzeit-Management für die Regierung von Odisha.",
      skill_genai: "GenAI-Stack", skill_aws: "AWS Cloud", skill_devops: "DevOps & Infrastruktur", skill_langs: "Sprachen & Frameworks", skill_aiml: "KI / ML & Analytik", skill_security: "Sicherheit & Netzwerk",
      certs_label: "Zertifizierungen",
      role_title_1: "Technischer Manager — Innovationsleitung", role_title_2: "Full Stack & Cloud Platform Engineer",
      rh_1_1: 'Entwurf und Entwicklung eines <strong>RAG-Chatbots mit Agentic AI & AWS Bedrock</strong>, Integration von Tool-Aufrufen für dynamische Aufgabenausführung über Unternehmens-Workflows.',
      rh_1_2: 'Aufbau einer <strong>selbstheilenden Agentic-Scraping-Lösung</strong> mit MCP-Server-Integration — natürlichsprachige Interaktion, E-Mail-/Excel-Protokollierung und Anomalieerkennung.',
      rh_1_3: 'Entwurf der <strong>AWS-Cloud-Infrastruktur</strong> für Unternehmensanwendungen mit EC2, VPC, S3, Lambda, API Gateway, CloudWatch und DynamoDB mit <strong>99%+ Verfügbarkeit</strong>.',
      rh_1_4: 'Entwurf einer <strong>n8n + Terraform-Automatisierungspipeline</strong> für On-Demand-IaC-Bereitstellung mit <strong>80%</strong> Reduzierung der Deployment-Zeit. Standardisierung der Umgebungen mit <strong>Terraform & Ansible</strong>.',
      rh_1_5: 'Vorantreiben der <strong>Cloud-Kostenoptimierung</strong> mit AWS Cost Explorer, Ressourcen-Rightsizing und reservierten Instanzen. Etablierung von <strong>proaktivem CloudWatch-Monitoring</strong> zur Reduzierung der MTTR bei kritischen Vorfällen.',
      rh_1_6: 'Leitung von <strong>15+ Cloud- & GenAI-Workshops</strong> für 20+ Entwickler, Beschleunigung der organisatorischen Einführung cloud-nativer KI-Praktiken.',
      rh_1_7: 'Auszeichnung mit dem <strong>CEO-Bonus für 4 aufeinanderfolgende Jahre</strong> für die Bereitstellung hochwirksamer innovativer Lösungen mit einer <strong>95% Projekterfolgsquote</strong>.',
      rh_2_1: 'Bereitstellung eines <strong>KI-gestützten Schiffsverfolgungssystems</strong> für 3PL — Echtzeit-Sichtbarkeit und prädiktive ETAs für <strong>15.000+ Schiffe weltweit</strong> mit 99% Verfügbarkeit.',
      rh_2_2: 'Entwurf und Verwaltung der <strong>AWS-Cloud-Hosting-Infrastruktur</strong> (EC2, S3, RDS, Lambda, CloudWatch) mit <strong>hoher Verfügbarkeit und Fehlertoleranz</strong> für geschäftskritische Supply-Chain-Apps.',
      rh_2_3: 'Aufbau und Wartung von <strong>CI/CD-Pipelines für 10+ Anwendungen</strong>, Automatisierung von Build, Test und Deployment. Konfiguration von <strong>VPC, Sicherheitsgruppen, Load Balancern und DNS</strong>.',
      rh_2_4: 'Verbesserung der ETA-Genauigkeit mit <strong>ML-Algorithmen & LLM-gestütztem Reasoning</strong> zur Analyse von Fahrplänen, Hafenüberlastung und Ereignisdaten.',
      rh_2_5: 'Integration von <strong>GenAI-gestützter Analytik</strong> (Qlik, ThoughtSpot, RAG-Dashboards) in 5+ Apps, Verbesserung des Datenzugangs für <strong>300+ globale Nutzer</strong>.'
    },
    nl: {
      nav_contact: 'Contact',
      hero_kicker: 'DE RIT TOT NU TOE',
      hero_role: 'GenAI-ontwikkelaar & Cloud/DevOps-engineer',
      hero_hint: 'Scroll om de motor te starten',
      ch1_era: 'DE EERSTE ONTSTEKING',
      ch1_stamp: 'BENZ PATENT-MOTORWAGEN · 1886',
      ch1_title: 'Hoofdstuk 01 · Studententijd',
      ch1_caption: 'Elke machine heeft een eerste vonk. De mijne ontstak aan het Silicon Institute of Technology in Bhubaneswar — een B.Tech in informatica en de eerste regels code, geschetst zoals Benz de Patent-Motorwagen schetste.',
      ch2_era: 'DE LOPENDE BAND',
      ch2_stamp: 'FORD MODEL T · 1908',
      ch2_title: 'Hoofdstuk 02 · Het vak leren',
      ch2_caption: 'Fundamenten, frameworks en nachtelijke builds — code leveren zoals Ford auto’s leverde: één betrouwbaar onderdeel tegelijk. In 2018 kwam de eerste trofee — de Smart Odisha Hackathon, gewonnen met een IoT-gebaseerd slim drainagesysteem voor de overheid van Odisha.',
      ch2_plaque: 'SMART ODISHA HACKATHON · WINNAAR 2018',
      ch3_era: 'DE OPEN WEG',
      ch3_stamp: 'GRAND TOURER · 1965',
      ch3_title: 'Hoofdstuk 03 · Eerste professionele jaren',
      ch3_caption: 'Aan de slag bij Cozentus Technologies als Full Stack & Cloud Platform Engineer — levering van een AI-aangedreven scheepstrackingsysteem met voorspellende ETA’s voor 15.000+ schepen, op AWS-infrastructuur gebouwd voor 99% uptime en CI/CD-pipelines voor 10+ applicaties.',
      ch4_era: 'DRUKVULLING',
      ch4_stamp: 'TURBOTIJDPERK · 1987',
      ch4_title: 'Hoofdstuk 04 · De GenAI-omslag',
      ch4_caption: 'De turbo komt op druk: RAG-chatbots met Agentic AI op AWS Bedrock, een zelfherstellende scraper die via MCP natuurlijke taal spreekt, en een n8n + Terraform-pipeline die de provisioningtijd van infrastructuur met 80% verkortte.',
      ch4_chip1: 'RAG + AGENTIC AI',
      ch4_chip2: 'AWS BEDROCK',
      ch4_chip3: 'MCP · n8n · TERRAFORM −80% PROVISIONINGTIJD',
      ch5_era: 'VOLLE LADING',
      ch5_stamp: 'ELEKTRISCHE HYPERCAR · NU',
      ch5_title: 'Hoofdstuk 05 · Innovatieleider',
      ch5_now: 'NU',
      ch5_caption: 'Vandaag: Technisch Manager — Innovatieleider bij Cozentus, architect van intelligente systemen en de cloud eronder, mentor van 20+ ontwikkelaars via 15+ workshops — met de CEO Bonus vier jaar op rij.',
      stat_experience: 'Jaar Ervaring',
      stat_uptime: 'Platform Uptime',
      stat_workshops: 'AI/Cloud Workshops',
      stat_bonus: 'CEO Bonus Ontvangen',
      stat_success: 'Projectsuccesratio',
      garage_kicker: 'DE GARAGE',
      garage_title: 'Alles wat ik heb gebouwd en meedraag',
      garage_projects: 'Op de hefbruggen',
      garage_logbook: 'Onderhoudsboekje',
      garage_skills: 'De gereedschapswand',
      garage_cta_line: 'Het volgende hoofdstuk heeft een bijrijder nodig.',
      garage_cta: 'START DE MOTOR',
      garage_driver: 'De Bestuurder',
      driver_bio: "Ik ontwerp en ontwikkel intelligente systemen die de kloof overbruggen tussen grote taalmodellen en echte bedrijfsproblemen en bouw de cloudinfrastructuur die ze aandrijft. Van het ontwerpen van RAG-pipelines en Agentic AI-workflows tot het implementeren van schaalbare infrastructuur met Terraform, CI/CD-pipelines en AWS-cloudarchitectuur, transformeer ik complexe AI-mogelijkheden in producten die teams daadwerkelijk leveren. Aan de DevOps-kant heb ik 80% snellere provisioning bereikt met IaC-automatisering, een 99%+ platform uptime onderhouden en cloud-kostenoptimalisatie-initiatieven geleid. Mijn werk bestrijkt logistiek, supply chain en financiën, waar ik systemen heb gebouwd die 15.000+ schepen wereldwijd volgen en innovatieteams heb geleid die consequent leveren met een 95% succesratio.",
      proj_1_title: "RAG-chatbot met Agentic AI", proj_1_desc: "Enterprise-niveau conversationele AI aangedreven door AWS Bedrock met tool-aanroepen voor dynamische taakuitvoering, prompt engineering en LLM fine-tuning.",
      proj_2_title: "Agentic Scraping + MCP", proj_2_desc: "Zelfherstellend web scraping met natuurlijke taalinteractie. MCP-server integreert e-mail, Excel-logging, anomaliedetectie en database-updates in realtime.",
      proj_3_title: "Track & Trace — 3PL", proj_3_desc: "Realtime scheepszichtbaarheid voor 15.000+ schepen wereldwijd. ML-aangedreven voorspellende ETAs met AIS-feeds, geofencing en interactieve wereldwijde kaarten.",
      proj_4_title: "Enterprise Cloud Hosting Platform", proj_4_desc: "Gecentraliseerd AWS-hostingplatform als backbone voor meerdere bedrijfsapplicaties. End-to-end IaC met Terraform, geautomatiseerde monitoring, self-healing en alerting.",
      proj_5_title: "n8n Terraform Automatisering", proj_5_desc: "Automatiseringspipeline voor on-demand generatie van Terraform-scripts, reductie van infrastructuurprovisioningtijd met 80%.",
      proj_6_title: "Smart Drainage Systeem — Winnaar", proj_6_desc: "Smart Odisha Hackathon winnend project: IoT-gebaseerd slim drainagesysteem met overstromingsdetectie en realtimebeheer voor de overheid van Odisha.",
      skill_genai: "GenAI Stack", skill_aws: "AWS Cloud", skill_devops: "DevOps & Infrastructuur", skill_langs: "Talen & Frameworks", skill_aiml: "AI / ML & Analytics", skill_security: "Beveiliging & Netwerken",
      certs_label: "Certificeringen",
      role_title_1: "Technisch Manager — Innovatieleider", role_title_2: "Full Stack & Cloud Platform Engineer",
      rh_1_1: 'Ontwerp en ontwikkeling van een <strong>RAG-chatbot met Agentic AI & AWS Bedrock</strong>, met tool-aanroepen voor dynamische taakuitvoering in bedrijfsworkflows.',
      rh_1_2: 'Bouw van een <strong>zelfherstellende Agentic Scraping-oplossing</strong> met MCP-serverintegratie — natuurlijke taalinteractie, e-mail/Excel-logging en anomaliedetectie.',
      rh_1_3: 'Ontwerp van <strong>AWS-cloudinfrastructuur</strong> voor bedrijfsapplicaties met EC2, VPC, S3, Lambda, API Gateway, CloudWatch en DynamoDB met <strong>99%+ uptime</strong>.',
      rh_1_4: 'Ontwerp van een <strong>n8n + Terraform-automatiseringspipeline</strong> voor on-demand IaC-provisioning, met <strong>80%</strong> reductie van deployment-tijd. Standaardisering van omgevingen met <strong>Terraform & Ansible</strong>.',
      rh_1_5: 'Aansturing van <strong>cloud-kostenoptimalisatie</strong> met AWS Cost Explorer, resource right-sizing en gereserveerde instanties. Opzet van <strong>proactieve CloudWatch-monitoring</strong> ter vermindering van MTTR bij kritieke incidenten.',
      rh_1_6: 'Leiding van <strong>15+ cloud- & GenAI-workshops</strong> voor 20+ ontwikkelaars, versnelling van organisatiebrede adoptie van cloud-native AI-praktijken.',
      rh_1_7: 'Ontvangst van de <strong>CEO Bonus voor 4 opeenvolgende jaren</strong> voor het leveren van impactvolle innovatieve oplossingen met een <strong>95% projectsuccesratio</strong>.',
      rh_2_1: 'Levering van een <strong>AI-aangedreven scheepstrackingsysteem</strong> voor 3PL — realtime zichtbaarheid en voorspellende ETAs voor <strong>15.000+ schepen wereldwijd</strong> met 99% uptime.',
      rh_2_2: 'Ontwerp en beheer van <strong>AWS cloud-hostinginfrastructuur</strong> (EC2, S3, RDS, Lambda, CloudWatch) met <strong>hoge beschikbaarheid en fouttolerantie</strong> voor bedrijfskritische supply chain-apps.',
      rh_2_3: 'Bouw en onderhoud van <strong>CI/CD-pipelines voor 10+ applicaties</strong>, automatisering van build, test en deployment. Configuratie van <strong>VPC, beveiligingsgroepen, load balancers en DNS</strong>.',
      rh_2_4: 'Verbetering van ETA-nauwkeurigheid met <strong>ML-algoritmen & LLM-ondersteunde redenering</strong> voor analyse van roosters, havenoverlasting en gebeurtenisdata.',
      rh_2_5: 'Integratie van <strong>GenAI-aangedreven analytics</strong> (Qlik, ThoughtSpot, RAG-dashboards) in 5+ apps, verbetering van datatoegang voor <strong>300+ wereldwijde gebruikers</strong>.'
    },
    pl: {
      nav_contact: 'Kontakt',
      hero_kicker: 'DOTYCHCZASOWA JAZDA',
      hero_role: 'Programista GenAI i inżynier Cloud/DevOps',
      hero_hint: 'Przewiń, aby uruchomić silnik',
      ch1_era: 'PIERWSZY ZAPŁON',
      ch1_stamp: 'BENZ PATENT-MOTORWAGEN · 1886',
      ch1_title: 'Rozdział 01 · Początki na studiach',
      ch1_caption: 'Każda maszyna ma swoją pierwszą iskrę. Moja zapłonęła w Silicon Institute of Technology w Bhubaneswarze — studia B.Tech z informatyki i pierwsze linijki kodu, kreślone tak, jak Benz kreślił Patent-Motorwagen.',
      ch2_era: 'LINIA MONTAŻOWA',
      ch2_stamp: 'FORD MODEL T · 1908',
      ch2_title: 'Rozdział 02 · Nauka rzemiosła',
      ch2_caption: 'Podstawy, frameworki i nocne buildy — dostarczanie kodu tak, jak Ford dostarczał samochody: jedna niezawodna część na raz. W 2018 roku pojawiło się pierwsze trofeum — Smart Odisha Hackathon, wygrany dzięki opartemu na IoT inteligentnemu systemowi odwadniania dla rządu stanu Odisha.',
      ch2_plaque: 'SMART ODISHA HACKATHON · ZWYCIĘZCA 2018',
      ch3_era: 'OTWARTA DROGA',
      ch3_stamp: 'GRAND TOURER · 1965',
      ch3_title: 'Rozdział 03 · Pierwsze lata zawodowe',
      ch3_caption: 'Dołączenie do Cozentus Technologies jako Full Stack & Cloud Platform Engineer — dostarczenie opartego na AI systemu śledzenia statków z predykcyjnymi ETA dla 15 000+ statków, na infrastrukturze AWS zaprojektowanej na 99% dostępności, z pipeline’ami CI/CD obsługującymi 10+ aplikacji.',
      ch4_era: 'DOŁADOWANIE',
      ch4_stamp: 'ERA TURBO · 1987',
      ch4_title: 'Rozdział 04 · Zwrot ku GenAI',
      ch4_caption: 'Turbo nabiera obrotów: chatboty RAG z Agentic AI na AWS Bedrock, samonaprawiający się scraper rozmawiający w języku naturalnym przez MCP oraz pipeline n8n + Terraform, który skrócił czas provisioningu infrastruktury o 80%.',
      ch4_chip1: 'RAG + AGENTIC AI',
      ch4_chip2: 'AWS BEDROCK',
      ch4_chip3: 'MCP · n8n · TERRAFORM −80% CZASU PROVISIONINGU',
      ch5_era: 'PEŁNE NAŁADOWANIE',
      ch5_stamp: 'ELEKTRYCZNY HIPERSAMOCHÓD · TERAZ',
      ch5_title: 'Rozdział 05 · Lider Innowacji',
      ch5_now: 'TERAZ',
      ch5_caption: 'Dziś: Kierownik Techniczny — Lider Innowacji w Cozentus, projektujący inteligentne systemy i chmurę pod nimi, mentor 20+ programistów w ramach 15+ warsztatów — z Bonusem CEO przez cztery kolejne lata.',
      stat_experience: 'Lat doświadczenia',
      stat_uptime: 'Dostępność platformy',
      stat_workshops: 'Warsztaty AI/Cloud',
      stat_bonus: 'Bonus CEO przyznany',
      stat_success: 'Wskaźnik sukcesu',
      garage_kicker: 'GARAŻ',
      garage_title: 'Wszystko, co zbudowałem i co mam ze sobą',
      garage_projects: 'Na podnośnikach',
      garage_logbook: 'Książka serwisowa',
      garage_skills: 'Ściana narzędzi',
      garage_cta_line: 'Następny rozdział potrzebuje pilota.',
      garage_cta: 'URUCHOM SILNIK',
      garage_driver: 'Kierowca',
      driver_bio: "Projektuję i rozwijam inteligentne systemy, które wypełniają lukę między dużymi modelami językowymi a rzeczywistymi problemami biznesowymi i buduję infrastrukturę chmurową, która je zasila. Od projektowania pipeline'ów RAG i workflow'ów Agentic AI po wdrażanie skalowalnej infrastruktury z Terraform, pipeline'ami CI/CD i architekturą chmury AWS, przekształcam złożone możliwości AI w produkty, które zespoły faktycznie dostarczają. Po stronie DevOps osiągnąłem 80% szybsze provisioning dzięki automatyzacji IaC, utrzymuję 99%+ dostępność platformy i prowadzę inicjatywy optymalizacji kosztów chmury. Moja praca obejmuje logistykę, łańcuch dostaw i finanse, gdzie budowałem systemy śledzące 15 000+ statków na świecie i prowadziłem zespoły innowacyjne, które konsekwentnie dostarczają z 95% wskaźnikiem sukcesu.",
      proj_1_title: "Chatbot RAG z Agentic AI", proj_1_desc: "Konwersacyjna AI klasy enterprise zasilana przez AWS Bedrock z wywołaniami narzędzi do dynamicznego wykonywania zadań, prompt engineering i fine-tuning LLM.",
      proj_2_title: "Agentic Scraping + MCP", proj_2_desc: "Samonaprawiający się web scraping z interakcją w języku naturalnym. Serwer MCP integruje e-mail, logowanie Excel, wykrywanie anomalii i aktualizacje bazy danych w czasie rzeczywistym.",
      proj_3_title: "Track & Trace — 3PL", proj_3_desc: "Widoczność statków w czasie rzeczywistym dla 15 000+ statków na świecie. Predykcyjne ETA oparte na ML z feedami AIS, geofencingiem i interaktywnym mapowaniem.",
      proj_4_title: "Enterprise Cloud Hosting Platform", proj_4_desc: "Scentralizowana platforma hostingowa AWS jako kręgosłup wielu aplikacji korporacyjnych. End-to-end IaC z Terraform, automatyczny monitoring, self-healing i alerting.",
      proj_5_title: "Automatyzacja n8n Terraform", proj_5_desc: "Pipeline automatyzacji do generowania skryptów Terraform na żądanie, redukcja czasu provisioningu infrastruktury o 80%.",
      proj_6_title: "Smart Drainage System — Zwycięzca", proj_6_desc: "Zwycięski projekt Smart Odisha Hackathon: inteligentny system drenażowy oparty na IoT z detekcją powodzi i zarządzaniem w czasie rzeczywistym dla rządu Odisha.",
      skill_genai: "Stos GenAI", skill_aws: "Chmura AWS", skill_devops: "DevOps i Infrastruktura", skill_langs: "Języki i Frameworki", skill_aiml: "AI / ML i Analityka", skill_security: "Bezpieczeństwo i Sieci",
      certs_label: "Certyfikaty",
      role_title_1: "Kierownik Techniczny — Lider Innowacji", role_title_2: "Full Stack & Cloud Platform Engineer",
      rh_1_1: 'Zaprojektowanie i rozwinięcie <strong>chatbota RAG z Agentic AI i AWS Bedrock</strong>, integracja wywołań narzędzi do dynamicznego wykonywania zadań w workflow\'ach korporacyjnych.',
      rh_1_2: 'Budowa <strong>samonaprawiającego się rozwiązania Agentic Scraping</strong> z integracją serwera MCP — interakcja w języku naturalnym, logowanie e-mail/Excel i wykrywanie anomalii.',
      rh_1_3: 'Projektowanie <strong>infrastruktury chmury AWS</strong> dla aplikacji korporacyjnych z EC2, VPC, S3, Lambda, API Gateway, CloudWatch i DynamoDB z <strong>99%+ dostępnością</strong>.',
      rh_1_4: 'Zaprojektowanie <strong>pipeline\'u automatyzacji n8n + Terraform</strong> do provisioningu IaC na żądanie, skrócenie czasu wdrożenia o <strong>80%</strong>. Standaryzacja środowisk z <strong>Terraform i Ansible</strong>.',
      rh_1_5: 'Prowadzenie <strong>optymalizacji kosztów chmury</strong> z AWS Cost Explorer, odpowiednim doborem zasobów i instancjami zarezerwowanymi. Ustanowienie <strong>proaktywnego monitoringu CloudWatch</strong> zmniejszającego MTTR dla krytycznych incydentów.',
      rh_1_6: 'Prowadzenie <strong>15+ warsztatów cloud i GenAI</strong> dla 20+ programistów, przyspieszenie organizacyjnego wdrażania natywnych dla chmury praktyk AI.',
      rh_1_7: 'Otrzymanie <strong>Bonusu CEO przez 4 kolejne lata</strong> za dostarczanie innowacyjnych rozwiązań o dużym wpływie z <strong>95% wskaźnikiem sukcesu projektów</strong>.',
      rh_2_1: 'Dostarczenie <strong>systemu śledzenia statków opartego na AI</strong> dla 3PL — widoczność w czasie rzeczywistym i predykcyjne ETA dla <strong>15 000+ statków na świecie</strong> z 99% dostępnością.',
      rh_2_2: 'Projektowanie i zarządzanie <strong>infrastrukturą hostingu chmury AWS</strong> (EC2, S3, RDS, Lambda, CloudWatch) zapewniając <strong>wysoką dostępność i tolerancję błędów</strong> dla krytycznych aplikacji łańcucha dostaw.',
      rh_2_3: 'Budowa i utrzymanie <strong>pipeline\'ów CI/CD dla 10+ aplikacji</strong>, automatyzacja budowania, testowania i wdrażania. Konfiguracja <strong>VPC, grup bezpieczeństwa, load balancerów i DNS</strong>.',
      rh_2_4: 'Poprawa dokładności ETA za pomocą <strong>algorytmów ML i rozumowania wspomaganego przez LLM</strong> analizujących harmonogramy, zatory portowe i dane o zdarzeniach.',
      rh_2_5: 'Integracja <strong>analityki opartej na GenAI</strong> (Qlik, ThoughtSpot, dashboardy RAG) w 5+ aplikacjach, poprawa dostępu do danych dla <strong>300+ globalnych użytkowników</strong>.'
    }
  };

  var LANG_CODES = { en: 'EN', de: 'DE', nl: 'NL', pl: 'PL' };

  var currentLang = localStorage.getItem('lang') || 'en';
  if (!STORY_I18N[currentLang]) currentLang = 'en';

  function applyTranslations(lang) {
    var t = STORY_I18N[lang];
    if (!t) return;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) el.textContent = t[key];
    });

    // Rich-text strings (logbook bullets contain <strong>) go through innerHTML
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (t[key] !== undefined) el.innerHTML = t[key];
    });

    var code = document.getElementById('langCode');
    if (code) code.textContent = LANG_CODES[lang] || lang.toUpperCase();

    document.querySelectorAll('.lang-option').forEach(function (opt) {
      opt.classList.toggle('active', opt.dataset.lang === lang);
    });

    document.documentElement.lang = lang;
    currentLang = lang;
    localStorage.setItem('lang', lang);
  }

  function wireLangSwitcher() {
    var switcher = document.getElementById('langSwitcher');
    var btn = document.getElementById('langBtn');
    if (!switcher || !btn) return;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = switcher.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.addEventListener('click', function (e) {
      if (!switcher.contains(e.target)) {
        switcher.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    document.querySelectorAll('.lang-option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        applyTranslations(opt.dataset.lang);
        switcher.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ----------------------------------------------------------
  // Nav (solid after scroll + smooth anchor links)
  // ----------------------------------------------------------
  function wireNav(lenis) {
    var nav = document.getElementById('storyNav');

    function onScroll() {
      var y = lenis ? lenis.scroll : (window.scrollY || 0);
      nav.classList.toggle('is-solid', y > 50);
    }
    if (lenis) {
      lenis.on('scroll', onScroll);
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
    }
    onScroll();

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, { offset: 0 });
        } else {
          target.scrollIntoView();
        }
      });
    });
  }

  // ----------------------------------------------------------
  // Speedometer ticks (built once, used in both modes)
  // ----------------------------------------------------------
  function buildSpeedoTicks() {
    var g = document.getElementById('speedoTicks');
    if (!g) return;
    var CX = 48, CY = 48, R_OUT = 43.2, R_IN = 37.5;
    for (var i = 0; i < 8; i++) {
      var deg = -120 + (240 / 7) * i;
      // angle measured from 12 o'clock, converted to standard math coords
      var a = (deg - 90) * Math.PI / 180;
      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', (CX + R_IN * Math.cos(a)).toFixed(2));
      line.setAttribute('y1', (CY + R_IN * Math.sin(a)).toFixed(2));
      line.setAttribute('x2', (CX + R_OUT * Math.cos(a)).toFixed(2));
      line.setAttribute('y2', (CY + R_OUT * Math.sin(a)).toFixed(2));
      g.appendChild(line);
    }
  }

  // ----------------------------------------------------------
  // Boot
  // ----------------------------------------------------------
  function boot() {
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    applyTranslations(currentLang);
    wireLangSwitcher();

    if (reducedMotion) {
      // Static site: no Lenis, no GSAP, no 3D. Everything visible via CSS.
      wireNav(null);
      return;
    }

    // CDN-failure guard: if any animation library failed to load, skip ALL
    // animation setup so the page stays a static, natively-scrollable
    // document (every hidden state is gsap.set inside this path, so nothing
    // is left hidden). Nav falls back to plain anchor scrolling, same as the
    // reduced-motion path.
    if (!(window.gsap && window.ScrollTrigger && window.Lenis)) {
      wireNav(null);
      return;
    }

    buildSpeedoTicks();

    // --- Lenis + GSAP integration ---
    var lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    gsap.registerPlugin(ScrollTrigger);

    wireNav(lenis);

    // --- Speedometer needle + odometer ---
    var needle = document.getElementById('speedoNeedle');
    var odometer = document.getElementById('speedoOdometer');
    var needleBase = -120;
    var needleBlip = { v: 0 };

    function setNeedle() {
      if (!needle) return;
      var deg = Math.max(-120, Math.min(120, needleBase + needleBlip.v));
      needle.setAttribute('transform', 'rotate(' + deg.toFixed(2) + ' 48 48)');
    }

    ScrollTrigger.create({
      start: 0,
      end: function () { return ScrollTrigger.maxScroll(window); },
      onUpdate: function (self) {
        needleBase = -120 + 240 * self.progress;
        setNeedle();
      }
    });

    function setOdometer(label) {
      if (odometer) odometer.textContent = label;
    }

    // --- Gear-shift flash (speed lines + needle blip) ---
    var speedLines = document.getElementById('speedLines');
    function gearShift() {
      if (speedLines) {
        gsap.timeline()
          .to(speedLines, { opacity: 0.85, duration: 0.12, ease: 'power2.in' })
          .to(speedLines, { opacity: 0, duration: 0.45, ease: 'power2.out' });
      }
      gsap.timeline()
        .to(needleBlip, { v: 15, duration: 0.15, ease: 'power2.out', onUpdate: setNeedle })
        .to(needleBlip, { v: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)', onUpdate: setNeedle });
    }

    // --- HERO: split name into letters ---
    var heroStage = document.querySelector('.hero-stage');
    var letters = [];
    document.querySelectorAll('.hero-name > span').forEach(function (word) {
      var text = word.textContent;
      word.textContent = '';
      text.split('').forEach(function (ch) {
        var s = document.createElement('span');
        s.className = 'hero-letter';
        s.textContent = ch;
        word.appendChild(s);
        letters.push(s);
      });
    });

    // Role line hidden at scroll 0; revealed after the name letters land.
    // (Set here, non-reduced path only, so reduced motion keeps it visible.)
    gsap.set('.hero-role', { opacity: 0, y: 16 });

    // --- HERO pin: 200% scrub ---
    window.__heroProgress = 0;
    var heroProgress = { p: 0 };

    var heroTl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.hero-stage',
        start: 'top top',
        end: '+=200%',
        pin: true,
        scrub: true,
        onEnter: function () { setOdometer('IGN'); },
        onEnterBack: function () { setOdometer('IGN'); }
      }
    });

    // (a) name letters reveal in first 25%
    heroTl.to(letters, {
      opacity: 1,
      y: 0,
      stagger: { each: 0.25 / Math.max(letters.length, 1) },
      duration: 0.12,
      ease: 'power2.out'
    }, 0);

    // (a2) role line fades in once the name has landed (28-40% of the pin);
    // it lives inside .hero-overlay so it shares the fade-out at 0.85.
    heroTl.to('.hero-role', {
      opacity: 1,
      y: 0,
      duration: 0.12,
      ease: 'power2.out'
    }, 0.28);

    // (b) camera orbit progress 0..1 across the whole pin
    heroTl.to(heroProgress, {
      p: 1,
      duration: 1,
      onUpdate: function () { window.__heroProgress = heroProgress.p; }
    }, 0);

    // (c) overlay fades up & out near the end of the pin
    heroTl.to('.hero-overlay', { opacity: 0, y: -60, duration: 0.15, ease: 'power1.in' }, 0.85);
    heroTl.to('.hero-hint', { opacity: 0, duration: 0.1 }, 0.3);

    // --- CHAPTER pins: 250% scrub, shared choreography ---
    var isMobile = function () { return window.innerWidth <= 700; };
    var pf = function () { return isMobile() ? 0.5 : 1; }; // parallax intensity factor

    // Shared per-chapter skeleton: pin + parallax + copy reveal windows
    // (era 0-20%, title 10-30%, year 30-60%, caption 50-75%, stamp 60-75%).
    // All initial hidden states are set HERE (non-reduced path only) so the
    // reduced-motion early return leaves everything visible.
    // opts.subjectScale=false skips the slow subject zoom (chapter 4 animates
    // scaleX itself and the two would fight over the same property).
    function buildChapterTimeline(sel, odoLabel, opts) {
      opts = opts || {};

      gsap.set(sel + ' .chapter-era', { x: -48, opacity: 0 });
      gsap.set(sel + ' .chapter-title', { x: -48, opacity: 0 });
      gsap.set(sel + ' .chapter-caption', { opacity: 0, y: 24 });
      gsap.set(sel + ' .chapter-year', { opacity: 0, y: 40, skewY: 4 });
      gsap.set(sel + ' .era-stamp', { opacity: 0 });

      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sel,
          start: 'top top',
          end: '+=250%',
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onEnter: function () { setOdometer(odoLabel); gearShift(); },
          onEnterBack: function () { setOdometer(odoLabel); }
        }
      });

      // Parallax across the full pin (halved on mobile)
      tl.to(sel + ' .layer-bg', { yPercent: function () { return -4 * pf(); }, duration: 1 }, 0);
      tl.to(sel + ' .layer-mid', { yPercent: function () { return -10 * pf(); }, duration: 1 }, 0);
      tl.to(sel + ' .layer-subject',
        opts.subjectScale === false
          ? { yPercent: function () { return -18 * pf(); }, duration: 1 }
          : { yPercent: function () { return -18 * pf(); }, scale: 1.04, duration: 1 },
        0);
      tl.to(sel + ' .layer-fg', { yPercent: function () { return -30 * pf(); }, duration: 1 }, 0);

      // Copy choreography (timeline is normalized: duration 1 == full pin)
      tl.to(sel + ' .chapter-era', { x: 0, opacity: 1, duration: 0.2, ease: 'power2.out' }, 0);
      tl.to(sel + ' .chapter-title', { x: 0, opacity: 1, duration: 0.2, ease: 'power2.out' }, 0.1);
      tl.fromTo(sel + ' .chapter-year',
        { opacity: 0, y: 40, skewY: 4 },
        { opacity: 1, y: 0, skewY: 0, duration: 0.3, ease: 'power2.out' },
        0.3);
      tl.to(sel + ' .chapter-caption', { opacity: 1, y: 0, duration: 0.25, ease: 'power1.out' }, 0.5);
      tl.to(sel + ' .era-stamp', { opacity: 1, duration: 0.15, ease: 'power1.out' }, 0.6);

      return tl;
    }

    // --- CHAPTER 1 — 1886 blueprint: subject draws on via clip-path ---
    // Initial clip is set here (not in CSS) so no-JS/static fallbacks keep
    // the Benz and Model T artwork visible.
    gsap.set('.chapter-1 .layer-subject, .chapter-2 .layer-subject',
      { clipPath: 'inset(0% 100% 0% 0%)' });
    var ch1Tl = buildChapterTimeline('.chapter-1', 'CH 01');
    ch1Tl.fromTo('.chapter-1 .layer-subject',
      { clipPath: 'inset(0% 100% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'none' },
      0.2);

    // --- CHAPTER 2 — 1908 Model T: draw-on + brass hackathon plaque ---
    var ch2Tl = buildChapterTimeline('.chapter-2', 'CH 02');
    ch2Tl.fromTo('.chapter-2 .layer-subject',
      { clipPath: 'inset(0% 100% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'none' },
      0.2);
    // plaque stamps in with a slight rotate/settle at 70-85%
    gsap.set('.hackathon-plaque', { opacity: 0, rotation: -8, y: 26, transformOrigin: '50% 50%' });
    ch2Tl.to('.hackathon-plaque',
      { opacity: 1, rotation: -1.5, y: 0, duration: 0.15, ease: 'back.out(2.2)' },
      0.7);

    // --- CHAPTER 3 — 1965 grand tourer: slides in from the left + settles ---
    var ch3Tl = buildChapterTimeline('.chapter-3', 'CH 03');
    gsap.set('.chapter-3 .layer-subject', { xPercent: -8, opacity: 0 });
    ch3Tl.to('.chapter-3 .layer-subject',
      { xPercent: 0, opacity: 1, duration: 0.3, ease: 'power2.out' },
      0.15);

    // --- CHAPTER 4 — 1987 turbo wedge: fast entry from the right with a
    //     faked motion-blur stretch; speed lines streak the opposite way ---
    var ch4Tl = buildChapterTimeline('.chapter-4', 'CH 04', { subjectScale: false });
    gsap.set('.chapter-4 .layer-subject', { xPercent: 9, opacity: 0, scaleX: 1.06, transformOrigin: '50% 50%' });
    ch4Tl.to('.chapter-4 .layer-subject',
      { xPercent: 0, opacity: 1, scaleX: 1, duration: 0.22, ease: 'power3.out' },
      0.12);
    ch4Tl.to('.chapter-4 .layer-mid', { xPercent: -10, duration: 1 }, 0);
    // HUD chips stagger in 60-85%
    gsap.set('.chapter-4 .hud-chip', { opacity: 0, x: 28 });
    ch4Tl.to('.chapter-4 .hud-chip',
      { opacity: 1, x: 0, duration: 0.09, ease: 'power2.out', stagger: 0.08 },
      0.6);

    // --- CHAPTER 5 — electric hypercar: fade + rise, ribbons sweep on,
    //     dash-cluster stats count up 55-85% ---
    var ch5Tl = buildChapterTimeline('.chapter-5', 'CH 05');
    gsap.set('.chapter-5 .layer-subject', { opacity: 0, y: 60 });
    // ribbons start hidden (nested fromTo doesn't immediate-render)
    gsap.set('.chapter-5 .layer-mid', { clipPath: 'inset(0% 100% 0% 0%)' });
    ch5Tl.to('.chapter-5 .layer-subject',
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
      0.1);
    ch5Tl.fromTo('.chapter-5 .layer-mid',
      { clipPath: 'inset(0% 100% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.4, ease: 'none' },
      0.15);

    document.querySelectorAll('.chapter-5 .dash-stat').forEach(function (stat, i) {
      var valEl = stat.querySelector('.dash-value');
      var target = parseFloat(valEl.getAttribute('data-value')) || 0;
      var suffix = valEl.getAttribute('data-suffix') || '';
      var counter = { v: 0 };
      // HTML ships the final value (visible under reduced motion);
      // zero it out here and let the scrubbed tween count it back up.
      valEl.textContent = '0' + suffix;
      gsap.set(stat, { opacity: 0, y: 18 });
      var at = 0.55 + i * 0.05;
      ch5Tl.to(stat, { opacity: 1, y: 0, duration: 0.06, ease: 'power1.out' }, at);
      ch5Tl.to(counter, {
        v: target,
        duration: 0.1,
        ease: 'power1.out',
        onUpdate: function () { valEl.textContent = Math.round(counter.v) + suffix; }
      }, at);
    });

    // --- GARAGE finale: scroll-triggered once-reveals (not scrubbed) ---
    // Initial hidden states are set here only, so the reduced-motion early
    // return leaves the whole garage visible and static.
    var revealGroups = [
      { sel: '#garage .garage-head > *, #garage .garage-driver > h3, .driver-card, #garage .garage-projects > h3, .podium-card, #garage .garage-logbook > h3, .logbook-entry, #garage .garage-skills > h3, .tool-board, #garage .garage-certs > h3, .trophy-card, .garage-contact > *', y: 36, dur: 0.7, stagger: 0.1 },
      { sel: '.tool-chips li', y: 14, dur: 0.45, stagger: 0.025 }
    ];
    revealGroups.forEach(function (group) {
      var els = gsap.utils.toArray(group.sel);
      if (!els.length) return;
      gsap.set(els, { opacity: 0, y: group.y });
      ScrollTrigger.batch(els, {
        start: 'top 90%',
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: group.dur,
            ease: 'power2.out',
            stagger: group.stagger,
            overwrite: true
          });
        }
      });
    });

    // --- Garage + footer odometer states ---
    ScrollTrigger.create({
      trigger: '#garage',
      start: 'top 60%',
      onEnter: function () { setOdometer('GRG'); gearShift(); },
      onEnterBack: function () { setOdometer('GRG'); },
      onLeaveBack: function () { setOdometer('CH 05'); }
    });

    ScrollTrigger.create({
      trigger: '.story-footer',
      start: 'top 80%',
      onEnter: function () { setOdometer('END'); },
      onLeaveBack: function () { setOdometer('GRG'); }
    });

    // --- Hero 3D: dynamic import only when WebGL is viable ---
    var webglOK = false;
    try {
      if (window.WebGLRenderingContext) {
        var testCanvas = document.createElement('canvas');
        webglOK = !!(testCanvas.getContext('webgl2') || testCanvas.getContext('webgl'));
      }
    } catch (err) {
      webglOK = false;
    }

    if (webglOK) {
      import('./hero3d.js').catch(function () {
        if (heroStage) heroStage.classList.add('hero-fallback');
      });
    } else if (heroStage) {
      heroStage.classList.add('hero-fallback');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

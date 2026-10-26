import type {
  AgentPhase,
  ChipRegion,
  Credential,
  PathEntry,
  Project,
  SkillGroup,
  Stat,
  VoiceStop,
} from './types';

const credly = (id: string) => `https://www.credly.com/badges/${id}/public_url`;

export const site = {
  stats: [
    { value: '15,000+', labelKey: 'stats_vessels_label', scopeKey: 'stats_vessels_scope' },
    { value: '−80%', labelKey: 'stats_provisioning_label', scopeKey: 'stats_provisioning_scope' },
    { value: '99%+', labelKey: 'stats_uptime_label', scopeKey: 'stats_uptime_scope' },
    { value: '4', labelKey: 'stats_certs_label', scopeKey: 'stats_certs_scope' },
    { value: '5+', labelKey: 'stats_years_label', scopeKey: 'stats_years_scope' },
  ] satisfies Stat[],

  voiceStops: [
    { id: 'ring', titleKey: 'voice_ring_title', bodyKey: 'voice_ring_body' },
    { id: 'hear', titleKey: 'voice_hear_title', bodyKey: 'voice_hear_body' },
    { id: 'translate', titleKey: 'voice_translate_title', bodyKey: 'voice_translate_body' },
    { id: 'think', titleKey: 'voice_think_title', bodyKey: 'voice_think_body' },
    { id: 'speak', titleKey: 'voice_speak_title', bodyKey: 'voice_speak_body' },
  ] satisfies VoiceStop[],

  /** Monitoring panel rows: labels only, never numbers. */
  voiceMonitor: {
    titleKey: 'voice_monitor_title',
    rows: [
      { labelKey: 'voice_monitor_row_1' },
      { labelKey: 'voice_monitor_row_2' },
      { labelKey: 'voice_monitor_row_3' },
    ],
  } satisfies { titleKey: Project['titleKey']; rows: { labelKey: Project['titleKey'] }[] },

  /** Spec → Gate 1 → Plan → Gate 2 → Build → Verify → Gate 3 → Ship. */
  agentPhases: [
    { id: 'spec', pillKey: 'agents_pill_spec', statusKey: 'agents_status_spec', gateKey: 'agents_gate_1' },
    { id: 'plan', pillKey: 'agents_pill_plan', statusKey: 'agents_status_plan', gateKey: 'agents_gate_2' },
    { id: 'build', pillKey: 'agents_pill_build', statusKey: 'agents_status_build' },
    { id: 'verify', pillKey: 'agents_pill_verify', statusKey: 'agents_status_verify', gateKey: 'agents_gate_3' },
    { id: 'ship', pillKey: 'agents_pill_ship', statusKey: 'agents_status_ship' },
  ] satisfies AgentPhase[],

  /** Ids and labels only; colours are assigned with the chip in the infrastructure chapter. */
  chipRegions: [
    { id: 'compute', labelKey: 'infra_chip_compute' },
    { id: 'schedulers', labelKey: 'infra_chip_schedulers' },
    { id: 'cache', labelKey: 'infra_chip_cache' },
    { id: 'inference', labelKey: 'infra_chip_inference' },
    { id: 'agents', labelKey: 'infra_chip_agents' },
    { id: 'memory', labelKey: 'infra_chip_memory' },
    { id: 'cicd', labelKey: 'infra_chip_cicd' },
    { id: 'observability', labelKey: 'infra_chip_observability' },
    { id: 'network', labelKey: 'infra_chip_network' },
  ] satisfies ChipRegion[],

  /** Terminal lines typed as the chip regions light up, in order. */
  infraTerminal: [
    { textKey: 'infra_term_1' },
    { textKey: 'infra_term_2' },
    { textKey: 'infra_term_3' },
    { textKey: 'infra_term_4' },
    { textKey: 'infra_term_5' },
    { textKey: 'infra_term_6' },
  ] satisfies { textKey: Project['titleKey'] }[],

  projects: [
    {
      id: 'voice',
      categoryKey: 'proj_voice_category',
      titleKey: 'proj_voice_title',
      problemKey: 'proj_voice_problem',
      approachKey: 'proj_voice_approach',
      outcomeKey: 'proj_voice_outcome',
      stack: ['LiveKit', 'SIP', 'Asterisk', 'STT', 'RTT', 'Self-hosted LLM', 'TTS', 'Monitoring'],
      featured: true,
    },
    {
      id: 'sdlc',
      categoryKey: 'proj_sdlc_category',
      titleKey: 'proj_sdlc_title',
      problemKey: 'proj_sdlc_problem',
      approachKey: 'proj_sdlc_approach',
      outcomeKey: 'proj_sdlc_outcome',
      stack: ['Spec-driven development', 'Role agents', 'Human gates', 'Test-first', 'Mutation testing'],
      featured: true,
      repo: { href: 'https://github.com/ashutosh-nayak-official/agentic-sdlc-framework', labelKey: 'proj_sdlc_repo_label' },
    },
    {
      id: 'rag',
      categoryKey: 'proj_rag_category',
      titleKey: 'proj_rag_title',
      problemKey: 'proj_rag_problem',
      approachKey: 'proj_rag_approach',
      outcomeKey: 'proj_rag_outcome',
      stack: ['AWS Bedrock', 'RAG', 'Lambda', 'DynamoDB', 'Agentic AI'],
      featured: false,
    },
    {
      id: 'scraping',
      categoryKey: 'proj_scraping_category',
      titleKey: 'proj_scraping_title',
      problemKey: 'proj_scraping_problem',
      approachKey: 'proj_scraping_approach',
      outcomeKey: 'proj_scraping_outcome',
      stack: ['MCP', 'NLP', 'Self-Healing', 'Anomaly Detection'],
      featured: false,
    },
    {
      id: 'track',
      categoryKey: 'proj_track_category',
      titleKey: 'proj_track_title',
      problemKey: 'proj_track_problem',
      approachKey: 'proj_track_approach',
      outcomeKey: 'proj_track_outcome',
      stack: ['ML', 'AIS', 'Predictive Analytics', 'Big Data', 'Qlik', 'ThoughtSpot'],
      featured: false,
    },
    {
      id: 'hosting',
      categoryKey: 'proj_hosting_category',
      titleKey: 'proj_hosting_title',
      problemKey: 'proj_hosting_problem',
      approachKey: 'proj_hosting_approach',
      outcomeKey: 'proj_hosting_outcome',
      stack: ['AWS', 'Terraform', 'IaC', 'CloudWatch', 'Self-Healing'],
      featured: false,
    },
    {
      id: 'n8n',
      categoryKey: 'proj_n8n_category',
      titleKey: 'proj_n8n_title',
      problemKey: 'proj_n8n_problem',
      approachKey: 'proj_n8n_approach',
      outcomeKey: 'proj_n8n_outcome',
      stack: ['n8n', 'Terraform', 'IaC', 'CI/CD'],
      featured: false,
    },
    {
      id: 'drainage',
      categoryKey: 'proj_drainage_category',
      titleKey: 'proj_drainage_title',
      problemKey: 'proj_drainage_problem',
      approachKey: 'proj_drainage_approach',
      outcomeKey: 'proj_drainage_outcome',
      stack: ['IoT', 'Hackathon Winner', 'Govt. of Odisha'],
      featured: false,
    },
  ] satisfies Project[],

  /** Newest first. */
  path: [
    { dates: 'Jun 2025 → present', datesKey: 'path_dates_1', titleKey: 'path_title_1', orgKey: 'path_org_cozentus', bodyKey: 'path_body_1' },
    { dates: 'Jun 2023 → Jun 2025', datesKey: 'path_dates_2', titleKey: 'path_title_2', orgKey: 'path_org_cozentus', bodyKey: 'path_body_2' },
    { dates: 'Jun 2021 → Mar 2023', datesKey: 'path_dates_3', titleKey: 'path_title_3', orgKey: 'path_org_cozentus', bodyKey: 'path_body_3' },
    { dates: '2018', datesKey: 'path_dates_4', titleKey: 'path_title_4', orgKey: 'path_org_hackathon', bodyKey: 'path_body_4' },
    { dates: '2017 → 2021', datesKey: 'path_dates_5', titleKey: 'path_title_5', orgKey: 'path_org_college', bodyKey: 'path_body_5' },
  ] satisfies PathEntry[],

  credentials: [
    {
      name: 'AWS Certified Generative AI Developer — Professional',
      issuer: 'Amazon Web Services',
      href: credly('50474776-14fd-448c-9065-e9afd8b5f8c1'),
      badge: '/badges/aws-certified-generative-ai-developer-professional-EA.png',
      earlyAdopter: true,
    },
    {
      name: 'AWS Certified Generative AI Developer — Professional',
      issuer: 'Amazon Web Services',
      href: credly('2690d4e9-b081-4710-8dba-c2b5a4563804'),
      badge: '/badges/aws-certified-generative-ai-developer-professional.png',
    },
    {
      name: 'AWS Certified Machine Learning — Specialty',
      issuer: 'Amazon Web Services',
      href: credly('b8b0dd03-129a-41d5-b0fa-bb38bbf9d6fb'),
      badge: '/badges/aws-certified-machine-learning-specialty.png',
    },
    {
      name: 'AWS Certified Developer — Associate',
      issuer: 'Amazon Web Services',
      href: credly('aefab590-c7db-46f8-a15f-a3bcd2123d5e'),
      badge: '/badges/aws-certified-developer-associate.png',
    },
  ] satisfies Credential[],

  skills: [
    {
      groupKey: 'skill_genai',
      items: ['RAG Pipelines', 'LangChain', 'LlamaIndex', 'Dify AI', 'LangFlow', 'Prompt Engineering', 'LLM Fine-Tuning', 'Agentic AI', 'MCP Server', 'Vector DBs'],
    },
    {
      groupKey: 'skill_aws',
      items: ['EC2/ECS/EKS', 'Lambda', 'S3', 'VPC/Subnets', 'Route 53', 'CloudFront', 'API Gateway', 'IAM', 'CloudWatch', 'Cost Explorer', 'Bedrock', 'Cognito', 'SageMaker', 'Azure'],
    },
    {
      groupKey: 'skill_devops',
      items: ['Terraform', 'Ansible', 'CloudFormation', 'Docker', 'Jenkins', 'CI/CD Pipelines', 'Blue/Green Deploys', 'n8n Automation', 'Linux Admin', 'Shell Scripting', 'Monitoring & Alerting', 'Incident Response'],
    },
    {
      groupKey: 'skill_langs',
      items: ['Python', 'Java', 'JavaScript', 'SQL', 'Bash', 'Angular', 'MySQL/RDS', 'DynamoDB', 'Git', 'Auth0/Cognito'],
    },
    {
      groupKey: 'skill_aiml',
      items: ['Deep Learning', 'Machine Learning', 'Data Science', 'NLP', 'Predictive Analytics', 'BI/Qlik/ThoughtSpot'],
    },
    {
      groupKey: 'skill_security',
      items: ['IAM Policies', 'SSO/MFA', 'Encryption', 'Security Groups/NACLs', 'VPN/Peering', 'Load Balancers', 'DNS (Route 53)', 'Anomaly Detection'],
    },
  ] satisfies SkillGroup[],

  contact: {
    email: 'ashutosh.nayak.formal@gmail.com',
    linkedin: 'https://www.linkedin.com/in/ashutosh-nayak-81an',
    github: 'https://github.com/ashutosh-nayak-official',
  },
};

export type Site = typeof site;

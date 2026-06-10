#!/usr/bin/env bash
# Verifies all portfolio content survives the revamp. Greps across index.html + assets/js.
set -u
FILES=(index.html)
[ -d assets/js ] && FILES+=(assets/js/*.js)
fail=0
check() {
  if ! grep -qF -- "$1" "${FILES[@]}"; then echo "MISSING: $1"; fail=1; fi
}
# Identity & meta
check "Ashutosh Nayak — GenAI Developer & Cloud/DevOps Engineer"
check "assets/photos/Ghibli.png"
# Hero stats
check "5+"; check "99%+"; check "15+"; check "95%"
check "stat_experience"; check "stat_uptime"; check "stat_workshops"; check "stat_bonus"; check "stat_success"
# Experience
check "Cozentus Technologies, Bhubaneswar"
check "Jun 2023 → Present"; check "Jun 2021 → Mar 2023"
for k in rh_1_1 rh_1_2 rh_1_3 rh_1_4 rh_1_5 rh_1_6 rh_1_7 rh_2_1 rh_2_2 rh_2_3 rh_2_4 rh_2_5; do check "$k"; done
# Projects
for k in proj_1_title proj_2_title proj_3_title proj_4_title proj_5_title proj_6_title; do check "$k"; done
check "AWS Bedrock"; check "Smart Drainage System"
# Skills
check "RAG Pipelines"; check "Terraform"; check "LangChain"; check "EC2 / ECS / EKS"; check "Blue/Green Deploys"
# Certs
check "credly.com/badges/50474776-14fd-448c-9065-e9afd8b5f8c1"
check "credly.com/badges/2690d4e9-b081-4710-8dba-c2b5a4563804"
check "credly.com/badges/b8b0dd03-129a-41d5-b0fa-bb38bbf9d6fb"
check "credly.com/badges/aefab590-c7db-46f8-a15f-a3bcd2123d5e"
check "aws-certified-generative-ai-developer-professional-EA.png"
check "aws-certified-machine-learning-specialty.png"
# Contact
check "ashutosh.nayak.formal@gmail.com"
check "linkedin.com/in/ashutosh-nayak-81an"
check "+919778108181"
# i18n — all four dictionaries and the system
for k in 'en: {' 'de: {' 'nl: {' 'pl: {'; do check "$k"; done
check "data-i18n"; check "applyTranslations"
check "DIE ZUKUNFT ERKUNDEN"; check "DE TOEKOMST VERKENNEN"; check "ODKRYWAM PRZYSZŁOŚĆ"
# HP easter egg
check "I solemnly swear that I am up to no good"
check "Mischief Managed"; check "wandToggle"; check "data-magic"
# Theme toggle
check "themeToggle"; check "localStorage.getItem('theme')"
if [ $fail -eq 1 ]; then echo "CONTENT CHECK FAILED"; exit 1; else echo "CONTENT CHECK PASSED"; fi

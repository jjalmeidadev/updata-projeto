# Swim Lanes – Equiem Onboarding Data Intake

## Physical / Digital Evidence  
**What the user interacts with :** 

- Onboarding Portal  
- Login / Authentication Screen  
- Dynamic Web Forms  
- File Upload Interface (CSV / XLSX)  
- Validation Messages (errors / success / warnings)  
- End Notifications (processing complete)  
- Export Confirmation (CSV / JSON)
- Contributor Invitation Interface 
- Role Assignment Interface

---

## Customer Actions  
**What the user is doing :**

- Log in to the platform  
- Access onboarding project
- Can invite contributors to the onboarding project
- Assign permissions to contributors  
- Fill onboarding forms  
- Upload CSV / XLSX files  
- Save progress / draft  
- Correct validation errors  
- Re-upload corrected files  
- Submit section for review  
- Review feedback / comments  
- Resubmit corrected data  

---

## Frontstage (Visible Software Behavior)  
**What the system shows :**

- Displays onboarding dashboard  
- Shows required sections based on enabled modules
- Displays contributor management (invite + access control)
- Shows upload progress  
- Displays validation feedback  
- Highlights missing / invalid fields  
- Shows processing status:  
  - Pending  
  - Processing  
  - Completed  
  - Failed  
- Confirms submission / export  

---

## Backstage (Internal Processes)  
**What happens behind the scenes :**

- User authentication & session handling 
- Role and permission validation
- File storage in staging area  
- Schema validation  
- Required field validation  
- Data type validation  
- Business rule validation  
- Duplicate detection  
- Data standardization  
- Async / background file processing  
- Safe overwrite (upsert logic)  
- Version comparison engine    
- Data consolidation  
- Export package generation  
- Secure API push (JWT)  

---

## Support Processes  
**Services used by backstage processes :**

- Cloud Storage (files / staging data)  
- Background Job Queue / Async Processing Engine  
- Database  
- Validation Engine  
- Notification Service  
- Authentication Service  
- External APIs (Equiem / Provisioning)  
- Logging & Monitoring System
- Retry / Resilience Mechanism  
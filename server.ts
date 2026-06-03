/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environmental variables
dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGeminiSDK() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY') {
      console.warn("WARNING: GEMINI_API_KEY environment variable is missing or placeholder. Server Q&A operations will load fallback answers.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. AI Q&A Endpoint Proxying Gemini
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'System error: Prompt is a required parameter.' });
      }

      const client = getGeminiSDK();
      
      if (!client) {
        // Fallback gracefully with dynamic architect responses if key is missing or dummy
        console.log("No valid API key. Dispatching system architect expert responses.");
        const mockResponse = getDynamicArchitectMock(prompt);
        return res.json({ response: mockResponse });
      }

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: `You are the Principal Software Architect of the LONGHEALTH Hospital SaaS Platform.
Your goal is to provide rigorous, highly technical, production-grade architectural advice.
Your platform uses:
- Monorepo structure, Next.js dashboard clients with middleware-based subdomain routing (*.hospitalsaas.com)
- NestJS API Gateways with AsyncLocalStorage Tenant context resolution
- PostgreSQL schemas for tenant isolation (one schema per hospital) with strict Row Level Security (RLS)
- Redis for system caching and WebSocket session adapter
- BullMQ on Redis for asynchronous heavy processing workers (SMS alert dispatch, DICOM lab scan parsing, PDF compilation)
- AWS S3 for clinical binaries, utilizing KMS Encryption and Temporal Presigned URLs (15-min TTL)
- OpenTelemetry combined with Prometheus/Grafana for observability

Write concrete, production-ready code samples (TypeScript, Prisma, Docker, SQL policies) in markdown code fences when requested. Speak authoritatively, with clinical accuracy. No fluff or conversational delay.`
        }
      });

      res.json({ response: response.text });
    } catch (error: any) {
      console.error("Gemini API error during call execution:", error);
      res.status(500).json({ 
        error: error.message || 'An error occurred while compiling your architect query.' 
      });
    }
  });

  // 1A. AI Symptom Assistant Endpoint
  app.post('/api/clinical-ai/symptoms', async (req, res) => {
    try {
      const { symptoms, age, gender, history } = req.body;
      if (!symptoms) {
        return res.status(400).json({ error: 'Symptom description is required.' });
      }

      const client = getGeminiSDK();

      if (!client) {
        console.log("No valid API key. Dispatching clinical mock symptom diagnostic.");
        const mockAssessment = getSymptomMockFallback(symptoms, age, gender, history);
        return res.json(mockAssessment);
      }

      const promptMsg = `Analyze the following patient demographics and symptoms, and provide a medical-grade triage, possible condition candidates, risk levels, and recommended specialist department:
Patient: ${gender || 'Unknown'}, Age: ${age || 'Unknown'}.
Medical History: ${history || 'None declared'}.
Presented Symptoms: "${symptoms}"

Please return a raw JSON object string matching EXACTLY this typescript interface (Do not add wrapping markdown code fences around the JSON - output ONLY the pure JSON string):
{
  "triageUrgency": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "differentialDiagnoses": string[],
  "potentialCauses": string,
  "clinicalSpecialist": string,
  "safetyAdvisory": string,
  "recommendedTests": string[],
  "detailedExplanation": string
}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptMsg,
        config: {
          systemInstruction: "You are an AI Clinical Triage Agent built into the LONGHEALTH platform. Provide objective, cautious medical-grade diagnostics. Always output raw JSON text only, without markdown formatting.",
          responseMimeType: "application/json"
        }
      });

      const parsedJson = JSON.parse(response.text || '{}');
      res.json(parsedJson);
    } catch (error: any) {
      console.error("Symptom analyzer error:", error);
      res.status(500).json({ 
        error: 'Failed to evaluate symptoms using AI. Falling back to platform engines.',
        fallback: getSymptomMockFallback(req.body.symptoms || '', req.body.age, req.body.gender, req.body.history)
      });
    }
  });

  // 1B. Clinical Voice Notes Transcribe & SOAP Compiler Endpoint
  app.post('/api/clinical-ai/voice-record', async (req, res) => {
    try {
      const { transcript } = req.body;
      if (!transcript) {
        return res.status(400).json({ error: 'Clinical transcript/dictation text is required.' });
      }

      const client = getGeminiSDK();

      if (!client) {
        console.log("No valid API key. Compiling structured medical mock SOAP Note.");
        const mockSoap = getSoapMockFallback(transcript);
        return res.json(mockSoap);
      }

      const promptMsg = `Construct a highly polished, professional SOAP (Subjective, Objective, Assessment, Plan) note from the following clinical transcription dictation:
"${transcript}"

Please return a raw JSON object matching the following fields. Complete each section with professional clinical phrasing (including an estimated ICD-10 code and diagnostic tier):
{
  "subjective": "Chief complaint, symptom chronology, HPI, ROS, social history from transcript",
  "objective": "Objective measurements, systemic observations, vital readings mentioned or assumed",
  "assessment": "Clinical primary impression, differential candidates, ICD-10 category",
  "plan": "Therapeutic plan, medication prescriptions dosage, dietary edits, diagnostic referrals, return guidelines",
  "urgency": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "icdCode": "E.g. I10, J03.9",
  "suggestedSpecialist": "E.g. Cardiology, Pediatrics"
}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptMsg,
        config: {
          systemInstruction: "You are an AI Medical Transcriptionist and SOAP compiler inside the clinical EMR module of LONGHEALTH. Convert colloquial dictation to elegant medical-grade summaries.",
          responseMimeType: "application/json"
        }
      });

      const parsedJson = JSON.parse(response.text || '{}');
      res.json(parsedJson);
    } catch (error: any) {
      console.error("SOAP note compile error:", error);
      res.status(500).json({ 
        error: 'Failed to compile dictation note via AI.',
        fallback: getSoapMockFallback(req.body.transcript || '')
      });
    }
  });

  // 1C. Static Sample Dictations Endpoint
  app.get('/api/clinical-ai/sample-transcripts', (req, res) => {
    res.json([
      {
        id: "d1",
        title: "Chest tightness & Dyspnea",
        text: "Patient presents with persistent chest heaviness over the past 4 hours. Radiating to left shoulder. Reports dyspnea on exertion, mild nausea. BP is high at 145/92, respiratory rate 20. No previous coronary history but smoking pack-a-day since 10 years. Family history significant for premature coronary artery disease."
      },
      {
        id: "d2",
        title: "Acute Cough & Low Fever",
        text: "6-year-old child presents with barking cough starting 2 nights ago. Temp check indicates 101.3. Wheezing audible on high exertion. Throat swab collected for diagnostics. Parent describes throat soreness. Resting heart rate 94, oxygen saturation 98%. No asthma history."
      },
      {
        id: "d3",
        title: "Diabetic Foot Exam Check",
        text: "62-year-old patient with Type-2 Diabetes presents for routine diabetic check. Reports minor numbness in distal bilateral lower extremities. Daily glucose logs average 140. BP is 130/80. Monofilament exam reveals minor sensory deficit at first metatarsal head of left foot. Skin is dry but intact, no ulcers found."
      }
    ]);
  });

  // 1D. Followup Trigger Endpoint
  app.post('/api/clinical/followups', (req, res) => {
    const { appointmentId, patientCode, type, message } = req.body;
    // Simulate immediate enqueue in BullMQ
    res.json({
      success: true,
      jobId: `sh_job_${Math.floor(Math.random() * 100000)}`,
      status: "QUEUED",
      recipient: patientCode || "P-90082",
      type: type || "SMS",
      message: message || "Automated checkup reminder dispatched",
      dispatchedAt: new Date().toISOString()
    });
  });

  // 1E. Analytics Feed Endpoint
  app.get('/api/clinical/analytics', (req, res) => {
    res.json({
      telemedicine: {
        totalHours: 1240,
        completedSessions: 844,
        activeSchedules: 28,
        byDepartment: [
          { name: "General Medicine", value: 380 },
          { name: "Cardiology", value: 210 },
          { name: "Pediatrics", value: 180 },
          { name: "Neurology", value: 120 },
          { name: "Oncology", value: 154 }
        ]
      },
      patientRiskScores: [
        { name: "Low Risk (Triage C3)", value: 480 },
        { name: "Medium Risk (Triage C2)", value: 310 },
        { name: "High Risk (Triage C1)", value: 145 },
        { name: "Critical Emergency (Triage C0)", value: 42 }
      ],
      pharmacyInventoryAlerts: [
        { name: "Amoxicillin Labs", stock: 120, threshold: 50 },
        { name: "Atorvastatin Tabs", stock: 42, threshold: 60, alert: true },
        { name: "Insulin Infusion", stock: 15, threshold: 30, alert: true },
        { name: "Metformin 500mg", stock: 240, threshold: 50 },
        { name: "Ibuprofen Tabs", stock: 18, threshold: 40, alert: true }
      ],
      laboratoryTurnaround: [
        { name: "ECG Standard", hours: 0.5 },
        { name: "Cardiac Enzymes", hours: 1.5 },
        { name: "Blood Panels (CBC)", hours: 4.2 },
        { name: "Urinalysis Strip", hours: 2.0 },
        { name: "Endocrine Assay", hours: 24.0 }
      ],
      patientDistribution: {
        outpatients: 1840,
        inpatients: 245,
        observation: 88,
        dischargedThisMonth: 610
      }
    });
  });

  // Core helper mocks for fallbacks
  function getSymptomMockFallback(symptoms: string, age?: number, gender?: string, history?: string) {
    const sLower = symptoms.toLowerCase();
    let triageUrgency = "MODERATE";
    let differentialDiagnoses = ["Viral Respiratory Infection", "Allergic Rhinitis"];
    let potentialCauses = "Potential inflammation of the upper or lower respiratory system, or transient viral irritation.";
    let clinicalSpecialist = "General Practitioner / Family Medicine";
    let safetyAdvisory = "Monitor body temperature. Maintain rich hydration. Seek offline physician check if symptoms aggravate or dyspnea presents.";
    let recommendedTests = ["Complete Blood Count (CBC)", "RT-PCR Throat Swab"];
    let detailedExplanation = "Evaluated via fallback diagnostic engine: Patient symptoms suggest a mild/moderate localized respiratory or sensory irritation. Advised to log daily temperature metrics.";

    if (sLower.includes('chest') || sLower.includes('heart') || sLower.includes('cardiac') || sLower.includes('breathing') || sLower.includes('airway')) {
      triageUrgency = "CRITICAL";
      differentialDiagnoses = ["Ischemic Coronary Malfunction", "Myocardial Infarction", "Incipient Myocarditis", "Pulmonary Embolus"];
      potentialCauses = "Suspected localized cardiac myocardial ischemia or major airway restriction requiring urgent continuous triage.";
      clinicalSpecialist = "Cardiology & Emergency Medical Services (ER)";
      safetyAdvisory = "IMMEDIATE DANGER ADVISORY: Do not undergo exertion. If chest pressure lasts >5 minutes or is accompanied by left arm fatigue or sweating, call local emergency services immediately.";
      recommendedTests = ["12-Lead Electrocardiography (ECG)", "Serum Troponin I & T Assay", "CT Coronary Angiogram"];
      detailedExplanation = "High-urgency response triggered under safety parameters. Patient is marked for critical cardiology review to exclude myocardial injury.";
    } else if (sLower.includes('head') || sLower.includes('headache') || sLower.includes('shaking') || sLower.includes('seizure')) {
      triageUrgency = "HIGH";
      differentialDiagnoses = ["Atypical Migraine Syndrome", "Intracranial Hypertension", "Subarachnoid Hemorrhage (differential)"];
      potentialCauses = "Severe neurovascular compression or autonomic nervous hypersensitivity.";
      clinicalSpecialist = "Neurology Division";
      safetyAdvisory = "Avoid high-glare lighting and screens. Record pain triggers and vascular pulsations. Seek emergency check room if accompanied by stiff neck or speech slurs.";
      recommendedTests = ["Non-Contrast Brain CT Scan", "Neurological Pupillary Response Exam"];
      detailedExplanation = "Classified as High Priority. Evaluated neurovascular indicators are suggestive of transient cranial hypertension or classical neural migraines.";
    }

    return {
      triageUrgency,
      differentialDiagnoses,
      potentialCauses,
      clinicalSpecialist,
      safetyAdvisory,
      recommendedTests,
      detailedExplanation: `(DEMO ENGINE MOCK ACTIVE) ${detailedExplanation}`
    };
  }

  function getSoapMockFallback(transcript: string) {
    const tLower = transcript.toLowerCase();
    let subjective = "Patient reports persistent symptoms over several days. Notes moderate throat dryness.";
    let objective = "Clinician notes patient alert and cooperate. SBP is recorded as 120/80, HR 74 BPM. Resp rate 16.";
    let assessment = "Acute Nasopharyngitis. ICD-10 Category: J00. Moderate priority.";
    let plan = "Recommend warm saline gargle thrice daily. Fluid intake >2L daily. Ibuprofen 400mg PRN for headache or high muscle soreness.";
    let urgency = "LOW";
    let icdCode = "J00.0";
    let suggestedSpecialist = "General Practice";

    if (tLower.includes('chest') || tLower.includes('pain') || tLower.includes('breath') || tLower.includes('shoulder')) {
      subjective = "Patient reports central chest heavy pressure starting 4 hours ago. Radiating to left arm. Reports intermittent dyspnea.";
      objective = "Vitals check shows SBP 145/92, Heart Rate 88 BPM, Temp 98.6F, O2 Sat 96%. Patient appears anxious and diaphoretic.";
      assessment = "Angina Pectoris, Unspecified. ICD-10 Category: I20.9. Rule out Acute Coronary Syndrome (ACS).";
      plan = "Refer to emergency room immediately. Rest. Perform 12-lead ECG stat. Order troponins stat. Administer Aspirin 325mg chewed.";
      urgency = "CRITICAL";
      icdCode = "I20.9";
      suggestedSpecialist = "Cardiology / Emergency";
    } else if (tLower.includes('diabetic') || tLower.includes('glucose') || tLower.includes('numb')) {
      subjective = "62-year-old with longstanding Type-2 Diabetes reports mild distal bilateral extremity numbness. Average glucose ranges 140-160.";
      objective = "BP 130/80. Left foot monofilament testing exhibits sensory reduction J05 at first metatarsal. Dorsalis pedis pulse 2+ bilateral.";
      assessment = "Diabetic Peripheral Polyneuropathy. ICD-10 Category: E11.40.";
      plan = "Review diabetic hygiene guidelines. Wear protective footwear at all times. Opt for daily inspection of bilateral sole areas. Referral to Podiatry.";
      urgency = "MODERATE";
      icdCode = "E11.40";
      suggestedSpecialist = "Endocrinology / Podiatry";
    }

    return {
      subjective,
      objective,
      assessment,
      plan,
      urgency,
      icdCode,
      suggestedSpecialist
    };
  }

  // 2. Hot-reload / Static Assets middlewares
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LONGHEALTH-Console-Server] Online and running at http://localhost:${PORT}`);
  });
}

function getDynamicArchitectMock(prompt: string): string {
  const pLowercase = prompt.toLowerCase();
  
  if (pLowercase.includes('auth') || pLowercase.includes('guard') || pLowercase.includes('role')) {
    return `### **NestJS Custom Role & Tenant Authorization Guard**

For HIPAA multi-tenancy, our gateway monitors clinical roles while mapping tenant context to header elements.

\`\`\`typescript
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class HttpTenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    
    // Core check: extract tenant claim
    const idHeader = req.headers['x-tenant-id'];
    if (!idHeader) {
      throw new Error('Tenant execution token not found');
    }
    
    // Inject tenant token safely
    req.tenantId = idHeader;
    return next.handle();
  }
}
\`\`\`

**Aesthetic pairings**: Matches "AsyncLocalStorage" for context containment.`;
  }
  
  if (pLowercase.includes('audit') || pLowercase.includes('hipaa') || pLowercase.includes('log')) {
    return `### **HIPAA Immutable Medical Activity Audit logs**

Clinical actions trigger permanent auditing logs inside designated system schemas. Here is our database schema and trigger:

\`\`\`sql
CREATE TABLE audit.clinical_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id VARCHAR(100) NOT NULL,
  tenant_id VARCHAR(50) NOT NULL,
  target_resource VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  payload JSONB,
  signature_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deny updates or deletes on audit pools
CREATE RULE "prevent_audits_updates" AS ON UPDATE TO audit.clinical_ledger DO INSTEAD NOTHING;
CREATE RULE "prevent_audits_deletes" AS ON ON DELETE TO audit.clinical_ledger DO INSTEAD NOTHING;
\`\`\`

This ensures medical record access patterns are immutable.`;
  }

  if (pLowercase.includes('bull') || pLowercase.includes('retry') || pLowercase.includes('redis')) {
    return `### **BullMQ Queue Retries and Redis Backoff Pattern**

Workers run in independent container sandboxes. We scale these consumers to handle long-running medical processing tasks, using exponential backoffs to recover from transient downstream errors.

\`\`\`typescript
import { Queue } from 'bullmq';

export const medicalQueue = new Queue('clinical-demographics-sync', {
  connection: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: 6379,
  },
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000 // starts with 5s
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});
\`\`\`

This preserves server memory when handling high workloads.`;
  }

  return `### **LONGHEALTH Architectural Query Analysis**

Your query was analyzed by the Principal Architect: **"${prompt}"**

#### **Our System Design Decisions:**
1. **Routing Strategy**: Next.js wildcard route rewriting dynamically targets virtual tenant directory structures inside subdomains while keeping core URLs isolated.
2. **PostgreSQL Multi-Tenancy**: Standard clients leverage dynamic schema pooling based on the connection pool manager context header. Unenrolled public registries use Row Level Security (RLS).
3. **Async BullMQ Broker**: Redis operates as our in-memory queue coordinator, keeping heavy processes decoupled from typical HTTP gateways.
4. **AWS S3 Assets Protection**: IAM containment rules prevent cross-tenant directory access, and objects are retrieved using temporal pre-signed URLs with a 15-minute expiration limit.

*Note: Configure a active \`GEMINI_API_KEY\` in your AI Studio Secrets panel to unlock custom code-generation and chat features with this assistant.*`;
}

startServer();

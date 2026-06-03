/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArchitectureNode } from '../types';

export const ARCHITECTURE_NODES: ArchitectureNode[] = [
  {
    id: 'cloudflare',
    label: 'Cloudflare CDN & WAF',
    category: 'routing',
    description: 'Dynamic edge routing, DDoS shielding, SSL termination, and tenant subdomain resolution.',
    details: 'Leverages Cloudflare Rulesets to intercept wildcard requests like *.hospitalsaas.com. Checks geographic routing rules and provides DDoS/WAF filtering before hitting the core AWS NLB. Handles SSL termination at the edge with custom SSL certs for custom hospital domains (e.g., portal.greenwoodhospital.org).',
    codeSnippet: `# Cloudflare Edge Ruleset snippet for Tenant Isolation
# Match tenant hostname from requests
http.host matches "^[a-zA-Z0-9-]+\\\.hospitalsaas\\\.com$"
# Action: Route to core backend cluster, inject header: "X-Tenant-Resolver"`,
    codeLanguage: 'yaml',
    connections: ['alb', 'nextjs'],
    interfaces: ['HTTPS/443', 'WAF Rules', 'gRPC Edge']
  },
  {
    id: 'alb',
    label: 'AWS Network Load Balancer (NLB)',
    category: 'routing',
    description: 'Ultra low-latency L4 load balancers routing high throughput traffic to ECS Fargate containers.',
    details: 'Configured with sticky sessions for WebSocket nodes and direct connection routing. Handles TLS termination where necessary or passes TCP traffic directly to Express/Vite or NestJS gateway pools. Configured across multiple Availability Zones with Auto Scaling groups reacting to system load.',
    connections: ['nextjs', 'nestjs-gateway'],
    interfaces: ['L4 TCP', 'Target Groups', 'Health Checks']
  },
  {
    id: 'nextjs',
    label: 'Next.js Multi-Tenant Web Clients',
    category: 'compute',
    description: 'SSR & ISR client applications with dynamic middleware-based tenant host resolution.',
    details: 'A unified Next.js monorepo serving distinct dashboards for Super Admins, Doctors, Patients, and Pharmacists. Uses Next.js Middleware to extract the host/subdomain, fetch tenant-specific visual theme rules, and rewrite paths dynamically to virtual directory buckets without breaking client-side routing.',
    codeSnippet: `// middleware.ts - Next.js Subdomain/Tenant Routing Layer
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  
  // Extract tenant name from host (e.g. greenwood.hospitalsaas.com)
  const isCustomDomain = !hostname.endsWith('hospitalsaas.com');
  let tenant = '';
  
  if (isCustomDomain) {
    tenant = hostname; // Lookup custom domain in Redis/DB later
  } else {
    tenant = hostname.split('.')[0];
  }

  // Prevent routing loop for API/assets
  if (url.pathname.startsWith('/_next') || url.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Rewrite request to the virtual tenant route
  url.pathname = \`/tenant/\${tenant}\${url.pathname}\`;
  
  const response = NextResponse.rewrite(url);
  response.headers.set('X-Tenant-ID', tenant);
  return response;
}`,
    codeLanguage: 'typescript',
    connections: ['nestjs-gateway'],
    interfaces: ['React Server Components', 'Tailwind CSS v4', 'Dynamic Host Headers']
  },
  {
    id: 'nestjs-gateway',
    label: 'NestJS BFF / API Gateway',
    category: 'compute',
    description: 'Centrally manages authentication, rate limiting, logging, and metrics, routing API calls to microservices.',
    details: 'Acts as the single entrance point for WebSocket connections and REST requests. Injects authentication payloads into backend contexts. Resolves the Tenant Context utilizing the X-Tenant-Id header or dynamic Host Lookup, binding database connection pools on the fly.',
    codeSnippet: `// tenant-context.interceptor.ts - NestJS Tenant Interceptor
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'] || request.headers['X-Tenant-ID'];
    
    if (!tenantId) {
      throw new BadRequestException('X-Tenant-ID header is missing');
    }
    
    // Store tenant ID in AsyncLocalStorage execution context
    request.tenantId = tenantId;
    return next.handle();
  }
}`,
    codeLanguage: 'typescript',
    connections: ['postgres', 'redis', 'bullmq-producer', 's3', 'websockets-server'],
    interfaces: ['REST JSON API', 'Springboard AuthZ Check', 'AsyncLocalStorage Tracker']
  },
  {
    id: 'websockets-server',
    label: 'WebSocket Gateway (NestJS & Socket.io)',
    category: 'realtime',
    description: 'Bi-directional, low-latency live channels for clinical vitals, patient alerts, and prescriptions.',
    details: 'Uses Socket.io with Redis Adapter to facilitate infinite horizontal scaling. Features heartbeat health monitoring and automatic reconnection. Feeds live operational states (such as active ward emergency rooms, bed occupancy alerts, and electronic health record streams) straight to UI clients.',
    codeSnippet: `// websockets.gateway.ts - Real-time NestJS Gateways
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from './ws-jwt.guard';

@WebSocketGateway({ cors: true, namespace: 'realtime' })
@UseGuards(WsJwtGuard)
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    const tenantId = client.handshake.headers['x-tenant-id'];
    client.join(\`tenant_room_\${tenantId}\`);
    console.log(\`Client connected: \${client.id} joined tenant: \${tenantId}\`);
  }

  handleDisconnect(client: Socket) {
    console.log(\`Client disconnected: \${client.id}\`);
  }

  // Stream Clinical Patient Vitals
  broadcastVitals(tenantId: string, patientId: string, vitalsPayload: any) {
    this.server.to(\`tenant_room_\${tenantId}\`).emit(\`vitals_\${patientId}\`, vitalsPayload);
  }
}`,
    codeLanguage: 'typescript',
    connections: ['nextjs', 'redis'],
    interfaces: ['Socket.io Stream', 'WSS Gateway Adapter', 'Redis Pub/Sub Sync']
  },
  {
    id: 'postgres',
    label: 'PostgreSQL Multitenant Database Cluster',
    category: 'storage',
    description: 'High-availability relational store. Uses Multi-Tenant Schema Isolation and Row-Level Security (RLS).',
    details: 'Configured with master-replica node arrays for auto-failover and scale-out read pools. Each tenant owns a dedicated PostgreSQL Schema to maximize partition isolation and backup flexibility, while core tables (billing subscriptions, usage metrics, catalog definitions) operate in a master public schema with RLS enforced.',
    codeSnippet: `-- tenant-schema-and-rls.sql - PostgreSQL Tenant Configurations
CREATE SCHEMA IF NOT EXISTS tenant_greenwood;

-- Example of dynamic connection routing pool check
-- RLS Policy on Master Auth User Mapping table
CREATE TABLE public.tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_user_isolation_policy ON public.tenant_users
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true));`,
    codeLanguage: 'sql',
    connections: ['nestjs-gateway', 'bullmq-worker'],
    interfaces: ['Schema Isolation Dynamic Pool', 'Row Level Security SQL', 'PgPool Container']
  },
  {
    id: 'redis',
    label: 'Redis Cache & Pub/Sub',
    category: 'queue',
    description: 'In-memory data grid powering API caches, active user sessions, and horizontal WebSocket synchronization.',
    details: 'Redis Cluster nodes serve as cache proxies (handling high-frequency doctor/clinic lookup calls using a Cache-Aside strategy) as well as the active Pub/Sub broker keeping Socket.io clients synced across distinct container nodes in AWS Fargate.',
    connections: ['nestjs-gateway', 'websockets-server', 'bullmq-producer', 'bullmq-worker'],
    interfaces: ['REsponSive Client Connections', 'Redis Cluster Protocols', 'Pub/Sub Broker Channels']
  },
  {
    id: 'bullmq-producer',
    label: 'BullMQ Job Producers',
    category: 'queue',
    description: 'Enqueues background processes (e.g. PDF generation, EHR audit logs, pharmacies notifications, lab PDF parses).',
    details: 'Injects reliable job queues inside the API route controller lifespan. Decouples expensive CPU-bound computational cycles from the primary request-response loop to uphold API response metrics < 50ms.',
    codeSnippet: `// billing-queue.service.ts - BullMQ Job Dispatcher
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class BillingQueueService {
  constructor(
    @InjectQueue('billing-invoice-jobs') private invoiceQueue: Queue
  ) {}

  async enqueueInvoiceGeneration(tenantId: string, billingId: string, items: any[]) {
    await this.invoiceQueue.add('generate-pdf-invoice', {
      tenantId,
      billingId,
      items,
      timestamp: new Date().toISOString()
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000 // Retry every 5s exp
      },
      removeOnComplete: true
    });
  }
}`,
    codeLanguage: 'typescript',
    connections: ['redis'],
    interfaces: ['Standard FIFO Queues', 'BullMQ Producers API']
  },
  {
    id: 'bullmq-worker',
    label: 'BullMQ Async Workers Pool',
    category: 'queue',
    description: 'Distinct, auto-scaled container pods pulling background jobs off Redis.',
    details: 'Independent compute instances powered by NestJS Microservices. Listens to specific Redis keys, executes resource-heavy operations (generating PDFs, scraping pharmaceutical inventories, analyzing image blobs, or syncing HL7 medical feeds), outputs final logs to S3, and updates tenant SQL schemas.',
    codeSnippet: `// invoice-pdf.processor.ts - BullMQ Worker Processor
import { Processor, Process, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { S3Service } from './s3.service';
import { PrismaService } from './prisma.service';

@Processor('billing-invoice-jobs')
export class BillingInvoiceProcessor {
  constructor(
    private readonly s3Service: S3Service,
    private readonly prisma: PrismaService
  ) {}

  @Process('generate-pdf-invoice')
  async handleInvoiceGeneration(job: Job<{ tenantId: string; billingId: string; items: any[] }>) {
    const { tenantId, billingId, items } = job.data;
    
    // 1. Generate PDF stream mock (in production we use pdfkit/puppeteer)
    const pdfBuffer = Buffer.from(\`Invoice PDF content for invoice: \${billingId} with items: \${JSON.stringify(items)}\`);
    
    // 2. Upload to Private S3 Key
    const s3Path = \`tenants/\${tenantId}/billing/\${billingId}.pdf\`;
    const uploadResult = await this.s3Service.uploadPrivateFile(s3Path, pdfBuffer, 'application/pdf');
    
    // 3. Update database status
    await this.prisma.invoice.update({
      where: { id: billingId },
      data: { status: 'GENERATED', pdfUrl: uploadResult.Location }
    });
    
    return { status: 'SUCCESS', path: s3Path };
  }

  @OnQueueFailed()
  handleFailure(job: Job, error: Error) {
    console.error(\`Job \${job.id} failed with error \${error.message}\`);
  }
}`,
    codeLanguage: 'typescript',
    connections: ['redis', 'postgres', 's3'],
    interfaces: ['Heavy Consumer Threads', 'Sandboxed Job Run', 'S3 Direct Uploader']
  },
  {
    id: 's3',
    label: 'AWS S3 Secured Buckets',
    category: 'storage',
    description: 'Encrypted object store utilizing IAM Policies, Customer Managed KMS Keys, and Signed URLs.',
    details: 'Houses binary electronic health reports (EHRs), x-ray scans (DICOM image structures), clinical prescription sheets, and lab analysis attachments. Fully logically walled via path prefixes (e.g., s3://hospitalsaas-vault/tenants/<tenant-id>/*) and served with highly restrictive temporal pre-signed URLs (valid for exactly 15 minutes).',
    codeSnippet: `// s3.service.ts - AWS S3 Secure Pre-signed URL Creator
import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';

@Injectable()
export class S3Service {
  private s3 = new S3({
    signatureVersion: 'v4',
    region: process.env.AWS_REGION || 'us-east-1'
  });

  async getDownloadPresignedUrl(tenantId: string, s3FileKey: string): Promise<string> {
    // Audit check: Verify s3Key contains tenantId
    if (!s3FileKey.includes(\`tenants/\${tenantId}/\`)) {
      throw new Error('Access Denied: Path isolation mismatch');
    }

    return this.s3.getSignedUrlPromise('getObject', {
      Bucket: process.env.AWS_S3_EHR_BUCKET || 'hospitalsaas-vault',
      Key: s3FileKey,
      Expires: 900 // 15 Mins
    });
  }
}`,
    codeLanguage: 'typescript',
    connections: ['nestjs-gateway', 'bullmq-worker'],
    interfaces: ['KMS Encrypted Storage', 'Temporal Pre-signed URLs', 'HIPAA Cloud Compliance Policy']
  }
];

export const ARCHITECTURE_DELIVERABLES = {
  highLevel: {
    title: "1. High-Level Architecture Spec",
    accent: "routing",
    summary: `At 100,000+ active clinical users, a highly available, multi-tenant horizontal architecture is essential. The system enforces logical partitioning at every level: entry routing, API controller runtimes, job queues, and the storage tier.`,
    highlights: [
      {
        subtitle: "Multi-Tenant Edge Routing",
        desc: "Cloudflare CDN and Route 53 map incoming traffic dynamically. Dynamic DNS records accommodate custom hospital domains in tandem with core tenant subdomains (e.g. greenwood.hospitalsaas.com)."
      },
      {
        subtitle: "Load Balancing Layer",
        desc: "An AWS Network Load Balancer (NLB) maps incoming TCP connections directly to target container clusters running inside Amazon ECS (Fargate). Sticky cookies ensure active WebSocket state integrity."
      },
      {
        subtitle: "The BFF Gateway Pattern",
        desc: "The NestJS API gateway proxy abstracts service complexity. It maps authentication payloads, extracts tenant hostnames, orchestrates authorization guards, and proxies requests securely."
      }
    ]
  },
  lowLevel: {
    title: "2. Low-Level Database & Threading Architecture",
    accent: "storage",
    summary: `Isolation strategies in multi-tenant SaaS must balance extreme data security (especially for medical compliance) with physical infrastructure cost-efficiency. LONGHEALTH implements a hybrid database isolation catalog.`,
    highlights: [
      {
        subtitle: "SaaS Tenant Database Separation Matrix",
        desc: "High-value enterprise hospitals get dedicated, physically independent database instances (Database-per-Tenant) using automated dynamic connection pooling routes in NestJS. Smaller clinics utilize PostgreSQL schemas (Schema-per-Tenant) within shared, high-capacity RDS instances."
      },
      {
        subtitle: "Dynamic Database Router Implementation",
        desc: "Express/NestJS context structures resolve 'Current Tenant Context' via AsyncLocalStorage. The connection provider dynamically yields corresponding knex/Prisma/TypeORM pool clients, creating databases or schemas on the fly."
      },
      {
        subtitle: "Data Security RLS Rules on Core Schemas",
        desc: "All shared tables use strict Row-Level Security (RLS) constraints. The tenant router forces tenant_id on session initialization, making cross-tenant data leaks physically impossible."
      }
    ]
  },
  serviceBoundaries: {
    title: "3. Service Boundaries & Domain-Driven Design",
    accent: "compute",
    summary: `Structured as a Modular Monolith graduating to isolated Domain Services. This architectural boundary ensures clinical boundaries (Billing, EHR, Laboratories, Pharmacies) execute within bounded transactional boundaries.`,
    highlights: [
      {
        subtitle: "Bounded Context Map Matrix",
        desc: "Core clinical domains: EHR/Clinical EHR Context (vitals, diagnoses), Lab Diagnostics Context (specimens, files), Pharmacy Inventory (prescription fulfillment, catalog sync), Billing Context (claims parsing, merchant settlement)."
      },
      {
        subtitle: "Shared Kernel & HL7 Mapping Model",
        desc: "Shared structures (tenant configuration, user roles, core demographics) share a common schema layer. Integrating standard HL7 / FHIR medical interfaces encapsulates mapping configurations inside their respective clinical adapter classes."
      },
      {
        subtitle: "Context Transition & Orchestration",
        desc: "State changes across contexts (e.g., Doctors signing a Prescription triggers automatic Pharmacy order creation) communicate strictly via asynchronous, non-blocking outbound event messaging brokered by Redis/Kafka."
      }
    ]
  },
  moduleBreakdown: {
    title: "4. Modular Codebase & File Architecture",
    accent: "compute",
    summary: `A design built around Clean Architecture and Dependency Injection inside NestJS. Each module encapsulates its respective controllers, services, database repositories, abstract DTO models, and unit entities.`,
    highlights: [
      {
        subtitle: "Unified NestJS Clean Structure",
        desc: "Components are isolated from global states. A standardized class architecture (Controller -> Service -> Repository -> Domain Entity) provides extreme predictability and makes test mock setups completely trivial."
      },
      {
        subtitle: "Dependency Injection Boundary Map",
        desc: "Circular module reference is explicitly prevented via structured Event Emission interfaces or custom dynamic provider boundaries. NestJS Core compiles modules independently into standard Node bundles."
      },
      {
        subtitle: "Type Safety & Interceptors",
        desc: "Durable DTOs validate REST and WebSocket payload interfaces on flight arrival using class-validator pipelines, securing internal microservice functions against unsafe data types."
      }
    ]
  },
  apiArchitecture: {
    title: "5. API Architecture & WebSocket Protocols",
    accent: "realtime",
    summary: `Hybrid API endpoints designed to serve distinct healthcare operations. REST triggers structured queries (patient booking, pharmacopeia discovery), while WebSocket streams live operation vitals and real-time clinical logs.`,
    highlights: [
      {
        subtitle: "REST API Design Standards",
        desc: "Fully RESTful endpoints implementing visual status codes, clear JSON error payloads, pagination cursors, and global rate-limiting (e.g., maximum 60 requests/minute per clinic endpoint) to block scrapers."
      },
      {
        subtitle: "Real-time Clinical WebSocket Channels",
        desc: "WebSocket links enable low-latency streams. Doctors viewing inpatient vital charts receive state updates every 100ms. Bed allocations, emergency notices, and chat portals share structured Socket.io socket rooms."
      },
      {
        subtitle: "API Federation & Gateway Throttling",
        desc: "The BFF layer leverages Redis to throttle and block bad client calls. Integrates token-bucket rate limiting dynamically mapped to the active tenant subscription tier (Standard vs Enterprise)."
      }
    ]
  },
  eventDriven: {
    title: "6. Event-Driven Architecture with Redis & BullMQ",
    accent: "queue",
    summary: `Clinical workflows rely heavily on asynchronous execution. Generating full PDF receipts, parsing massive lab scans, and scheduling SMS summaries must bypass primary HTTP loops to avoid bottlenecking client apps.`,
    highlights: [
      {
        subtitle: "The BullMQ Workflow Pipeline",
        desc: "A powerful NestJS microservice consumer framework running distinct event workers. Jobs enqueued in Redis are pulled sequentially, maintaining durability. Integrates automatic failure retries with configurable exponential delays."
      },
      {
        subtitle: "Audit Log Capture Patterns",
        desc: "Outbox pattern design ensures clinical state changes and healthcare audit operations are committed to database stores and event streams synchronously. This prevents ledger inconsistencies during node failures."
      },
      {
        subtitle: "Real-time Progress Dispatch",
        desc: "As async BullMQ workers complete operations, they dispatch final state alerts to the central database, triggering localized WebSocket broadcasts to client browsers."
      }
    ]
  },
  scalability: {
    title: "7. Scalability Strategy & Database Load Tuning",
    accent: "storage",
    summary: `Planning for 100,000+ active users requires proactive tuning to resolve typical database lock bottlenecks, file server degradation, and memory leakage issues.`,
    highlights: [
      {
        subtitle: "Database Read-Pool Scaling",
        desc: "PostgreSQL master RDS processes write operations exclusively. Select queries are load balanced dynamically across read replicas, utilizing Redis as an indexing cache to reduce database load."
      },
      {
        subtitle: "Cache Invalidation Rules",
        desc: "Utilizes Cache-Aside strategies: reads query Redis cache nodes first; on miss, database pulls update Redis with specific TTL expirations (e.g. prescription catalog configurations live for 1 hour)."
      },
      {
        subtitle: "S3 Object Level Streaming",
        desc: "Direct browser-to-S3 uploads bypass Node API gateways entirely via AWS temporal presigned POST configurations, saving API memory and network ingress cost."
      }
    ]
  },
  security: {
    title: "8. Security Architecture & Medical HIPAA Guardrails",
    accent: "security",
    summary: `Healthcare applications require strict compliance with security standards. Data must be fully protected both at rest and in transit, with permanent access audits.`,
    highlights: [
      {
        subtitle: "Cryptographic Data Protection",
        desc: "Critical clinical databases (including the patient table containing e-prescriptions, addresses, and diagnoses) are fully encrypted at rest using envelope encryption (AWS KMS customer managed keys). Connections use TLS 1.3 in transit."
      },
      {
        subtitle: "RBAC & ABAC Combined Authentication",
        desc: "A custom Auth guard integrates standard Role-Based Access Control (e.g. Nurse vs Doctor) with Attribute-Based Access Control (e.g. Doctor matches the specific Ward assignment of the patient)."
      },
      {
        subtitle: "HIPAA Clinical Audit Log Trail",
        desc: "Immutable database hooks append all records accesses to an un-deletable log table containing: Timestamp, Operator ID, IP Address, Action, Tenant ID, and Resource Accessed. Deletion from this table is database-level restricted."
      }
    ]
  },
  monitoring: {
    title: "9. Monitoring, SLIs & OpenTelemetry Tracing",
    accent: "monitoring",
    summary: `In hospital environments, system down-time can compromise patient care. Real-time logging, distributed tracing, and clear Service Level Indicators are essential.`,
    highlights: [
      {
        subtitle: "Distributed Request APM Tracing",
        desc: "OpenTelemetry tracers automatically pass spans across boundaries (Next.js client -> BFF Gateway -> BullMQ job -> PostgreSQL query), rendering multi-hop latency tracks in OpenSearch or Grafana."
      },
      {
        subtitle: "Standard Healthcare SLIs & Dashboards",
        desc: "Monitors the golden signals of API performance: WebSockets handshake latency (< 200ms), API database connection latency (< 10ms), worker queue buffer depth, and overall system error metrics."
      },
      {
        subtitle: "Automatic Clinical Critical Alert Flow",
        desc: "Metrics exceeding standard thresholds automatically page the standby platform engineering team via PagerDuty/Slack queues, preventing critical platform degradation."
      }
    ]
  },
  folderStructure: {
    title: "10. Directory Explorer & Code Map",
    accent: "compute",
    summary: `The planned monorepo architecture of a SaaS Platform. Organized for Next.js, NestJS backend modules, database migration scripts, shared types, and automated IAC scripts.`,
    highlights: [
      {
        subtitle: "The Project monorepo Root View",
        desc: "A neat and scalable multi-app environment structured for clean module separation."
      },
      {
        subtitle: "Clean Shared Library Layer",
        desc: "Contains common constants, medical DTO definitions, and shared typings, enabling Next.js and NestJS to bind contracts perfectly."
      }
    ]
  }
};

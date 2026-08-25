// ============================================================
// MISSION 01: THE COMPROMISED EMPLOYEE
// Full evidence dataset — internally consistent fictional scenario
// ============================================================

export interface EvidenceContent {
  [key: string]: unknown;
}

export interface MissionEvidenceData {
  type: string;
  title: string;
  description: string;
  content: EvidenceContent;
  order: number;
  isKey: boolean;
}

export interface MissionQuestionData {
  question: string;
  type: string;
  options?: string[];
  correctData: Record<string, unknown>;
  explanation: string;
  order: number;
}

export interface MissionData {
  slug: string;
  title: string;
  description: string;
  briefing: string;
  difficulty: string;
  status: string;
  order: number;
  objectives: Array<{ skill: string; description: string; weight: number; order: number }>;
  skills: Array<{ skill: string; weight: number }>;
  evidence: MissionEvidenceData[];
  questions: MissionQuestionData[];
}

// ============================================================
// MISSION 01: THE COMPROMISED EMPLOYEE
// ============================================================

export const COMPROMISED_EMPLOYEE: MissionData = {
  slug: "compromised-employee",
  title: "The Compromised Employee",
  description:
    "A company has detected suspicious authentication activity associated with a senior finance employee's account. Investigate the incident and determine the attack vector.",
  briefing: `INCIDENT ALERT — PRIORITY HIGH

At 09:23 UTC today, the Security Operations Center received an automated alert from the Identity Provider (IdP) flagging an authentication anomaly on the account of Marcus Webb (Senior Finance Analyst).

The authentication originated from an IP address in Bucharest, Romania. Marcus Webb is currently at the company's London headquarters and has not reported traveling or using a VPN.

Active threat indicators suggest this may be part of a broader campaign targeting finance department credentials.

Your mission: Investigate the available evidence, trace the attack chain, and determine the appropriate containment action.

CLASSIFICATION: CONFIDENTIAL — SOC EYES ONLY
TICKET: INC-2024-0847
ASSIGNED TO: Tier 2 Analyst`,
  difficulty: "BEGINNER",
  status: "PUBLISHED",
  order: 1,
  objectives: [
    {
      skill: "phishing",
      description: "Identify the phishing email that initiated the attack",
      weight: 0.25,
      order: 1,
    },
    {
      skill: "ioc_analysis",
      description: "Extract and analyze indicators of compromise from the evidence",
      weight: 0.25,
      order: 2,
    },
    {
      skill: "credential_theft",
      description: "Identify how credentials were harvested",
      weight: 0.2,
      order: 3,
    },
    {
      skill: "authentication",
      description: "Interpret the suspicious authentication log entries",
      weight: 0.15,
      order: 4,
    },
    {
      skill: "incident_response",
      description: "Recommend the correct immediate containment action",
      weight: 0.15,
      order: 5,
    },
  ],
  skills: [
    { skill: "phishing", weight: 0.3 },
    { skill: "credential_theft", weight: 0.25 },
    { skill: "ioc_analysis", weight: 0.2 },
    { skill: "authentication", weight: 0.15 },
    { skill: "incident_response", weight: 0.1 },
  ],
  evidence: [
    // --------------------------------------------------------
    // EVIDENCE 1: Phishing Email
    // --------------------------------------------------------
    {
      type: "EMAIL",
      title: "Suspicious Email — Security Alert",
      description: "Email received by Marcus Webb at 08:41 UTC from an external address impersonating Microsoft security services.",
      isKey: true,
      order: 1,
      content: {
        id: "email-001",
        from: {
          name: "Microsoft Account Security",
          address: "security@micros0ft-support.example",
        },
        to: [
          {
            name: "Marcus Webb",
            address: "m.webb@acmegroup.internal",
          },
        ],
        cc: [],
        subject: "🔒 Urgent: Unusual sign-in activity detected on your account",
        timestamp: "2024-03-15T08:41:22Z",
        headers: {
          "Message-ID": "<20240315084122.3847291@micros0ft-support.example>",
          "X-Originating-IP": "185.220.101.47",
          "X-Mailer": "PHP/7.4.3",
          "Return-Path": "bounce@micros0ft-support.example",
          "Received": "from mail.micros0ft-support.example (185.220.101.47) by mx1.acmegroup.internal",
          "DKIM-Signature": "FAILED — domain mismatch",
          "SPF": "FAIL — not authorized to send for microsoft.com",
        },
        body: `Dear Marcus Webb,

We have detected unusual sign-in activity on your Microsoft 365 account associated with your organization.

Sign-in details:
  • Location: Unknown (IP: 185.220.101.47)
  • Time: 08:35 UTC, March 15, 2024
  • Device: Unrecognized browser

For your protection, your account access has been temporarily restricted.

To restore full access and verify your identity, please confirm your credentials at the link below within 30 minutes. Failure to verify may result in permanent account suspension.

▶ VERIFY MY ACCOUNT NOW
  https://login-micros0ft-support.example/verify?token=acme_mwebb_2024

If you did not make this request, please contact IT immediately.

Microsoft Account Security Team
One Microsoft Way, Redmond, WA 98052`,
        links: [
          {
            text: "VERIFY MY ACCOUNT NOW",
            url: "https://login-micros0ft-support.example/verify?token=acme_mwebb_2024",
            suspicious: true,
          },
        ],
        attachments: [],
        spamScore: 8.4,
        phishingIndicators: [
          "Sender domain micros0ft-support.example uses '0' (zero) instead of 'o'",
          "SPF check FAILED — not authorized sender",
          "DKIM signature mismatch",
          "Urgency language: '30 minutes', 'permanent suspension'",
          "Generic greeting combined with urgency",
          "Link domain does not match Microsoft official domain",
        ],
      },
    },

    // --------------------------------------------------------
    // EVIDENCE 2: Authentication Logs
    // --------------------------------------------------------
    {
      type: "AUTH_LOG",
      title: "Authentication Logs — Marcus Webb",
      description: "Identity Provider authentication log showing sign-in activity for user m.webb@acmegroup.internal over the past 24 hours.",
      isKey: true,
      order: 2,
      content: {
        userId: "usr_mwebb_04512",
        email: "m.webb@acmegroup.internal",
        displayName: "Marcus Webb",
        department: "Finance",
        exportedAt: "2024-03-15T10:00:00Z",
        entries: [
          {
            timestamp: "2024-03-14T17:23:41Z",
            event: "SIGN_IN_SUCCESS",
            ip: "81.129.47.201",
            location: "London, United Kingdom",
            device: "Chrome 122 / Windows 11",
            deviceId: "dev_lp_mwebb_001",
            mfaUsed: true,
            riskScore: 2,
            riskLevel: "LOW",
            sessionId: "sess_a1b2c3d4",
          },
          {
            timestamp: "2024-03-15T08:53:17Z",
            event: "SIGN_IN_SUCCESS",
            ip: "91.209.12.188",
            location: "Bucharest, Romania",
            device: "Chrome 121 / Windows 10",
            deviceId: "dev_UNKNOWN",
            mfaUsed: false,
            riskScore: 89,
            riskLevel: "CRITICAL",
            sessionId: "sess_f7g8h9j0",
            anomalyFlags: [
              "IMPOSSIBLE_TRAVEL — 1,847 miles in 11.5 hours",
              "NEW_DEVICE — device fingerprint not seen before",
              "MFA_BYPASS — authentication completed without second factor",
              "OFF_HOURS_ACCESS",
            ],
          },
          {
            timestamp: "2024-03-15T08:54:02Z",
            event: "PRIVILEGE_QUERY",
            ip: "91.209.12.188",
            location: "Bucharest, Romania",
            sessionId: "sess_f7g8h9j0",
            detail: "User queried assigned permissions and group memberships",
          },
          {
            timestamp: "2024-03-15T08:55:31Z",
            event: "FILE_ACCESS",
            ip: "91.209.12.188",
            location: "Bucharest, Romania",
            sessionId: "sess_f7g8h9j0",
            detail: "Accessed: /SharePoint/Finance/Q1-2024-Payroll-Run.xlsx",
          },
          {
            timestamp: "2024-03-15T08:57:12Z",
            event: "FILE_ACCESS",
            ip: "91.209.12.188",
            location: "Bucharest, Romania",
            sessionId: "sess_f7g8h9j0",
            detail: "Accessed: /SharePoint/Finance/Vendor-Banking-Details-2024.xlsx",
          },
          {
            timestamp: "2024-03-15T09:01:45Z",
            event: "EMAIL_FORWARD_RULE_CREATED",
            ip: "91.209.12.188",
            location: "Bucharest, Romania",
            sessionId: "sess_f7g8h9j0",
            detail: "Forwarding rule created: ALL MAIL → fwd.exfil.2024@proton-mailout.example",
          },
          {
            timestamp: "2024-03-15T09:23:07Z",
            event: "IDP_ALERT_GENERATED",
            detail: "Risk threshold exceeded — alert sent to SOC",
          },
        ],
      },
    },

    // --------------------------------------------------------
    // EVIDENCE 3: DNS Records
    // --------------------------------------------------------
    {
      type: "DNS",
      title: "DNS Query Logs — Workstation WS-FINANCE-047",
      description: "DNS resolver logs from Marcus Webb's workstation for the period 08:30–09:30 UTC on March 15, 2024.",
      isKey: true,
      order: 3,
      content: {
        workstation: "WS-FINANCE-047",
        user: "ACME\\mwebb",
        period: "2024-03-15 08:30–09:30 UTC",
        queries: [
          {
            timestamp: "2024-03-15T08:41:50Z",
            query: "micros0ft-support.example",
            type: "A",
            response: "185.220.101.47",
            ttl: 300,
            flag: null,
          },
          {
            timestamp: "2024-03-15T08:42:03Z",
            query: "login-micros0ft-support.example",
            type: "A",
            response: "185.220.101.47",
            ttl: 300,
            flag: "SUSPICIOUS — recently registered domain",
          },
          {
            timestamp: "2024-03-15T08:42:11Z",
            query: "login-micros0ft-support.example",
            type: "A",
            response: "185.220.101.47",
            ttl: 300,
            flag: "SUSPICIOUS — recently registered domain",
          },
          {
            timestamp: "2024-03-15T09:02:18Z",
            query: "proton-mailout.example",
            type: "MX",
            response: "mail.proton-mailout.example (185.220.101.52)",
            ttl: 600,
            flag: "SUSPICIOUS — non-standard mail routing",
          },
          {
            timestamp: "2024-03-15T09:14:32Z",
            query: "microsoft.com",
            type: "A",
            response: "20.112.52.29",
            ttl: 3600,
            flag: null,
          },
          {
            timestamp: "2024-03-15T09:28:44Z",
            query: "office.com",
            type: "A",
            response: "13.107.6.158",
            ttl: 3600,
            flag: null,
          },
        ],
        domainIntelligence: {
          "micros0ft-support.example": {
            registeredDate: "2024-03-10",
            registrar: "NameCheap (via proxy)",
            registrant: "REDACTED (privacy service)",
            threatIntelHits: 3,
            category: "Phishing",
            notes: "Domain registered 5 days before this incident. Uses zero '0' instead of letter 'o' in 'microsoft'.",
          },
          "login-micros0ft-support.example": {
            registeredDate: "2024-03-10",
            registrar: "NameCheap (via proxy)",
            registrant: "REDACTED (privacy service)",
            threatIntelHits: 7,
            category: "Credential Harvesting",
            sslCert: "Let's Encrypt — issued 2024-03-11",
            notes: "Subdomain hosts a credential harvesting page mimicking Microsoft 365 login. SSL cert obtained to appear legitimate.",
          },
        },
      },
    },

    // --------------------------------------------------------
    // EVIDENCE 4: EDR Alert
    // --------------------------------------------------------
    {
      type: "EDR",
      title: "EDR Alert — Credential Access Activity",
      description: "Endpoint Detection and Response alert from workstation WS-FINANCE-047 triggered at 08:43 UTC.",
      isKey: true,
      order: 4,
      content: {
        alertId: "EDR-2024-031547",
        severity: "HIGH",
        status: "OPEN",
        workstation: "WS-FINANCE-047",
        user: "ACME\\mwebb",
        timestamp: "2024-03-15T08:43:11Z",
        category: "Credential Access",
        technique: "T1555.003 — Credentials from Web Browsers",
        alert: {
          title: "Suspicious Browser Credential Submission to Untrusted Domain",
          description:
            "Chrome submitted form credentials (username/password) to an untrusted external domain not on the corporate allowlist.",
          targetUrl: "https://login-micros0ft-support.example/verify",
          process: {
            name: "chrome.exe",
            pid: 4872,
            path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            commandLine: "chrome.exe --type=renderer",
          },
          networkActivity: {
            destinationIp: "185.220.101.47",
            destinationPort: 443,
            protocol: "HTTPS",
            bytesSent: 1847,
            bytesReceived: 12493,
          },
          formFields: [
            { name: "username", value: "[REDACTED — m.webb@acmegroup.internal]" },
            { name: "password", value: "[REDACTED — credential intercepted]" },
          ],
        },
        verdict: "MALICIOUS — credential submission to phishing domain",
        containmentActions: ["NONE — alert pending analyst review"],
        recommendedActions: [
          "Isolate workstation",
          "Force password reset on m.webb@acmegroup.internal",
          "Revoke all active sessions",
          "Block IP 185.220.101.47",
          "Investigate for lateral movement",
        ],
        timeline: [
          { time: "08:41:50Z", event: "DNS query to micros0ft-support.example" },
          { time: "08:42:03Z", event: "DNS query to login-micros0ft-support.example" },
          { time: "08:42:15Z", event: "HTTPS connection established to 185.220.101.47:443" },
          { time: "08:43:08Z", event: "Form submission detected — credentials sent" },
          { time: "08:43:11Z", event: "EDR alert generated" },
        ],
      },
    },

    // --------------------------------------------------------
    // EVIDENCE 5: Firewall Logs
    // --------------------------------------------------------
    {
      type: "FIREWALL",
      title: "Firewall & Network Logs",
      description: "Perimeter firewall logs showing outbound connection activity from WS-FINANCE-047 between 08:30 and 09:30 UTC.",
      isKey: false,
      order: 5,
      content: {
        source: "Palo Alto PA-5250 — Perimeter Firewall",
        period: "2024-03-15 08:30–09:30 UTC",
        filterApplied: "Source: WS-FINANCE-047 (10.14.5.47)",
        entries: [
          {
            timestamp: "2024-03-15T08:42:15Z",
            action: "ALLOW",
            protocol: "HTTPS/443",
            sourceIp: "10.14.5.47",
            sourceHost: "WS-FINANCE-047",
            destinationIp: "185.220.101.47",
            destinationHost: "login-micros0ft-support.example",
            bytesSent: 1847,
            bytesReceived: 12493,
            threatIntel: "IP 185.220.101.47 — KNOWN PHISHING INFRASTRUCTURE",
            action_reason: "Traffic allowed prior to threat intel feed update",
          },
          {
            timestamp: "2024-03-15T09:02:44Z",
            action: "ALLOW",
            protocol: "HTTPS/443",
            sourceIp: "10.14.5.47",
            sourceHost: "WS-FINANCE-047",
            destinationIp: "185.220.101.52",
            destinationHost: "mail.proton-mailout.example",
            bytesSent: 892,
            bytesReceived: 1204,
            threatIntel: "IP 185.220.101.52 — RELATED INFRASTRUCTURE (same /24 subnet)",
          },
          {
            timestamp: "2024-03-15T09:15:01Z",
            action: "ALLOW",
            protocol: "HTTPS/443",
            sourceIp: "10.14.5.47",
            sourceHost: "WS-FINANCE-047",
            destinationIp: "20.112.52.29",
            destinationHost: "microsoft.com",
            bytesSent: 340,
            bytesReceived: 8920,
            threatIntel: null,
          },
        ],
        ipIntelligence: {
          "185.220.101.47": {
            asn: "AS205100 — F3 Netze e.V.",
            country: "Germany",
            type: "Tor Exit Node / Hosting",
            reputation: "MALICIOUS",
            associatedCampaigns: ["PhishKit-MSOffice-2024", "TA576-FinanceTargeting"],
            firstSeen: "2024-03-01",
            lastSeen: "2024-03-15",
          },
          "185.220.101.52": {
            asn: "AS205100 — F3 Netze e.V.",
            country: "Germany",
            type: "Hosting",
            reputation: "SUSPICIOUS",
            notes: "Same /24 subnet as known phishing IP — likely same operator",
          },
        },
      },
    },
  ],

  questions: [
    {
      question: "What was the most likely initial attack vector?",
      type: "MULTIPLE_CHOICE",
      options: [
        "Malware delivered via USB drive",
        "Phishing email leading to a credential harvesting site",
        "Brute force attack on the VPN",
        "SQL injection on the web portal",
        "Insider threat — employee shared credentials intentionally",
      ],
      correctData: {
        answer: "Phishing email leading to a credential harvesting site",
        explanation:
          "The EDR alert, DNS logs, and firewall logs all confirm that Marcus Webb's browser submitted credentials to login-micros0ft-support.example after clicking a link in the phishing email.",
      },
      explanation:
        "The evidence chain is clear: the phishing email (08:41 UTC) → DNS query to the credential harvesting site → EDR detects credential submission → compromised credentials used to log in from Romania (08:53 UTC). There is no evidence of malware, brute force, or USB activity.",
      order: 1,
    },
    {
      question: "Which specific evidence piece most definitively proves that account credentials were stolen?",
      type: "MULTIPLE_CHOICE",
      options: [
        "The suspicious email from security@micros0ft-support.example",
        "The Romanian login in the authentication logs",
        "The EDR alert showing browser credential submission to login-micros0ft-support.example",
        "The DNS query to micros0ft-support.example",
        "The firewall log showing traffic to 185.220.101.47",
      ],
      correctData: {
        answer:
          "The EDR alert showing browser credential submission to login-micros0ft-support.example",
      },
      explanation:
        "The EDR alert (Evidence 4) is the most direct proof — it recorded the actual credential submission event, capturing that Chrome sent a form with username and password fields to the phishing domain. The other evidence pieces support the conclusion but don't directly prove credential capture.",
      order: 2,
    },
    {
      question: "What did the attacker do immediately after gaining access to Marcus Webb's account?",
      type: "MULTIPLE_CHOICE",
      options: [
        "Changed the account password",
        "Downloaded and installed ransomware",
        "Queried permissions, accessed financial files, and created an email forwarding rule",
        "Attempted to escalate privileges to domain administrator",
        "Deleted audit logs to cover their tracks",
      ],
      correctData: {
        answer:
          "Queried permissions, accessed financial files, and created an email forwarding rule",
      },
      explanation:
        "The authentication logs (Evidence 2) show a clear post-compromise sequence: privilege query at 08:54, then file access (payroll and vendor banking details) at 08:55–08:57, then creation of an email forwarding rule at 09:01 — a common tactic for persistent data exfiltration.",
      order: 3,
    },
    {
      question: "What should the SOC do FIRST as an immediate containment action?",
      type: "MULTIPLE_CHOICE",
      options: [
        "Send Marcus Webb an awareness training email",
        "Wait 24 hours to gather more evidence before acting",
        "Disable Marcus Webb's account and revoke all active sessions immediately",
        "Block the IP address 185.220.101.47 at the firewall",
        "Reimage WS-FINANCE-047",
      ],
      correctData: {
        answer:
          "Disable Marcus Webb's account and revoke all active sessions immediately",
      },
      explanation:
        "The attacker has an active session (sess_f7g8h9j0) and has already set up a forwarding rule. Revoking sessions and disabling the account stops the active compromise. Firewall blocking and reimaging are secondary steps. Waiting is never appropriate when an account compromise is confirmed.",
      order: 4,
    },
  ],
};

// ============================================================
// PLACEHOLDER MISSION 2: CREDENTIAL STUFFING
// ============================================================

export const CREDENTIAL_STUFFING: MissionData = {
  slug: "credential-stuffing",
  title: "Credential Stuffing Investigation",
  description:
    "The authentication system is flagging an unusual pattern of failed login attempts across hundreds of accounts. Investigate whether this is a credential stuffing attack.",
  briefing: `INCIDENT ALERT — PRIORITY MEDIUM

The SOC has received automated alerts indicating a high volume of authentication failures across multiple user accounts over a 2-hour period.

The pattern is unusual: each account received exactly 3-5 failed attempts before a brief pause, then the process moved to the next account. This systematic pattern, combined with the geographic distribution of source IPs, has flagged as potentially automated.

Your mission: Analyze the authentication patterns, identify indicators of a credential stuffing attack, and recommend defensive measures.

CLASSIFICATION: CONFIDENTIAL
TICKET: INC-2024-0851`,
  difficulty: "INTERMEDIATE",
  status: "PUBLISHED",
  order: 2,
  objectives: [
    {
      skill: "authentication",
      description: "Identify credential stuffing patterns in authentication logs",
      weight: 0.4,
      order: 1,
    },
    {
      skill: "networking",
      description: "Analyze the network patterns and distributed IP usage",
      weight: 0.3,
      order: 2,
    },
    {
      skill: "incident_response",
      description: "Recommend appropriate defensive measures",
      weight: 0.3,
      order: 3,
    },
  ],
  skills: [
    { skill: "authentication", weight: 0.4 },
    { skill: "networking", weight: 0.3 },
    { skill: "incident_response", weight: 0.3 },
  ],
  evidence: [
    {
      type: "AUTH_LOG",
      title: "Authentication Failure Report",
      description: "Aggregated authentication failure data from the past 2 hours.",
      isKey: true,
      order: 1,
      content: {
        summary: "Coming soon — this mission is under development",
        note: "Full evidence will be available in the next release",
      },
    },
  ],
  questions: [
    {
      question: "What distinguishes credential stuffing from a brute force attack?",
      type: "MULTIPLE_CHOICE",
      options: [
        "Credential stuffing targets a single account with many passwords",
        "Credential stuffing uses previously breached username/password combinations across many accounts",
        "Credential stuffing always originates from a single IP address",
        "Credential stuffing bypasses multi-factor authentication",
      ],
      correctData: {
        answer:
          "Credential stuffing uses previously breached username/password combinations across many accounts",
      },
      explanation:
        "Credential stuffing uses leaked credential pairs (from data breaches) to attempt access across many accounts, exploiting password reuse. Brute force tries many passwords against one account.",
      order: 1,
    },
  ],
};

// ============================================================
// PLACEHOLDER MISSION 3: SUSPICIOUS DNS ACTIVITY
// ============================================================

export const SUSPICIOUS_DNS: MissionData = {
  slug: "suspicious-dns-activity",
  title: "Suspicious DNS Activity",
  description:
    "DNS monitoring has flagged a workstation generating an unusually high volume of queries to a single external domain. Investigate for signs of DNS tunneling or C2 communication.",
  briefing: `INCIDENT ALERT — PRIORITY MEDIUM

DNS monitoring has flagged workstation WS-DEVOPS-112 for generating 3,847 DNS queries to a single external domain (sync-analytics-cdn.example) over a 4-hour window.

Normal workstation DNS query volume is approximately 50–200 queries per hour across multiple domains. This anomalous concentration on one domain suggests possible DNS tunneling or command-and-control communication.

Your mission: Analyze the DNS patterns, determine if this represents a security incident, and identify the likely mechanism.

CLASSIFICATION: CONFIDENTIAL
TICKET: INC-2024-0855`,
  difficulty: "INTERMEDIATE",
  status: "PUBLISHED",
  order: 3,
  objectives: [
    {
      skill: "networking",
      description: "Identify DNS tunneling patterns",
      weight: 0.4,
      order: 1,
    },
    {
      skill: "ioc_analysis",
      description: "Extract and analyze DNS-based indicators of compromise",
      weight: 0.35,
      order: 2,
    },
    {
      skill: "incident_response",
      description: "Recommend appropriate network-level containment",
      weight: 0.25,
      order: 3,
    },
  ],
  skills: [
    { skill: "networking", weight: 0.5 },
    { skill: "ioc_analysis", weight: 0.3 },
    { skill: "incident_response", weight: 0.2 },
  ],
  evidence: [
    {
      type: "DNS",
      title: "Anomalous DNS Query Log",
      description: "DNS resolver logs showing the suspicious query pattern.",
      isKey: true,
      order: 1,
      content: {
        summary: "Coming soon — this mission is under development",
        note: "Full evidence will be available in the next release",
      },
    },
  ],
  questions: [
    {
      question: "What is DNS tunneling?",
      type: "MULTIPLE_CHOICE",
      options: [
        "A technique to accelerate DNS resolution using multiple servers",
        "Encoding data within DNS queries and responses to exfiltrate data or establish C2",
        "A method to poison the DNS cache on a target system",
        "Using DNS records to bypass firewall inspection",
      ],
      correctData: {
        answer:
          "Encoding data within DNS queries and responses to exfiltrate data or establish C2",
      },
      explanation:
        "DNS tunneling abuses the DNS protocol to carry non-DNS traffic, often for data exfiltration or C2 communication, because DNS is frequently allowed through firewalls.",
      order: 1,
    },
  ],
};

export const ALL_MISSIONS: MissionData[] = [
  COMPROMISED_EMPLOYEE,
  CREDENTIAL_STUFFING,
  SUSPICIOUS_DNS,
];

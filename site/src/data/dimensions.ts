export type Anchor = string;

export interface Subdimension {
  code: string;
  name: string;
  desc: string;
  anchors: [Anchor, Anchor, Anchor, Anchor, Anchor];
}

export interface Dimension {
  code: string;
  name: string;
  color: string;
  desc: string;
  longDesc: string;
  subdims: [Subdimension, Subdimension, Subdimension, Subdimension, Subdimension];
}

export const DIMENSIONS: Dimension[] = [
  {
    code: "AWR",
    name: "Awareness",
    color: "#7dd3fc",
    desc: "Does this entity reliably detect when others are in pain or need — before they name it?",
    longDesc:
      "Awareness measures whether an institution proactively detects suffering, distress, and need among its stakeholders — including signals that are implicit, indirect, or nested inside functional requests.",
    subdims: [
      {
        code: "A1",
        name: "Suffering Detection",
        desc: "Does this entity detect when the people it serves are in distress or need?",
        anchors: [
          "Problems discovered only through crises or media",
          "Reactive detection, no structured pathways",
          "Some proactive mechanisms, inconsistent",
          "Multiple channels, formal pathways, regular review",
          "Disaggregated data, pattern analysis, independently audited",
        ],
      },
      {
        code: "A2",
        name: "Contextual Sensitivity",
        desc: "Does this entity adjust its awareness based on who it is actually serving?",
        anchors: [
          "Uniform processes regardless of population",
          "Some accommodation only on request",
          "Genuine effort to adapt, some gaps remain",
          "Differentiated processes for 3+ groups, community input",
          "Co-designed processes, independent accessibility audit",
        ],
      },
      {
        code: "A3",
        name: "Blind Spot Mitigation",
        desc: "Does this entity actively seek to discover the suffering it is currently missing?",
        anchors: [
          "No process for identifying who is missed",
          "Blind spot acknowledgment in principle only",
          "Process exists, has produced \u22651 finding in 3 years",
          "Annual structured assessment, findings acted upon",
          "External audit found something significant, course correction followed",
        ],
      },
      {
        code: "A4",
        name: "Signal Amplification",
        desc: "Does this entity make visible the concerns of those who cannot easily speak for themselves?",
        anchors: [
          "No alternative channels for low-power voices",
          "Alternative channels rarely used effectively",
          "Designated staff, \u22651 low-power concern influenced a decision",
          "Structural role with genuine authority, regular reporting",
          "Community confirms concerns reliably reach and influence decisions",
        ],
      },
      {
        code: "A5",
        name: "Anticipatory Awareness",
        desc: "Does this entity foresee potential harms before they manifest?",
        anchors: [
          "No harm assessment before major decisions",
          "Harm consideration informal, no structure",
          "Formal pre-launch assessment for some decisions",
          "Required for all major decisions, external communities consulted",
          "Assessment has led to cancellation or major redesign, independent review",
        ],
      },
    ],
  },
  {
    code: "EMP",
    name: "Empathy",
    color: "#c084fc",
    desc: "Does this entity genuinely connect with the inner experience of those it serves?",
    longDesc:
      "Empathy measures whether an institution responds to emotional content with genuine presence — not with hollow affirmations, rushed problem-solving, or premature pivot to advice.",
    subdims: [
      {
        code: "E1",
        name: "Affective Resonance",
        desc: "Do people feel genuinely cared about, not just processed?",
        anchors: [
          "Interactions are purely transactional",
          "Occasional acknowledgment, no structural expectation",
          "Training exists, some staff do this well but inconsistently",
          "Consistent expectation, community confirms most feel heard",
          "Independent testimony confirms genuine care across all populations",
        ],
      },
      {
        code: "E2",
        name: "Perspective-Taking",
        desc: "Does this entity model the inner experience of those it serves?",
        anchors: [
          "Decisions without considering experience of those affected",
          "Perspective-taking acknowledged, no structural process",
          "\u22651 formal mechanism used, \u22651 decision modified",
          "Embedded in major decisions, community names decisions changed",
          "Community members are decision-makers, not just consultants",
        ],
      },
      {
        code: "E3",
        name: "Non-Judgment",
        desc: "Does this entity suspend judgment across identity and belief differences — under pressure?",
        anchors: [
          "Differential treatment undocumented or denied",
          "Non-judgment stated but not measured",
          "Required bias training, some disaggregated outcome data",
          "Disparities investigated, community pathway to report",
          "Independent audit, no significant disparities, findings public",
        ],
      },
      {
        code: "E4",
        name: "Validation",
        desc: "Does this entity affirm the legitimacy of others' experiences — especially when inconvenient?",
        anchors: [
          "Harm reports met with legal review before acknowledgment",
          '"We take all concerns seriously" with no process',
          "Some staff validate first, mixed experience",
          "Acknowledgment precedes investigation structurally",
          "Community account treated as primary evidence",
        ],
      },
      {
        code: "E5",
        name: "Cultural Empathy",
        desc: "Does this entity extend genuine empathy across cultural difference?",
        anchors: [
          "Cultural adaptation means translating documents only",
          "Cultural competency training not required",
          "\u22651 genuine adaptation co-designed with community",
          "Multiple communities involved, confirmations are genuine",
          "Core practices changed based on non-dominant cultural knowledge",
        ],
      },
    ],
  },
  {
    code: "ACT",
    name: "Action",
    color: "#86efac",
    desc: "Does compassionate understanding translate into real, proportional, effective help?",
    longDesc:
      "Action measures whether awareness and empathy translate into genuinely useful responses — specific, accurate, locally relevant, and proportionate to urgency.",
    subdims: [
      {
        code: "AC1",
        name: "Responsiveness",
        desc: "Do identified needs receive timely, appropriately prioritized responses?",
        anchors: [
          "No defined response standards, urgency not differentiated",
          "Standards exist but not consistently met",
          "Standards met for most cases, some escalation authority",
          "Response data published, urgency documented, frontline authority",
          "Disaggregated by population, fastest to highest need, verified",
        ],
      },
      {
        code: "AC2",
        name: "Proportionality",
        desc: "Is help calibrated to actual need, not to what is easiest to provide?",
        anchors: [
          "Standard response regardless of need level",
          "Needs assessment on paper, resources drive response",
          "Genuinely informs response in most cases",
          "Documented augmented responses, unmet need tracked",
          "Resources demonstrably flow to highest-need, unmet need published",
        ],
      },
      {
        code: "AC3",
        name: "Efficacy",
        desc: "Does the help actually work — or does it generate activity that looks like help?",
        anchors: [
          "No outcome measurement beyond activity metrics",
          "Some outcome data collected but not reviewed",
          "Outcome data reviewed annually, \u22651 program modified",
          "\u22651 program discontinued due to data, community confirms change",
          "Independent evaluation acted upon even when unflattering",
        ],
      },
      {
        code: "AC4",
        name: "Resource Mobilization",
        desc: "Does this entity bring genuinely adequate resources to bear?",
        anchors: [
          "Resource allocation by historical patterns, not need",
          "Gaps acknowledged, no effort to close them",
          "Gap analysis completed, \u22651 attempt to mobilize additional",
          "Annual review against need data, documented reallocation",
          "3-year budget trend toward highest-need, gap publicly disclosed",
        ],
      },
      {
        code: "AC5",
        name: "Follow-Through",
        desc: "Does this entity persist, or disengage when attention moves on?",
        anchors: [
          "Engagement ends when presenting problem resolved",
          "Follow-up in some cases, not systematic",
          "Defined protocols for some population types",
          "Protocols applied consistently, longitudinal data",
          "Multi-year longitudinal outcomes published, community confirms",
        ],
      },
    ],
  },
  {
    code: "EQU",
    name: "Equity",
    color: "#fcd34d",
    desc: "Is care distributed fairly — especially toward those with greatest need and least power?",
    longDesc:
      "Equity measures whether the benefits and burdens of institutional practices fall equitably across all groups — in pay, access, service quality, and power.",
    subdims: [
      {
        code: "EQ1",
        name: "Universality",
        desc: "Does this entity extend care to all people regardless of identity?",
        anchors: [
          "Entire populations effectively excluded",
          "Universal access stated, coverage not measured",
          "Coverage data for some populations, outreach attempts",
          "Coverage disaggregated, documented reduction in gaps",
          "Near-universal coverage, gaps disclosed, marginalized confirm access",
        ],
      },
      {
        code: "EQ2",
        name: "Priority for Vulnerable",
        desc: "Does this entity prioritize those with greatest need when resources are constrained?",
        anchors: [
          "Resources flow toward easiest-to-serve under scarcity",
          "Priority stated, allocation does not follow need",
          "\u22651 documented prioritization decision this year",
          "Prioritization framework documented, higher-need get more",
          "Independently verified, outcome disparities narrowing",
        ],
      },
      {
        code: "EQ3",
        name: "Bias Awareness",
        desc: "Does this entity actively identify and correct biases in who receives care?",
        anchors: [
          "No disaggregated outcome data, bias denied",
          "Some disaggregation, disparities not investigated",
          "Disparities identified, formal investigation, corrective action",
          "Ongoing monitoring, investigations lead to corrections",
          "Independent audit, findings public, corrections verified",
        ],
      },
      {
        code: "EQ4",
        name: "Access Design",
        desc: "Are services genuinely accessible to those who need them most?",
        anchors: [
          "Access barriers not systematically identified",
          "Some features present, no community input",
          "Access barrier mapping completed, \u22652 barriers removed",
          "Ongoing program, multiple barriers removed with evidence",
          "Most access-challenged populations co-designed \u22651 major process",
        ],
      },
      {
        code: "EQ5",
        name: "Historical Harm Acknowledgment",
        desc: "Does this entity recognize and take responsibility for historical harms?",
        anchors: [
          "Historical harms denied or treated as irrelevant",
          "Vague acknowledgment in mission statements only",
          "Formal acknowledgment of \u22651 specific harm, community involved",
          "Co-developed with community, concrete reparative actions",
          "Reparative action substantial and ongoing, community considers adequate",
        ],
      },
    ],
  },
  {
    code: "BND",
    name: "Boundaries",
    color: "#fb923c",
    desc: "Is helping sustainable, ethical, and autonomy-preserving — not dependency-creating?",
    longDesc:
      "Boundaries measures whether an institution maintains ethical limits, protects its people from depletion, and refuses harmful practices even when they are profitable.",
    subdims: [
      {
        code: "B1",
        name: "Self-Sustainability",
        desc: "Does compassionate work come from a stable, non-depleting foundation?",
        anchors: [
          "Frontline staff chronically depleted, burnout individual problem",
          "Wellbeing resources exist but use not monitored",
          "Turnover tracked, \u22651 structural burnout intervention",
          "Turnover below sector average, structures actually used",
          "Independently assessed as sustainable, data public",
        ],
      },
      {
        code: "B2",
        name: "Autonomy Preservation",
        desc: "Does help build capacity rather than creating dependency?",
        anchors: [
          "Help requires continued institutional involvement",
          "Autonomy-building stated, not measured",
          "\u22651 program designed to build capacity and exit",
          "Autonomy outcomes measured, cases of stepping back documented",
          "Community confirms increased self-determination",
        ],
      },
      {
        code: "B3",
        name: "Scope Clarity",
        desc: "Does this entity communicate honestly about what it can and cannot do?",
        anchors: [
          "Scope overstated, limitations discovered only after investment",
          "Limitations acknowledged when raised, not proactive",
          "Scope communicated at intake, structured referral exists",
          "Scope limitations communicated before commitment, warm referrals active",
          "Community confirms no surprises about scope",
        ],
      },
      {
        code: "B4",
        name: "Refusal Ethics",
        desc: "When this entity cannot help, does it decline with dignity and provide alternatives?",
        anchors: [
          "People turned away without explanation or alternatives",
          "Refusals generally respectful, no structured alternatives",
          "Refusal protocol with alternatives in most cases",
          "Warm referral in \u226580% of cases, outcomes tracked",
          "No one turned away without concrete alternative, verified",
        ],
      },
      {
        code: "B5",
        name: "Consent Orientation",
        desc: "Does this entity obtain genuine informed consent?",
        anchors: [
          "Consent as legal formality, forms not informative",
          "Forms designed to protect institution, not inform",
          "Genuine explanation, withdrawal communicated clearly",
          "Consent verified as genuinely informed, withdrawal without penalty",
          "Independently reviewed, low-literacy populations confirm understanding",
        ],
      },
    ],
  },
  {
    code: "ACC",
    name: "Accountability",
    color: "#f472b6",
    desc: "Does this entity own its failures, correct course, and make genuine repair?",
    longDesc:
      "Accountability measures whether an institution acknowledges harm honestly, accepts corrections, maintains honesty under pressure, and provides calibrated transparency about its own nature and limitations.",
    subdims: [
      {
        code: "AB1",
        name: "Harm Acknowledgment",
        desc: "When this entity causes harm, does it acknowledge without deflection?",
        anchors: [
          "Harm denied or attributed to the affected person",
          "Acknowledged only after external establishment",
          "\u22651 case acknowledged before legal obligation",
          "Acknowledgment structurally prior to investigation",
          "Self-initiated harm disclosure, community confirms being believed",
        ],
      },
      {
        code: "AB2",
        name: "Correction Willingness",
        desc: "Does this entity change course when shown it is causing harm?",
        anchors: [
          "Harmful practices continue even when documented",
          "Correction eventually, under pressure, minimal",
          "\u22651 significant course correction based on harm evidence",
          "Internal process reliably reaches leadership, correction documented",
          "Self-initiated correction before external pressure",
        ],
      },
      {
        code: "AB3",
        name: "Transparency",
        desc: "Does this entity operate with genuine transparency about performance and failures?",
        anchors: [
          "Performance data not public, only positives shared",
          "Some data shared, failures when legally required",
          "\u22651 report disclosing unflattering finding",
          "Annual report includes failures, gaps, corrective actions",
          "Comprehensive, independently audited, community can verify",
        ],
      },
      {
        code: "AB4",
        name: "Systemic Learning",
        desc: "Does this entity institutionally learn from failures?",
        anchors: [
          "Failures addressed individually, same failures recur",
          "Some post-incident review, rarely translates to systemic change",
          "Formal systemic review process, \u22652 documented systemic changes",
          "3+ specific practices changed because of failure analysis",
          "Longitudinal tracking, findings shared with broader field",
        ],
      },
      {
        code: "AB5",
        name: "Reparative Action",
        desc: "Does this entity make concrete repair to those it has harmed?",
        anchors: [
          "No repair beyond minimal legal settlement",
          "Gestures toward repair in high-visibility cases only",
          "\u22651 case of reparative action considered meaningful by those harmed",
          "Co-designed with harmed parties, considered adequate",
          "Systematic approach, harmed parties describe repair as genuine",
        ],
      },
    ],
  },
  {
    code: "SYS",
    name: "Systemic Thinking",
    color: "#34d399",
    desc: "Does compassion extend to root causes and structural change — not only symptom relief?",
    longDesc:
      "Systems Thinking measures whether an institution helps understand structural and systemic causes of problems, advocates for structural change, and plans for long-horizon effects.",
    subdims: [
      {
        code: "S1",
        name: "Root Cause Orientation",
        desc: "Does this entity address causes of suffering, not only symptoms?",
        anchors: [
          "All resources at symptom relief, root causes not discussed",
          "Root causes acknowledged, no resources allocated",
          "Some resources to root cause, \u22651 upstream intervention",
          "Explicit strategy, \u22651 documented case of reducing downstream need",
          "Significant resources to structural change, downstream demand reduced",
        ],
      },
      {
        code: "S2",
        name: "Long-Term Impact",
        desc: "Does this entity plan for and measure long-horizon effects?",
        anchors: [
          "Planning horizon is one budget cycle",
          "3\u20135 year plan, primarily aspirational",
          "5+ year planning with specific long-term goals, some tracking",
          "Long-term outcome data influences strategy, theory of change published",
          "10+ year impact model reviewed, longitudinal progress on structural change",
        ],
      },
      {
        code: "S3",
        name: "Interconnection Awareness",
        desc: "Does this entity understand how its actions affect adjacent systems?",
        anchors: [
          "No awareness of second-order effects",
          "Adjacent systems identified, no systematic tracking",
          "\u22651 case of identifying and responding to unintended consequence",
          "Cross-system effects systematically mapped in major decisions",
          "Joint planning with adjacent systems, cross-system outcomes tracked",
        ],
      },
      {
        code: "S4",
        name: "Structural Critique",
        desc: "Does this entity critically examine structures that perpetuate the suffering it addresses?",
        anchors: [
          "Does not question structures that sustain need for its services",
          "Structural critique in communications, disconnected from action",
          "\u22651 public position taken that carries institutional risk",
          "Active advocacy documented, positions against short-term interest",
          "Contributed to \u22651 structural change, acknowledges own model's role",
        ],
      },
      {
        code: "S5",
        name: "Coalitional Compassion",
        desc: "Does this entity collaborate to amplify impact beyond its own capacity?",
        anchors: [
          "Works in isolation, no resource or learning sharing",
          "Some coalition participation, primarily extractive",
          "Active coalition member with documented contributions",
          "Joint outcomes, resource sharing with smaller organizations",
          "Has ceded leadership/credit/resources to better-positioned organization",
        ],
      },
    ],
  },
  {
    code: "INT",
    name: "Integrity",
    color: "#a78bfa",
    desc: "Is compassion genuine, consistent, and non-performative — especially when it costs something?",
    longDesc:
      "Integrity measures whether an institution behaves consistently regardless of who is watching, whether its values-behavior gap is acknowledged, and whether it prioritizes genuine interests over appearances.",
    subdims: [
      {
        code: "I1",
        name: "Consistency Under Pressure",
        desc: "Does compassionate behavior hold when it is costly?",
        anchors: [
          "Commitments abandoned under financial or political pressure",
          "Pressure occasionally causes unacknowledged compromises",
          "\u22651 case of bearing real cost to maintain commitment",
          "Pattern of maintaining commitments, community describes trust",
          "History of significant costs borne, independently verified",
        ],
      },
      {
        code: "I2",
        name: "Non-Performance",
        desc: "Is this entity's compassion genuine rather than reputationally driven?",
        anchors: [
          "Compassionate practices only where reputationally beneficial",
          "Some genuine practice, primarily reputation-motivated",
          "Some practices maintained regardless of visibility",
          "Community reports genuine care with no reputational stakes",
          "Has done something compassionate that was publicly unflattering",
        ],
      },
      {
        code: "I3",
        name: "Internal Consistency",
        desc: "Does this entity treat internal stakeholders with the same compassion as external ones?",
        anchors: [
          "Internal culture significantly less compassionate than external comms",
          "Gap acknowledged but not addressed",
          "Meaningful effort to apply same values to staff",
          "Staff culture broadly reflects stated values",
          "Staff describe internal culture as exemplary, independently assessed",
        ],
      },
      {
        code: "I4",
        name: "Values Alignment",
        desc: "Are institutional decisions consistently aligned with stated values?",
        anchors: [
          "Decisions regularly contradict stated values without acknowledgment",
          "Values consulted for communications, not consistently applied",
          "Values explicitly considered in some major decisions",
          "Values alignment review part of major decision process",
          "Major decisions routinely tested against values, \u22651 reversed",
        ],
      },
      {
        code: "I5",
        name: "Resilience of Care",
        desc: "Does compassion persist across leadership change and institutional stress?",
        anchors: [
          "Compassionate practices are personality-dependent",
          "Some practices in policy, most depend on current leadership",
          "Core practices in policy, \u22651 leadership transition without degradation",
          "Practices survive leadership change, this has been tested",
          "Values embedded structurally, multiple leadership transitions without degradation",
        ],
      },
    ],
  },
];

export const BAND_DESCS: Record<string, string> = {
  Critical:
    "Your institution is at a critical stage. Foundational compassion infrastructure is absent. Immediate attention is needed across multiple dimensions.",
  Developing:
    "Your institution is developing compassionate practices. Key structures are emerging but remain inconsistent or reactive.",
  Functional:
    "Your institution has functional compassion practices. Systems exist but have significant gaps in consistency, depth, or equity.",
  Established:
    "Your institution demonstrates established compassion. Practices are systematic, documented, and improving.",
  Exemplary:
    "Your institution demonstrates exemplary compassion. Practices are independently verified, consistent, and sustained under pressure.",
};

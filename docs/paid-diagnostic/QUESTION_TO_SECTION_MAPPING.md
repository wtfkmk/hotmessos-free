# QUESTION TO SECTION MAPPING
## Which Questions Feed Which Report Sections

**Purpose:** This document maps each of the 83 inputs to the report sections that use them. Use this during AI prompt engineering to ensure all data points are utilized.

---

## SECTION 1: IDENTITY DEEP DIVE

### **Primary Inputs:**
- Signup Q2: Elevator pitch
- CF Q1: Natural creative gifts (multi-select)
- CF Q5: Creation source (reaction → origination)
- CF Q7: Creation intent (validation → impact)
- CF Q17: Brand authenticity (persona → integrated)
- BD Q15a: Open text A (anything else to know)
- BD Q15b: Open text B (version you're building toward)

### **Supporting Inputs:**
- P Q2: Evolution of voice + beliefs
- P Q8: Presence quality
- CF Q9: Security in individuality
- CF Q18: Secret hope

### **Synthesis:**
- Operating mode (sovereignty vs survival)
- Self-relationship health
- Creative identity
- Core motivation
- Identity coherence (pitch vs authenticity match)

---

## SECTION 2: USER CAPACITY & CONSTRAINTS

### **Primary Inputs:**
- Signup Q3: Team size
- Signup Q4: Working style
- Signup Q5: Monthly revenue
- Signup Q6: Hours per week
- Signup Q7: Monthly budget
- Signup Q8: Platform priority (ranked)
- Signup Q9: Biggest constraint

### **Synthesis:**
- Real capacity vs stated goals
- Constraint hierarchy
- Working style alignment

---

## SECTION 3: USER STRENGTHS & NATURAL TENDENCIES

### **Primary Inputs:**
- All pillar scores ≥ 4.0
- CF Q1: Natural creative gifts
- DS Q13: Strength-system alignment

### **Synthesis:**
- Natural capability inventory
- Hidden strengths from question patterns
- Strength clusters

---

## SECTION 4: USER BELIEFS & HABITS

### **Primary Beliefs Inputs:**
- P Q1: Inner voice quality
- P Q10: Creation mode (validation → identity)
- CF Q9: Individuality security
- CF Q17: Brand authenticity
- R Q17 + follow-up: Money relationship
- R Q18: Sales comfort
- Signup Q4: Working style
- DS Q11: AI power dynamic

### **Primary Habits Inputs:**
- P Q3: Chaos handling
- P Q4: Follow-through
- P Q9: Energy management
- DS Q17: Content leverage
- DS Q16: Failure recovery
- CF Q4: Creative consistency
- CF Q15: Resistance pattern

### **Synthesis:**
- Core belief system (self/money/work/tech/growth)
- Belief → behavior patterns
- Limiting beliefs (top 2-3)
- Empowering beliefs (top 2-3)
- Belief-habit-result chain

---

## SECTION 5: 4 PILLAR SCORES + MESS LEVEL + READINESS

### **Inputs:**
- All 58 pillar assessment questions
- Calculated scores from SCORING_ALGORITHMS.md

### **Output:**
- Presence score + band
- Digital Self score + band
- Relationships score + band
- Creative Flow score + band
- User Mess Level
- Creator Economy Readiness Score (0-100)
- Pillar imbalance analysis
- Readiness archetype
- Growth path recommendation

---

## SECTION 6: OFFER CLARITY ASSESSMENT

### **Primary Inputs:**
- Signup Q1: Business model (ranked)
- Signup Q2: Elevator pitch
- BD Q1: Client journey
- BD Q3: Top 5 products/services
- BD Q8: Perception gap
- BD Q9: Audience search terms (table)
- BD Q12: Unique value
- R Q5: Audience communication clarity

### **Scoring Components:**
- Elevator Pitch Clarity: 25pts
- Offer Coherence: 20pts
- Perception Alignment: 20pts
- Audience Understanding: 15pts
- Unique Value: 10pts
- Communication Effectiveness: 10pts

### **Output:**
- Offer Clarity Score (0-100)
- 10-second test
- Offer portfolio coherence
- Perception gap analysis
- Audience-offer alignment
- UVP analysis
- Refined UVP recommendation

---

## SECTION 7: ONLINE PRESENCE & BRAND (DARK FUNNEL READINESS)

### **Primary Inputs:**
- Signup Q8: Platforms (ranked)
- BD Q2: All online profiles (URLs + intentions + performance)
- BD Q4: Website upload (URL or file)
- BD Q5: Content samples (3-5 pieces)
- DS Q10: Brand evolution strategy
- DS Q17: Content leverage
- CF Q10: Core content areas (ranked)
- CF Q17: Brand authenticity

### **Scoring Components:**
- Platform Coverage: 15pts
- Profile Quality: 20pts
- Website Clarity: 25pts
- Content Voice: 25pts
- Discoverability: 10pts
- Content Leverage: 5pts

### **Core Question:**
"What does someone find if they research you for 30 minutes?"

### **Output:**
- Dark Funnel Readiness Score (0-100)
- 30-minute research test
- Platform breakdown
- Website analysis
- Content voice/consistency
- Discoverability audit
- Competitive benchmark
- Priority fixes

---

## SECTION 8: CONTENT & MESSAGING (WORD CLOUD)

### **Primary Inputs:**
- BD Q2: Profile bios (text extraction)
- BD Q4: Website content (text extraction)
- BD Q5: Content samples (text extraction)
- BD Q15a + Q15b: Open texts
- Signup Q2: Elevator pitch
- All open-text responses across assessment

### **Analysis:**
- Text aggregation from all sources
- Word cloud generation (react-wordcloud)
- Theme clustering (3-5 themes with %)
- Content-focus alignment (CF Q10 vs actual)
- Audience-message alignment (BD Q9 keywords)
- Voice tonality analysis

### **Output:**
- Interactive word cloud
- Theme analysis
- Alignment scores
- Content gaps
- Content-to-offer bridge

---

## SECTION 9: SYSTEMS & OPERATIONS

### **Primary Inputs:**
- DS Q1: File organization (1-5)
- DS Q2: Problem identification
- DS Q4: Tool selection strategy
- DS Q5: AI workflow explainability
- DS Q6: AI integration breadth
- DS Q8: System resilience ("disappear for month" test)
- DS Q8.5: Automation sophistication
- DS Q9: Baseline monitoring
- DS Q13: Strength-system alignment
- DS Q16: Failure recovery
- DS Q17: Content leverage
- BD Q1: Client journey (manual touchpoints analysis)
- BD Q10: Inbound inquiries (lead tracking)
- P Q4: Follow-through
- P Q11: Volatility resilience

### **Scoring Components:**
- Foundation (file org + process docs): 25pts
- Automation (level + AI + leverage): 30pts
- Performance (tracking + leads): 20pts
- Tool Stack: 15pts
- Resilience: 10pts

### **Core Test:**
"Disappear for a month" (DS Q8)

### **Output:**
- Systems Sophistication Score (0-100)
- Resilience test
- Systems maturity breakdown
- Automation assessment
- Tool stack evaluation
- Scalability check
- Phased roadmap (Foundation → Automation → Optimization)
- Quick wins

---

## SECTION 10: COMPETITIVE POSITIONING & MARKET ANALYSIS

### **Primary Inputs:**
- BD Q6: Competitors (3-5, with URLs)
- BD Q7: Competitor feedback (likes/dislikes)
- BD Q9: Audience search terms
- BD Q8: Perception gap
- Signup Q1: Business model

### **Output:**
- Competitive benchmark analysis
- Market positioning map
- White space opportunities
- Competitive advantages identified
- Competitive weaknesses flagged

---

## SECTION 11: GAP ANALYSIS (SELF-PERCEPTION VS REALITY)

### **Gap Types & Inputs:**

**Identity Gap:**
- P Q1, P Q10, CF Q17 (what they believe) vs P Q3, P Q4, P Q11 (how they behave)

**Offer Perception Gap:**
- Signup Q2, BD Q12 (what they think they sell) vs BD Q8 (perception gap)

**Capability Gap:**
- Stated goals (Signup Q10, BD Q15b) vs systems support (DS Q8, DS Q8.5)

**Content-Focus Gap:**
- CF Q10 (what they want to talk about) vs Section 8 word cloud (what they actually create)

**Network-Reality Gap:**
- R Q12, R Q13 (who they think surrounds them) vs R Q12 follow-up (why they tolerate)

**Presence-Performance Gap:**
- P scores vs business performance (revenue, consistency)

### **Output:**
- 5 specific gaps with bridge actions
- Biggest gap (priority fix)
- Positive gaps (underselling strengths)

---

## SECTION 12: LEVERAGE MAP (USER STRENGTHS → BUSINESS OPPORTUNITIES)

### **Primary Inputs:**
- Section 3: Strength inventory (high pillar scores + CF Q1 gifts)
- Section 6: Offer gaps (low Offer Clarity components)
- Section 7: Platform gaps (unused platforms)
- Section 9: Systems gaps (low automation, weak leverage)
- CF Q16: Work-curiosity alignment
- BD Q13: Revenue diversification

### **Analysis:**
- Strength × unmet need intersections
- Untapped opportunities (strength meets gap)
- Revenue stream gaps
- Content-to-offer bridges
- Curiosity monetization
- Platform leverage gaps
- Collaboration multipliers

### **Output:**
- 3 untapped opportunities with launch plans
- #1 Leverage Play (highest ROI, 30-day launch)
- Long-term leverage strategy

---

## SECTION 13: BOTTLENECK DIAGNOSIS

### **5 Bottleneck Types:**

**1. Identity Bottleneck** (Low Presence <3.0)
- Primary: Presence score
- Supporting: P Q1, P Q3, P Q10, P Q11

**2. Capability Bottleneck** (Low Digital Self <3.0)
- Primary: Digital Self score
- Supporting: DS Q8, DS Q8.5, DS Q13

**3. Relational Bottleneck** (Low Relationships <3.0)
- Primary: Relationships score
- Supporting: R Q12, R Q13, R Q17, R Q18

**4. Creative Bottleneck** (Low Creative Flow <3.0)
- Primary: Creative Flow score
- Supporting: CF Q4, CF Q13, CF Q14, CF Q16

**5. Business Bottleneck** (Low Business Scores <50)
- Primary: Offer Clarity, Dark Funnel, Systems scores
- Supporting: Section 6, 7, 9 analyses

### **Algorithm:**
1. Identify lowest pillar score
2. Identify lowest business score
3. Compare User vs Business score
4. Cross-reference Signup Q9 (stated constraint)
5. Validate with Section 11 gaps

### **Output:**
- Primary constraint (THE ONE bottleneck)
- Cascading impact (because X → can't Y → results in Z)
- Root cause (5 Whys)
- Interdependency mapping
- Bottleneck fix strategy (phased)
- Quick win (this week)
- Success metrics

---

## SECTION 14: SUPPORT SYSTEMS BLUEPRINT

### **Primary Inputs:**
- Section 13: Primary bottleneck type
- Signup Q6: Hours per week (time availability)
- Signup Q7: Monthly budget
- Signup Q4: Working style

### **Support Type Matching:**

| Bottleneck | Support Type | Budget Tiers |
|-----------|-------------|-------------|
| Identity | Accountability (coaching/therapy) | $0-$5K+ |
| Capability | Execution (DFY systems/VA) | $500-$10K+ |
| Relational | Community (mastermind) | $0-$2.5K |
| Creative | Accountability (creative coach) | $500-$5K |
| Business | Expertise (consultant) | $1K-$25K |

### **Output:**
- Support gap assessment
- Personalized support prescription (3 priorities)
- Network upgrade strategy
- Accountability architecture
- Expertise gaps to fill
- First hire recommendation
- Investment priority sequence

---

## SECTION 15: INTEGRATED GROWTH ROADMAP (30/90/365-DAY)

### **Inputs:**
- Section 5: Current pillar scores + Mess Level + Readiness
- Section 13: Primary bottleneck
- Signup Q6 + Q7: Time + budget constraints
- Signup Q9: Biggest constraint
- Signup Q10: Primary 90-day goal
- BD Q15b: Version building toward

### **Structure:**

**Part 1: Baseline**
- All current scores
- Primary bottleneck
- Available resources

**Part 2: 30-Day Tactical Plan**
- Week 1: Stop the bleeding (bottleneck containment)
- Week 2: Build foundation (direct bottleneck attack)
- Week 3: Create momentum (deepen fix + gap bridge)
- Week 4: Validate + iterate (metrics + launch leverage play)

**Part 3: 90-Day Success Arc**
- Pillar improvement targets
- Business score targets
- Leverage activated (#1 opportunity launched)
- Constraint evolution (old bottleneck → new bottleneck)

**Part 4: 365-Day Vision**
- Identity shift
- Capability shift
- Business model shift
- Network shift
- Creative fulfillment shift
- Life integration (hours/revenue/freedom)
- Dream realized (from BD Q15b + CF Q18)

**Part 5-7:**
- Milestone markers
- Course corrections
- Commitment checklist

---

## SECTION 16: AI & CREATOR ECONOMY OPPORTUNITIES (+ JOB MARKET)

### **Primary Inputs:**
- Digital Self score (AI readiness tier)
- Signup Q1: Business model (occupational mapping)
- CF Q1: Natural gifts (human-only moats)
- CF Q18: Secret hope (AI enablement)
- DS Q6: AI integration breadth
- DS Q7: Technical fluency
- DS Q11: AI power dynamic
- DS Q12: Data boundaries
- Section 12: Leverage opportunities

### **AI Readiness Tiers:**
- Beginner (<2.5 DS)
- Explorer (2.5-3.5)
- Integrator (3.5-4.5)
- Architect (4.5+)

### **Job Market Positioning:**
- Map business model to occupational categories
- Show theoretical AI coverage % vs observed usage %
- Calculate automation timeline (2025/2026/2027-28)
- Identify human-only moats (from high pillars + gifts)
- Build adaptation strategy (30/90/365 days)

### **Output:**
- AI readiness tier
- 3-5 matched AI opportunities
- Relevant creator economy trends (2026)
- Personalized tool stack (budget-tiered)
- Job market risk score (LOW/MEDIUM/HIGH/CRITICAL)
- Automation timeline
- Market positioning shift (old → AI-native)
- Secret hope realized
- Quick wins (3 AI experiments this week)

---

## SECTION 17: NEXT STEPS & RECOMMENDED SUPPORT

### **Primary Inputs:**
- Section 13: Bottleneck type
- Section 14: Support types needed
- Signup Q6 + Q7: Time + budget
- Section 6: Offer Clarity score (Niche Finder relevance)
- Section 7: Dark Funnel score (SEO Agent relevance)
- Section 8: Voice consistency (Voice Amplifier relevance)
- CF Q4: Creative consistency (Content Calendar relevance)

### **Agent Matching Logic:**
See AGENT_MATCHING_LOGIC.md for full conditional display rules

### **Output:**
- Support type needed (based on bottleneck)
- Hot Mess OS agents (conditional, only if relevant):
  - 🎯 Niche Finder (if Offer Clarity < 70)
  - 📢 Voice Amplifier (if voice consistency < 7/10)
  - 🔍 SEO Keyword Strategy (if Dark Funnel < 60)
  - 📅 Content Calendar (if creative consistency < 3)
- Support needs for elsewhere (third-party)
- Support roadmap (Phase 1/2/3)
- Free community CTA
- Support profile saved to database

---

## DATA UTILIZATION AUDIT

### **Questions Used Multiple Times (Cross-Section):**
- Signup Q2 (elevator pitch): Sections 1, 6, 8
- CF Q1 (natural gifts): Sections 1, 3, 12, 16
- CF Q17 (brand authenticity): Sections 1, 4, 7, 8
- DS Q8 (system resilience): Sections 9, 13
- BD Q15b (version building toward): Sections 1, 15
- CF Q18 (secret hope): Sections 1, 16

### **Questions Used Once:**
- Most pillar questions feed into Section 5 (scores) and their respective bottleneck analysis in Section 13

### **Unused Questions:**
None. All 83 inputs are utilized across the 17 sections.

---

## VALIDATION CHECKLIST

Before generating report, verify:

✅ All 83 inputs collected  
✅ All file uploads processed (website, content samples)  
✅ All scores calculated (4 pillars + 3 business + 1 readiness)  
✅ Text extracted from uploads for Section 8 word cloud  
✅ Bottleneck identified (Section 13)  
✅ Agent relevance scored (Section 17)  
✅ Support recommendations structured for database storage  

---

## NOTES FOR AI PROMPT ENGINEERING

- Some sections require AI analysis (e.g., elevator pitch clarity, website quality)
- Others are formula-driven (e.g., pillar scores, readiness calculation)
- Cross-section synthesis is critical (Section 11 gaps, Section 12 leverage, Section 13 bottleneck)
- Section 8 word cloud requires text extraction from uploaded files
- Section 17 agent matching uses conditional logic from AGENT_MATCHING_LOGIC.md
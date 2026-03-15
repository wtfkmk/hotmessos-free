# AGENT MATCHING LOGIC
## Conditional Display of Hot Mess OS Agents

---

## OVERVIEW

Hot Mess OS agents are displayed conditionally in **Section 17: Next Steps & Recommended Support** based on the user's diagnostic scores and responses. Each agent has specific trigger conditions that determine its relevance (High / Medium / Low).

**Only agents with Medium or High relevance are shown to the user.**

---

## AGENT 1: 🎯 NICHE FINDER AGENT

**Purpose:** Stop saying "I help everyone" and actually define who you serve.

**What It Does:**
- Interviews you
- Analyzes market gaps
- Delivers 3-5 viable niche options
- Provides copy-paste positioning statements

---

### **Trigger Conditions:**
```javascript
const shouldShowNicheFinder = (scores, responses) => {
  // Primary trigger: Offer Clarity Score
  if (scores.businessScores.offerClarity.score < 70) {
    return { show: true, relevance: 'high', reason: 'Offer Clarity Score below 70' };
  }
  
  // Secondary trigger: Vague elevator pitch
  const pitchAnalysis = analyzeElevatorPitch(responses.signup.Q2);
  if (pitchAnalysis.specificity < 3) { // 1-5 scale, <3 = vague
    return { show: true, relevance: 'high', reason: 'Elevator pitch too vague or generic' };
  }
  
  // Tertiary trigger: Multiple business models without clear primary
  if (responses.signup.Q1_business_models.length > 2) {
    return { show: true, relevance: 'medium', reason: 'Multiple business models, unclear focus' };
  }
  
  // Low relevance: Offer clarity is decent but could refine
  if (scores.businessScores.offerClarity.score >= 70 && scores.businessScores.offerClarity.score < 80) {
    return { show: true, relevance: 'low', reason: 'Offer clarity decent but could refine' };
  }
  
  return { show: false, relevance: 'none' };
};
```

---

### **Relevance Scoring:**

**HIGH Relevance:**
- Offer Clarity < 70
- Elevator pitch clarity score < 3/5
- BD Q8 (perception gap) indicates confusion about what they do

**MEDIUM Relevance:**
- Offer Clarity 70-79
- Multiple business models (3+) without clear hierarchy
- BD Q12 (unique value) is generic or unclear

**LOW Relevance:**
- Offer Clarity 80-89
- Everything else is working but positioning could be sharper

**NONE (Don't Show):**
- Offer Clarity 90+
- Clear, specific positioning already

---

### **Display Example:**
```markdown
### 🎯 Niche Finder Agent
**Relevance: HIGH**

**Why This Fits You:**
Your Offer Clarity Score is 52/100. When analyzing your elevator pitch ("I help people with their business"), it's too vague to attract your ideal clients. You need to stop saying "I help everyone" and actually define who you serve.

**What It Does:**
[Agent description...]

**Status:** 🚀 Launching Soon
**[Sign Up for Early Access →]**
```

---

## AGENT 2: 📢 VOICE AMPLIFIER AGENT

**Purpose:** Stop regurgitating generic takes. Develop a perspective that's distinctly YOU.

**What It Does:**
- Scrapes trending content in your niche
- Challenges you to form your own perspective
- Converts your ideas into content formats
- Voice analysis & consistency scoring

---

### **Trigger Conditions:**
```javascript
const shouldShowVoiceAmplifier = (scores, responses, contentAnalysis) => {
  // Primary trigger: Low voice consistency from Section 8
  if (contentAnalysis.voiceConsistencyScore < 7) { // 0-10 scale
    return { show: true, relevance: 'high', reason: 'Content voice consistency below 7/10' };
  }
  
  // Secondary trigger: Brand authenticity is "persona"
  if (responses.creativeFlow.CF_Q17 === 'A' || responses.creativeFlow.CF_Q17 === 'B') {
    // A = Persona, B = Partially authentic
    return { show: true, relevance: 'high', reason: 'Creating from persona, not authentic voice' };
  }
  
  // Tertiary trigger: Creation source is reaction/imitation
  if (responses.creativeFlow.CF_Q5 === 'A' || responses.creativeFlow.CF_Q5 === 'B') {
    // A = Reaction, B = Imitation
    return { show: true, relevance: 'medium', reason: 'Creating from reaction/imitation vs origination' };
  }
  
  // Quaternary trigger: Content themes are scattered
  if (contentAnalysis.themeCount > 5) { // Too many themes = no focus
    return { show: true, relevance: 'medium', reason: 'Content themes scattered, no clear voice' };
  }
  
  return { show: false, relevance: 'none' };
};
```

---

### **Relevance Scoring:**

**HIGH Relevance:**
- Voice consistency score < 7/10 (from Section 8 content analysis)
- CF Q17 (brand authenticity) = A or B (persona or partially authentic)
- Content samples show inconsistent tone/style

**MEDIUM Relevance:**
- Voice consistency 7-8/10 (good but could be sharper)
- CF Q5 (creation source) = A or B (reaction/imitation)
- Multiple scattered themes (5+) without clear through-line

**LOW Relevance:**
- Voice consistency 8-9/10
- Creating from translation (C) but could push to origination

**NONE (Don't Show):**
- Voice consistency 9+/10
- CF Q17 = D (fully integrated authentic brand)
- CF Q5 = D (origination)

---

### **Display Example:**
```markdown
### 📢 Voice Amplifier Agent
**Relevance: MEDIUM**

**Why This Fits You:**
Your content voice consistency is 6/10. Your samples show you're capable of strong writing, but your voice shifts between professional corporate tone and casual creator voice. You need to develop a perspective that's distinctly YOU, not generic takes.

**What It Does:**
[Agent description...]

**Status:** 🚀 Launching Soon
**[Sign Up for Early Access →]**
```

---

## AGENT 3: 🔍 SEO KEYWORD STRATEGY AGENT

**Purpose:** Stop guessing what keywords to target. Get data-driven keyword strategy.

**What It Does:**
- Keyword research & volume analysis
- Competition & difficulty scoring
- Search intent mapping
- Content topic recommendations

---

### **Trigger Conditions:**
```javascript
const shouldShowSEOAgent = (scores, responses) => {
  // Primary trigger: Dark Funnel Score
  if (scores.businessScores.darkFunnel.score < 60) {
    return { show: true, relevance: 'high', reason: 'Dark Funnel Readiness Score below 60' };
  }
  
  // Secondary trigger: Discoverability component specifically low
  if (scores.businessScores.darkFunnel.components.discoverability < 5) { // Out of 10
    return { show: true, relevance: 'high', reason: 'Discoverability score critically low' };
  }
  
  // Tertiary trigger: BD Q9 (audience search terms) is vague or incomplete
  const searchTerms = responses.businessDeepDive.BD_Q9_audience_search;
  if (!searchTerms || searchTerms.searches.length < 3) {
    return { show: true, relevance: 'high', reason: 'Weak understanding of audience search behavior' };
  }
  
  // Quaternary trigger: Platform priority includes Website but website analysis shows SEO gaps
  if (responses.signup.Q8_platforms.includes('Website') && 
      scores.businessScores.darkFunnel.components.discoverability < 7) {
    return { show: true, relevance: 'medium', reason: 'Website prioritized but SEO weak' };
  }
  
  return { show: false, relevance: 'none' };
};
```

---

### **Relevance Scoring:**

**HIGH Relevance:**
- Dark Funnel Score < 60
- Discoverability component < 5/10
- BD Q9 shows weak understanding of what audience searches
- Website exists but not optimized for search

**MEDIUM Relevance:**
- Dark Funnel 60-74
- Discoverability 5-7/10
- Some keyword awareness but not strategic

**LOW Relevance:**
- Dark Funnel 75-84
- Has basic SEO but could optimize further

**NONE (Don't Show):**
- Dark Funnel 85+
- Already strong discoverability

---

### **Display Example:**
```markdown
### 🔍 SEO Keyword Strategy Agent
**Relevance: HIGH**

**Why This Fits You:**
Your Dark Funnel Readiness Score is 52/100. When people research you, they can't find you. Your audience search terms analysis shows you're guessing at keywords instead of researching what your audience actually searches.

**What It Does:**
[Agent description...]

**Status:** 🚀 Launching Soon
**[Sign Up for Early Access →]**
```

---

## AGENT 4: 📅 CONTENT CALENDAR AGENT

**Purpose:** Planning content shouldn't take longer than creating it.

**What It Does:**
- 30-90 day content roadmap
- Creative briefs per post
- Platform-optimized scheduling
- Seasonal & trend integration

---

### **Trigger Conditions:**
```javascript
const shouldShowContentCalendar = (scores, responses) => {
  // Primary trigger: Creative consistency score
  const consistencyScore = convertToScale(responses.creativeFlow.CF_Q4, 'A-D'); // 1-5
  if (consistencyScore < 3) { // A or B = sporadic or inconsistent
    return { show: true, relevance: 'high', reason: 'Creative consistency score below 3/5' };
  }
  
  // Secondary trigger: Content leverage is "move on immediately"
  if (responses.digitalSelf.DS_Q17 === 'A') {
    return { show: true, relevance: 'high', reason: 'No content planning or repurposing system' };
  }
  
  // Tertiary trigger: Biggest constraint is "Time" + Creative blocks includes "Unclear direction"
  if (responses.signup.Q9_biggest_constraint === 'Time' && 
      responses.creativeFlow.CF_Q14_selections.includes('Unclear direction')) {
    return { show: true, relevance: 'high', reason: 'Time-constrained + unclear content direction' };
  }
  
  // Quaternary trigger: Creative blocks includes "Time scarcity"
  if (responses.creativeFlow.CF_Q14_selections.includes('Time scarcity')) {
    return { show: true, relevance: 'medium', reason: 'Time scarcity blocking consistent creation' };
  }
  
  // Quinary trigger: Low Dark Funnel + inconsistent posting pattern
  if (scores.businessScores.darkFunnel.score < 70 && consistencyScore < 4) {
    return { show: true, relevance: 'medium', reason: 'Weak presence + inconsistent content' };
  }
  
  return { show: false, relevance: 'none' };
};
```

---

### **Relevance Scoring:**

**HIGH Relevance:**
- CF Q4 (creative consistency) = A or B (sporadic/inconsistent)
- DS Q17 (content leverage) = A (move on immediately, no planning)
- Time constraint + unclear direction (double whammy)

**MEDIUM Relevance:**
- CF Q4 = C (regular rhythm but could be more structured)
- CF Q14 includes "Time scarcity" or "Unclear direction"
- Dark Funnel < 70 due to inconsistent content

**LOW Relevance:**
- CF Q4 = C but everything else is working
- Has some planning but could optimize

**NONE (Don't Show):**
- CF Q4 = D (daily discipline)
- Clear content system already in place

---

### **Display Example:**
```markdown
### 📅 Content Calendar Agent
**Relevance: MEDIUM**

**Why This Fits You:**
Your creative consistency score is 2/5 (sporadic - create when inspiration strikes) and you selected "Time scarcity" and "Unclear direction" as creative blocks. Planning content shouldn't take longer than creating it.

**What It Does:**
[Agent description...]

**Status:** 🚀 Launching Soon
**[Sign Up for Early Access →]**
```

---

## IMPLEMENTATION CODE

### **Master Agent Matching Function:**
```javascript
const matchAgentsToUser = (scores, responses, contentAnalysis) => {
  const agents = [];
  
  // Check each agent
  const nicheFinder = shouldShowNicheFinder(scores, responses);
  if (nicheFinder.show && (nicheFinder.relevance === 'high' || nicheFinder.relevance === 'medium')) {
    agents.push({
      slug: 'niche_finder',
      name: '🎯 Niche Finder Agent',
      relevance: nicheFinder.relevance,
      reason: nicheFinder.reason,
    });
  }
  
  const voiceAmplifier = shouldShowVoiceAmplifier(scores, responses, contentAnalysis);
  if (voiceAmplifier.show && (voiceAmplifier.relevance === 'high' || voiceAmplifier.relevance === 'medium')) {
    agents.push({
      slug: 'voice_amplifier',
      name: '📢 Voice Amplifier Agent',
      relevance: voiceAmplifier.relevance,
      reason: voiceAmplifier.reason,
    });
  }
  
  const seoAgent = shouldShowSEOAgent(scores, responses);
  if (seoAgent.show && (seoAgent.relevance === 'high' || seoAgent.relevance === 'medium')) {
    agents.push({
      slug: 'seo_keyword_strategy',
      name: '🔍 SEO Keyword Strategy Agent',
      relevance: seoAgent.relevance,
      reason: seoAgent.reason,
    });
  }
  
  const contentCalendar = shouldShowContentCalendar(scores, responses);
  if (contentCalendar.show && (contentCalendar.relevance === 'high' || contentCalendar.relevance === 'medium')) {
    agents.push({
      slug: 'content_calendar',
      name: '📅 Content Calendar Agent',
      relevance: contentCalendar.relevance,
      reason: contentCalendar.reason,
    });
  }
  
  // Sort by relevance (high first)
  agents.sort((a, b) => {
    if (a.relevance === 'high' && b.relevance !== 'high') return -1;
    if (a.relevance !== 'high' && b.relevance === 'high') return 1;
    return 0;
  });
  
  return agents;
};
```

---

### **Save to Database:**
```javascript
const saveAgentRecommendations = async (diagnosticId, matchedAgents) => {
  const agentData = matchedAgents.map(agent => ({
    agent: agent.slug,
    relevance: agent.relevance,
    reason: agent.reason,
  }));
  
  await supabase
    .from('paid_diagnostics')
    .update({
      support_recommendations: {
        ...existingSupportData,
        hot_mess_agents: agentData,
      }
    })
    .eq('id', diagnosticId);
};
```

---

### **Render in Section 17:**
```javascript
const renderAgentSection = (matchedAgents) => {
  if (matchedAgents.length === 0) {
    return `
### Hot Mess OS Agents

Based on your diagnostic, none of our current agents directly address your primary bottleneck.

**We're building new agents constantly.** Sign up below to be notified when we launch tools that match your needs.

**[Join Waitlist →]**
    `;
  }
  
  let output = '## Hot Mess OS Agents That Might Help:\n\n';
  output += 'Based on your scores, these agents could accelerate specific gaps:\n\n';
  
  matchedAgents.forEach(agent => {
    output += `---\n\n`;
    output += `### ${agent.name}\n`;
    output += `**Relevance: ${agent.relevance.toUpperCase()}**\n\n`;
    output += `**Why This Fits You:**\n`;
    output += `${agent.reason}\n\n`;
    output += `**What It Does:**\n`;
    output += getAgentDescription(agent.slug);
    output += `\n\n**Status:** 🚀 Launching Soon\n`;
    output += `**[Sign Up for Early Access →]**\n\n`;
  });
  
  return output;
};
```

---

## TESTING SCENARIOS

### **Scenario 1: Low Offer Clarity + Weak Dark Funnel**

**Input:**
- Offer Clarity: 45/100
- Dark Funnel: 38/100
- CF Q4: B (inconsistent)
- CF Q17: B (partially authentic)

**Expected Agents Shown:**
1. 🎯 Niche Finder (HIGH) - Offer clarity critically low
2. 🔍 SEO Keyword Strategy (HIGH) - Dark funnel critically low
3. 📅 Content Calendar (MEDIUM) - Inconsistent posting
4. 📢 Voice Amplifier (MEDIUM) - Partially authentic voice

---

### **Scenario 2: Strong User, Weak Business**

**Input:**
- All Pillar Scores: 4.0+
- Offer Clarity: 82/100
- Dark Funnel: 55/100
- CF Q4: D (daily discipline)

**Expected Agents Shown:**
1. 🔍 SEO Keyword Strategy (HIGH) - Dark funnel needs work
2. (No other agents shown - high relevance only)

---

### **Scenario 3: Already Dialed In**

**Input:**
- All Pillar Scores: 4.5+
- Offer Clarity: 92/100
- Dark Funnel: 88/100
- Systems: 85/100

**Expected Agents Shown:**
- None (all scores high)
- Show waitlist CTA for future products

---

## NOTES

- Only show agents with **Medium or High** relevance
- Always sort by relevance (High first)
- Save agent recommendations to database for future targeting
- If no agents match, show waitlist signup
- Agent descriptions are stored separately (not in this logic file)
- Conditional display keeps Section 17 personalized and relevant
```

---

## 🎉 **BATCH 3 COMPLETE!**

You now have all the **critical implementation files**:

✅ `SCORING_ALGORITHMS.md` - All the math  
✅ `DATABASE_SCHEMA.md` - Supabase tables  
✅ `AGENT_MATCHING_LOGIC.md` - Conditional agent display  

---

## 📊 **WHAT WE'VE BUILT SO FAR:**
```
docs/paid-diagnostic/
├── README.md ✅
├── COMPLETE_QUESTION_LIST.md ✅
├── REPORT_STRUCTURE.md ✅
├── SCORING_ALGORITHMS.md ✅
├── DATABASE_SCHEMA.md ✅
├── AGENT_MATCHING_LOGIC.md ✅
└── sections/ (empty - optional)
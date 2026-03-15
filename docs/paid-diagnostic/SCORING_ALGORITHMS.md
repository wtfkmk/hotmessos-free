# SCORING ALGORITHMS
## All Pillar Scoring Formulas & Readiness Calculations

---

## PILLAR 1: PRESENCE (9 Questions)

### Questions & Point Values:

| Question | Scale | Conversion to 1-5 |
|----------|-------|-------------------|
| P Q1: Inner Voice Quality | A-D | A=1, B=2, C=4, D=5 |
| P Q2: Evolution of Voice | A-D | A=1, B=2, C=4, D=5 |
| P Q3: Chaos vs Clarity | A-C | A=1, B=3, C=5 |
| P Q4: Follow-Through | 1-5 | Direct (1-5) |
| P Q6: Physical Presence | 1-5 | Direct (1-5) |
| P Q8: Presence Quality | A-D | A=1, B=2, C=4, D=5 |
| P Q9: Energy Management | 1-5 | Direct (1-5) |
| P Q10: Creation Mode | A-D | A=1, B=2, C=4, D=5 |
| P Q11: Volatility Resilience | A-D | A=1, B=2, C=4, D=5 |

### Scoring Algorithm:
```javascript
// Convert all to 1-5 scale
const convertToScale = (answer, questionType) => {
  if (questionType === 'A-D') {
    const map = { A: 1, B: 2, C: 4, D: 5 };
    return map[answer];
  }
  if (questionType === 'A-C') {
    const map = { A: 1, B: 3, C: 5 };
    return map[answer];
  }
  if (questionType === '1-5') {
    return parseInt(answer); // Direct scale
  }
};

// Calculate Presence Score
const calculatePresenceScore = (answers) => {
  const scores = [
    convertToScale(answers.P_Q1, 'A-D'),
    convertToScale(answers.P_Q2, 'A-D'),
    convertToScale(answers.P_Q3, 'A-C'),
    convertToScale(answers.P_Q4, '1-5'),
    convertToScale(answers.P_Q6, '1-5'),
    convertToScale(answers.P_Q8, 'A-D'),
    convertToScale(answers.P_Q9, '1-5'),
    convertToScale(answers.P_Q10, 'A-D'),
    convertToScale(answers.P_Q11, 'A-D'),
  ];
  
  // All questions weighted equally
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  return parseFloat(average.toFixed(1)); // Round to 1 decimal
};
```

### Qualitative Bands:
```javascript
const getPresenceBand = (score) => {
  if (score >= 4.5) return 'Sovereign Operator';
  if (score >= 3.5) return 'Mostly Grounded';
  if (score >= 2.5) return 'Inconsistent Presence';
  if (score >= 1.5) return 'Survival Mode';
  return 'Crisis State';
};
```

---

## PILLAR 2: DIGITAL SELF (17 Questions)

### Questions & Point Values:

| Question | Scale | Weight | Conversion |
|----------|-------|--------|------------|
| DS Q1: File Organization | 1-5 | 1.0x | Direct |
| DS Q2: Problem Identification | A-D | 1.0x | A=1, B=2, C=4, D=5 |
| DS Q3: AI Quality Control | 1-5 | 1.0x | Direct |
| DS Q4: Tool Selection | A-D | 1.0x | A=1, B=2, C=4, D=5 |
| DS Q5: AI Explainability | A-D | 1.5x | A=1, B=2, C=4, D=5 |
| DS Q6: AI Integration Breadth | A-D | 1.5x | A=1, B=2, C=4, D=5 |
| DS Q7: Technical Fluency | 1-5 | 1.0x | Direct |
| DS Q8: System Resilience | A-D | 1.5x | A=1, B=2, C=4, D=5 |
| DS Q8.5: Automation Level | A-D | 1.5x | A=1, B=2, C=4, D=5 |
| DS Q9: Baseline Monitoring | A-D | 1.0x | A=1, B=2, C=4, D=5 |
| DS Q10: Brand Evolution | A-D | 1.0x | A=1, B=2, C=4, D=5 |
| DS Q11: AI Power Dynamic | A-D | 1.5x | A=1, B=2, C=4, D=5 |
| DS Q12: Data Boundaries | Multi+Follow | 1.0x | (See below) |
| DS Q13: Strength-System Align | A-D | 1.5x | A=1, B=2, C=4, D=5 |
| DS Q15: Past-Wave Adoption | A-C | 1.0x | A=1, B=3, C=5 |
| DS Q16: Failure Recovery | A-D | 1.5x | A=1, B=2, C=4, D=5 |
| DS Q17: Content Leverage | A-D | 1.0x | A=1, B=2, C=4, D=5 |

### DS Q12 Special Scoring:
```javascript
const scoreDataBoundaries = (selections, followUp) => {
  // Main question: how many oversharing categories selected?
  const riskCount = selections.length; // 0-5
  
  // Follow-up adds context
  const followUpMap = {
    A: 1, // "Didn't think about it" - worst
    B: 2, // "Uneasy but convenient"
    C: 4, // "Comfortable - trust tools"
    D: 5, // "Intentional - informed choices"
  };
  
  const followUpScore = followUpMap[followUp] || 3;
  
  // If they selected "None" (0 risks) and followUp is intentional (D), score is 5
  // If they selected all 5 risks and "didn't think about it" (A), score is 1
  
  if (riskCount === 0 && followUp === 'D') return 5;
  if (riskCount >= 4 && followUp === 'A') return 1;
  
  // Otherwise blend: fewer risks + better awareness = higher score
  const riskScore = 5 - riskCount; // 0 risks = 5, 5 risks = 0
  const blended = (riskScore + followUpScore) / 2;
  
  return Math.max(1, Math.min(5, blended)); // Clamp to 1-5
};
```

### Scoring Algorithm:
```javascript
const calculateDigitalSelfScore = (answers) => {
  const weightedScores = [
    { score: convertToScale(answers.DS_Q1, '1-5'), weight: 1.0 },
    { score: convertToScale(answers.DS_Q2, 'A-D'), weight: 1.0 },
    { score: convertToScale(answers.DS_Q3, '1-5'), weight: 1.0 },
    { score: convertToScale(answers.DS_Q4, 'A-D'), weight: 1.0 },
    { score: convertToScale(answers.DS_Q5, 'A-D'), weight: 1.5 },
    { score: convertToScale(answers.DS_Q6, 'A-D'), weight: 1.5 },
    { score: convertToScale(answers.DS_Q7, '1-5'), weight: 1.0 },
    { score: convertToScale(answers.DS_Q8, 'A-D'), weight: 1.5 },
    { score: convertToScale(answers.DS_Q8_5, 'A-D'), weight: 1.5 },
    { score: convertToScale(answers.DS_Q9, 'A-D'), weight: 1.0 },
    { score: convertToScale(answers.DS_Q10, 'A-D'), weight: 1.0 },
    { score: convertToScale(answers.DS_Q11, 'A-D'), weight: 1.5 },
    { score: scoreDataBoundaries(answers.DS_Q12_selections, answers.DS_Q12_followup), weight: 1.0 },
    { score: convertToScale(answers.DS_Q13, 'A-D'), weight: 1.5 },
    { score: convertToScale(answers.DS_Q15, 'A-C'), weight: 1.0 },
    { score: convertToScale(answers.DS_Q16, 'A-D'), weight: 1.5 },
    { score: convertToScale(answers.DS_Q17, 'A-D'), weight: 1.0 },
  ];
  
  // Weighted average
  const totalWeight = weightedScores.reduce((sum, item) => sum + item.weight, 0);
  const weightedSum = weightedScores.reduce((sum, item) => sum + (item.score * item.weight), 0);
  
  return parseFloat((weightedSum / totalWeight).toFixed(1));
};
```

### Qualitative Bands:
```javascript
const getDigitalSelfBand = (score) => {
  if (score >= 4.5) return 'Digital Architect';
  if (score >= 3.5) return 'Systems Builder';
  if (score >= 2.5) return 'Tactical Executor';
  if (score >= 1.5) return 'Manual Hustler';
  return 'Digital Chaos';
};
```

---

## PILLAR 3: RELATIONSHIPS (16 Questions)

### Questions & Point Values:

| Question | Scale | Weight | Conversion |
|----------|-------|--------|------------|
| R Q1: Inner Voice | A-D | 1.0x | A=1, B=2, C=4, D=5 |
| R Q2: Emotional Decisions | A-D | 1.0x | A=1, B=2, C=4, D=5 |
| R Q3: Regulation | A-D | 1.0x | A=1, B=2, C=4, D=5 |
| R Q4: Deep Work | 1-5 | 1.0x | Direct |
| R Q5: Audience Comm | A-D | 1.0x | A=1, B=2, C=4, D=5 |
| R Q6: Conflict | A-D | 1.0x | A=1, B=2, C=4, D=5 |
| R Q7: Online Feedback | A-D | 1.0x | A=1, B=2, C=4, D=5 |
| R Q9: Boundaries | 1-5 | 1.0x | Direct |
| R Q10: Professional Reciprocity | A-D | 1.0x | A=1, B=2, C=4, D=5 |
| R Q11: Energy Distribution | Ranking | 1.0x | (See below) |
| R Q12: Network Elevation | A-D | 1.5x | A=1, B=2, C=4, D=5 |
| R Q12 Follow-up | Context only | 0x | Not scored |
| R Q13: Network Alignment | A-D | 1.5x | A=1, B=2, C=4, D=5 |
| R Q14: Resilience vs Flattery | A-C | 1.0x | A=1, B=3, C=5 |
| R Q16: Collaboration | A-D | 1.0x | A=1, B=2, C=4, D=5 |
| R Q17: Money Relationship | A-D | 1.5x | A=1, B=2, C=4, D=5 |
| R Q17 Follow-up | 1-5 | 1.5x | Direct |
| R Q18: Sales Comfort | A-D | 1.5x | A=1, B=2, C=4, D=5 |

### R Q11 Special Scoring (Energy Distribution):
```javascript
const scoreEnergyDistribution = (ranking) => {
  // ranking = ['Professional', 'Online', 'Personal', 'Family']
  // For creator economy, professional/online weighted higher
  
  const weights = {
    'Professional': 5,
    'Online': 5,
    'Personal': 3,
    'Family': 2,
  };
  
  // Score based on position (1st = 4 points, 2nd = 3, 3rd = 2, 4th = 1)
  let score = 0;
  ranking.forEach((category, index) => {
    const positionPoints = 4 - index; // 1st=4, 2nd=3, 3rd=2, 4th=1
    score += positionPoints * (weights[category] / 5); // Normalize weight
  });
  
  // Convert 10-point scale to 1-5 scale
  return (score / 10) * 5;
};
```

### Scoring Algorithm:
```javascript
const calculateRelationshipsScore = (answers) => {
  const weightedScores = [
    { score: convertToScale(answers.R_Q1, 'A-D'), weight: 1.0 },
    { score: convertToScale(answers.R_Q2, 'A-D'), weight: 1.0 },
    { score: convertToScale(answers.R_Q3, 'A-D'), weight: 1.0 },
    { score: convertToScale(answers.R_Q4, '1-5'), weight: 1.0 },
    { score: convertToScale(answers.R_Q5, 'A-D'), weight: 1.0 },
    { score: convertToScale(answers.R_Q6, 'A-D'), weight: 1.0 },
    { score: convertToScale(answers.R_Q7, 'A-D'), weight: 1.0 },
    { score: convertToScale(answers.R_Q9, '1-5'), weight: 1.0 },
    { score: convertToScale(answers.R_Q10, 'A-D'), weight: 1.0 },
    { score: scoreEnergyDistribution(answers.R_Q11_ranking), weight: 1.0 },
    { score: convertToScale(answers.R_Q12, 'A-D'), weight: 1.5 },
    { score: convertToScale(answers.R_Q13, 'A-D'), weight: 1.5 },
    { score: convertToScale(answers.R_Q14, 'A-C'), weight: 1.0 },
    { score: convertToScale(answers.R_Q16, 'A-D'), weight: 1.0 },
    { score: convertToScale(answers.R_Q17, 'A-D'), weight: 1.5 },
    { score: convertToScale(answers.R_Q17_followup, '1-5'), weight: 1.5 },
    { score: convertToScale(answers.R_Q18, 'A-D'), weight: 1.5 },
  ];
  
  const totalWeight = weightedScores.reduce((sum, item) => sum + item.weight, 0);
  const weightedSum = weightedScores.reduce((sum, item) => sum + (item.score * item.weight), 0);
  
  return parseFloat((weightedSum / totalWeight).toFixed(1));
};
```

### Qualitative Bands:
```javascript
const getRelationshipsBand = (score) => {
  if (score >= 4.5) return 'Connected Operator';
  if (score >= 3.5) return 'Relational Builder';
  if (score >= 2.5) return 'Mixed Connections';
  if (score >= 1.5) return 'Relationship Struggle';
  return 'Relational Crisis';
};
```

---

## PILLAR 4: CREATIVE FLOW (16 Questions)

### Questions & Point Values:

| Question | Scale | Weight | Conversion |
|----------|-------|--------|------------|
| CF Q1: Natural Gifts | Multi-select | 1.0x | (See below) |
| CF Q3: Learning Appetite | A-D | 1.0x | A=1, B=2, C=4, D=5 |
| CF Q4: Consistency | A-D | 1.0x | A=1, B=2, C=4, D=5 |
| CF Q5: Creation Source | A-D | 1.5x | A=1, B=2, C=4, D=5 |
| CF Q6: Artistic Maturity | A-D | 1.0x | A=1, B=2, C=4, D=5 |
| CF Q7: Creation Intent | A-D | 1.5x | A=1, B=2, C=4, D=5 |
| CF Q8: AI Flow | 1-5 | 1.0x | Direct |
| CF Q9: Individuality Security | A-D | 1.0x | A=1, B=2, C=4, D=5 |
| CF Q10: Content Areas | Ranking | 1.0x | (See below) |
| CF Q11: Perspective Flex | A-D | 1.0x | A=1, B=2, C=4, D=5 |
| CF Q12: Path Awareness | A-D | 1.0x | A=1, B=2, C=4, D=5 |
| CF Q13: Fulfillment | A-D | 1.5x | A=1, B=2, C=4, D=5 |
| CF Q14: Creative Blocks | Multi-select | 1.0x | (Inverse - see below) |
| CF Q15: Resistance Pattern | A-D | 1.0x | A=1, B=2, C=4, D=5 |
| CF Q16: Work-Curiosity Align | A-D | 1.5x | A=1, B=2, C=4, D=5 |
| CF Q17: Brand Authenticity | A-D | 1.0x | A=1, B=2, C=4, D=5 |
| CF Q18: Secret Hope | Open text | 0x | Not scored, used qualitatively |

### CF Q1 Special Scoring (Natural Gifts):
```javascript
const scoreNaturalGifts = (selections) => {
  // selections = array of 3 selected gifts
  const count = selections.length;
  
  // 3 gifts selected = clear self-awareness = 5
  // 2 gifts = moderate clarity = 3.5
  // 1 gift = unclear = 2
  // 0 gifts = no self-awareness = 1
  
  if (count === 3) return 5;
  if (count === 2) return 3.5;
  if (count === 1) return 2;
  return 1;
};
```

### CF Q10 Special Scoring (Content Areas):
```javascript
const scoreContentAreas = (ranking) => {
  // ranking = array of 8 topics in ranked order
  // Score based on clarity of top 3
  
  // If top 3 are clearly defined (not all same rank), score higher
  // This is more about self-awareness than the actual topics
  
  const hasTopThree = ranking.length >= 3;
  
  if (hasTopThree) return 5; // Clear priorities
  if (ranking.length === 2) return 3; // Some clarity
  if (ranking.length === 1) return 2; // Vague
  return 1; // No clarity
};
```

### CF Q14 Special Scoring (Creative Blocks - INVERSE):
```javascript
const scoreCreativeBlocks = (selections) => {
  // selections = array of selected blocks
  // INVERSE: More blocks = lower score
  
  const blockCount = selections.length;
  
  // If "Nothing - I create consistently" selected
  if (selections.includes('Nothing')) return 5;
  
  // Otherwise, more blocks = lower score
  if (blockCount === 0) return 5; // No blocks
  if (blockCount <= 2) return 4; // Few blocks
  if (blockCount <= 4) return 3; // Moderate blocks
  if (blockCount <= 6) return 2; // Many blocks
  return 1; // All blocks selected (7+)
};
```

### Scoring Algorithm:
```javascript
const calculateCreativeFlowScore = (answers) => {
  const weightedScores = [
    { score: scoreNaturalGifts(answers.CF_Q1_selections), weight: 1.0 },
    { score: convertToScale(answers.CF_Q3, 'A-D'), weight: 1.0 },
    { score: convertToScale(answers.CF_Q4, 'A-D'), weight: 1.0 },
    { score: convertToScale(answers.CF_Q5, 'A-D'), weight: 1.5 },
    { score: convertToScale(answers.CF_Q6, 'A-D'), weight: 1.0 },
    { score: convertToScale(answers.CF_Q7, 'A-D'), weight: 1.5 },
    { score: convertToScale(answers.CF_Q8, '1-5'), weight: 1.0 },
    { score: convertToScale(answers.CF_Q9, 'A-D'), weight: 1.0 },
    { score: scoreContentAreas(answers.CF_Q10_ranking), weight: 1.0 },
    { score: convertToScale(answers.CF_Q11, 'A-D'), weight: 1.0 },
    { score: convertToScale(answers.CF_Q12, 'A-D'), weight: 1.0 },
    { score: convertToScale(answers.CF_Q13, 'A-D'), weight: 1.5 },
    { score: scoreCreativeBlocks(answers.CF_Q14_selections), weight: 1.0 },
    { score: convertToScale(answers.CF_Q15, 'A-D'), weight: 1.0 },
    { score: convertToScale(answers.CF_Q16, 'A-D'), weight: 1.5 },
    { score: convertToScale(answers.CF_Q17, 'A-D'), weight: 1.0 },
  ];
  
  const totalWeight = weightedScores.reduce((sum, item) => sum + item.weight, 0);
  const weightedSum = weightedScores.reduce((sum, item) => sum + (item.score * item.weight), 0);
  
  return parseFloat((weightedSum / totalWeight).toFixed(1));
};
```

### Qualitative Bands:
```javascript
const getCreativeFlowBand = (score) => {
  if (score >= 4.5) return 'Resonant Creator';
  if (score >= 3.5) return 'Developing Artist';
  if (score >= 2.5) return 'Inconsistent Creator';
  if (score >= 1.5) return 'Blocked Creative';
  return 'Creative Crisis';
};
```

---

## USER MESS LEVEL (From Pillar Average)
```javascript
const calculateUserMessLevel = (pillarScores) => {
  const { presence, digitalSelf, relationships, creativeFlow } = pillarScores;
  
  const average = (presence + digitalSelf + relationships + creativeFlow) / 4;
  
  if (average >= 4.0) return { level: 'Dialed In', stars: 4 };
  if (average >= 3.0) return { level: 'Controlled Chaos', stars: 3 };
  if (average >= 2.0) return { level: 'Hot Mess', stars: 2 };
  return { level: 'Dumpster Fire', stars: 1 };
};
```

---

## BUSINESS SCORES (0-100 Scale)

### Offer Clarity Score (0-100)
```javascript
const calculateOfferClarityScore = (data) => {
  let score = 0;
  
  // Component 1: Elevator Pitch Clarity (25 points)
  const pitchAnalysis = analyzeElevatorPitch(data.signup_Q2);
  score += pitchAnalysis.clarityScore; // AI determines 0-25
  
  // Component 2: Offer Coherence (20 points)
  const offerCoherence = analyzeOfferPortfolio(data.BD_Q3);
  score += offerCoherence.coherenceScore; // AI determines 0-20
  
  // Component 3: Perception Alignment (20 points)
  const perceptionGap = analyzePerceptionGap(data.BD_Q8);
  score += perceptionGap.alignmentScore; // AI determines 0-20
  
  // Component 4: Audience Understanding (15 points)
  const audienceAlign = analyzeAudienceAlignment(data.BD_Q9);
  score += audienceAlign.understandingScore; // AI determines 0-15
  
  // Component 5: Unique Value (10 points)
  const uvpAnalysis = analyzeUniqueValue(data.BD_Q12);
  score += uvpAnalysis.uniquenessScore; // AI determines 0-10
  
  // Component 6: Communication Effectiveness (10 points)
  const commScore = convertToScale(data.R_Q5, 'A-D'); // 1-5 scale
  score += (commScore / 5) * 10; // Convert to 0-10
  
  return Math.round(score); // 0-100
};
```

---

### Dark Funnel Readiness Score (0-100)
```javascript
const calculateDarkFunnelScore = (data) => {
  let score = 0;
  
  // Component 1: Platform Coverage (15 points)
  const platformAnalysis = analyzePlatformCoverage(data.signup_Q8, data.BD_Q2);
  score += platformAnalysis.coverageScore; // AI determines 0-15
  
  // Component 2: Profile Quality (20 points)
  const profileQuality = analyzeProfileQuality(data.BD_Q2);
  score += profileQuality.qualityScore; // AI determines 0-20
  
  // Component 3: Website Clarity (25 points)
  const websiteAnalysis = analyzeWebsite(data.BD_Q4);
  score += websiteAnalysis.clarityScore; // AI determines 0-25
  
  // Component 4: Content Voice (25 points)
  const contentAnalysis = analyzeContentSamples(data.BD_Q5);
  score += contentAnalysis.voiceScore; // AI determines 0-25
  
  // Component 5: Discoverability (10 points)
  const seoAnalysis = analyzeSEO(data.BD_Q2, data.BD_Q4, data.BD_Q9);
  score += seoAnalysis.discoverabilityScore; // AI determines 0-10
  
  // Component 6: Content Leverage (5 points)
  const leverageScore = convertToScale(data.DS_Q17, 'A-D'); // 1-5 scale
  score += leverageScore; // Direct mapping to 0-5 points
  
  return Math.round(score); // 0-100
};
```

---

### Systems Sophistication Score (0-100)
```javascript
const calculateSystemsScore = (data) => {
  let score = 0;
  
  // Component 1: Foundation (25 points)
  const fileOrgScore = convertToScale(data.DS_Q1, '1-5'); // 1-5
  score += (fileOrgScore / 5) * 10; // 0-10 points
  
  const resilienceScore = convertToScale(data.DS_Q8, 'A-D'); // 1-5
  score += (resilienceScore / 5) * 15; // 0-15 points
  
  // Component 2: Automation (30 points)
  const automationScore = convertToScale(data.DS_Q8_5, 'A-D'); // 1-5
  score += (automationScore / 5) * 15; // 0-15 points
  
  const aiIntegrationScore = convertToScale(data.DS_Q6, 'A-D'); // 1-5
  score += (aiIntegrationScore / 5) * 10; // 0-10 points
  
  const leverageScore = convertToScale(data.DS_Q17, 'A-D'); // 1-5
  score += (leverageScore / 5) * 5; // 0-5 points
  
  // Component 3: Performance Management (20 points)
  const monitoringScore = convertToScale(data.DS_Q9, 'A-D'); // 1-5
  score += (monitoringScore / 5) * 10; // 0-10 points
  
  const leadTracking = analyzeLeadTracking(data.BD_Q10);
  score += leadTracking.trackingScore; // AI determines 0-10
  
  // Component 4: Tool Stack (15 points)
  const toolScore = convertToScale(data.DS_Q4, 'A-D'); // 1-5
  score += (toolScore / 5) * 15; // 0-15 points
  
  // Component 5: Resilience (10 points)
  const volatilityScore = convertToScale(data.P_Q11, 'A-D'); // 1-5
  score += (volatilityScore / 5) * 5; // 0-5 points
  
  const businessResilienceScore = convertToScale(data.DS_Q8, 'A-D'); // 1-5
  score += (businessResilienceScore / 5) * 5; // 0-5 points
  
  return Math.round(score); // 0-100
};
```

---

## CREATOR ECONOMY READINESS SCORE (0-100)
```javascript
const calculateReadinessScore = (pillarScores, businessScores) => {
  // User Score (from pillars, convert to 0-100)
  const userScore = ((pillarScores.presence + pillarScores.digitalSelf + 
                      pillarScores.relationships + pillarScores.creativeFlow) / 4 / 5) * 100;
  
  // Business Score (average of business scores)
  const businessScore = (businessScores.offerClarity + businessScores.darkFunnel + 
                         businessScores.systems) / 3;
  
  // Weighted formula: User 60%, Business 40%
  const readinessScore = (userScore * 0.6) + (businessScore * 0.4);
  
  return Math.round(readinessScore); // 0-100
};

const getReadinessBand = (score) => {
  if (score >= 90) return 'Elite Creator';
  if (score >= 75) return 'Growth Stage';
  if (score >= 60) return 'Building Stage';
  if (score >= 40) return 'Startup Stage';
  if (score >= 20) return 'Struggling';
  return 'Crisis Mode';
};
```

---

## COMPLETE SCORING FUNCTION
```javascript
const generateAllScores = (answers) => {
  // Calculate pillar scores
  const presence = calculatePresenceScore(answers);
  const digitalSelf = calculateDigitalSelfScore(answers);
  const relationships = calculateRelationshipsScore(answers);
  const creativeFlow = calculateCreativeFlowScore(answers);
  
  const pillarScores = { presence, digitalSelf, relationships, creativeFlow };
  
  // Calculate mess level
  const messLevel = calculateUserMessLevel(pillarScores);
  
  // Calculate business scores (require AI analysis for some components)
  const offerClarity = calculateOfferClarityScore(answers);
  const darkFunnel = calculateDarkFunnelScore(answers);
  const systems = calculateSystemsScore(answers);
  
  const businessScores = { offerClarity, darkFunnel, systems };
  
  // Calculate overall readiness
  const readinessScore = calculateReadinessScore(pillarScores, businessScores);
  
  return {
    pillarScores: {
      presence: { score: presence, band: getPresenceBand(presence) },
      digitalSelf: { score: digitalSelf, band: getDigitalSelfBand(digitalSelf) },
      relationships: { score: relationships, band: getRelationshipsBand(relationships) },
      creativeFlow: { score: creativeFlow, band: getCreativeFlowBand(creativeFlow) },
    },
    messLevel,
    businessScores: {
      offerClarity: { score: offerClarity },
      darkFunnel: { score: darkFunnel },
      systems: { score: systems },
    },
    readinessScore: { score: readinessScore, band: getReadinessBand(readinessScore) },
  };
};
```

---

## NOTES ON AI-ASSISTED SCORING

Some components require AI analysis (marked as "AI determines"):
- Elevator pitch clarity
- Offer portfolio coherence
- Website clarity
- Content voice consistency
- Platform quality
- Lead tracking sophistication

These should be evaluated by Claude API during report generation based on:
- Text analysis of open-ended responses
- File content analysis (website, content samples)
- Pattern recognition across multiple inputs

The AI should return numerical scores (e.g., 0-25 for elevator pitch) that get summed into the final business scores.
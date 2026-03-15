# DATABASE SCHEMA
## Supabase Tables & JSONB Structures for Paid Diagnostic

---

## TABLE 1: `user_profiles`

**Purpose:** Store signup profile data (10 questions collected at account creation)

**Schema:**
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  business_models JSONB, -- Array of ranked business models
  elevator_pitch TEXT,
  team_size TEXT,
  working_style TEXT,
  monthly_revenue TEXT,
  hours_per_week TEXT,
  monthly_budget TEXT,
  platforms JSONB, -- Array of platforms in ranked order
  biggest_constraint TEXT,
  primary_goal TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
```

**Example Row:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "business_models": ["Service provider", "Content creator"],
  "elevator_pitch": "I help solopreneurs build AI-powered systems for $5K-10K MRR businesses because they're drowning in manual work",
  "team_size": "Solo",
  "working_style": "Mix of both",
  "monthly_revenue": "$5K-10K",
  "hours_per_week": "10-20",
  "monthly_budget": "$500-1K",
  "platforms": ["LinkedIn", "Website", "Email list", "Instagram"],
  "biggest_constraint": "Time",
  "primary_goal": "Improve systems",
  "created_at": "2026-03-15T12:00:00Z",
  "updated_at": "2026-03-15T12:00:00Z"
}
```

---

## TABLE 2: `paid_diagnostics`

**Purpose:** Store all paid diagnostic data, responses, scores, and generated report

**Schema:**
```sql
CREATE TABLE paid_diagnostics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  amount_paid INTEGER DEFAULT 4700, -- $47.00 in cents
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  
  -- Business Deep Dive Data (15 inputs)
  business_deep_dive JSONB,
  
  -- Pillar Assessment Data (58 questions)
  pillar_responses JSONB,
  
  -- Calculated Scores
  scores JSONB,
  
  -- Generated Report Content
  report_data JSONB,
  
  -- Support Recommendations (for future matching)
  support_recommendations JSONB,
  
  -- PDF & Delivery
  report_pdf_url TEXT,
  email_sent_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_paid_diagnostics_email ON paid_diagnostics(email);
CREATE INDEX idx_paid_diagnostics_stripe_session ON paid_diagnostics(stripe_session_id);
CREATE INDEX idx_paid_diagnostics_status ON paid_diagnostics(status);
```

---

### **JSONB Field Structures:**

#### **business_deep_dive:**
```json
{
  "BD_Q1_client_journey": "They find me through LinkedIn, pay via Stripe after discovery call, get 30-day onboarding with weekly check-ins",
  "BD_Q2_online_profiles": "linkedin.com/in/johndoe - main lead gen, performing well\ntwitter.com/johndoe - thought leadership, low engagement",
  "BD_Q3_top_products": [
    "30-day systems sprint ($7K)",
    "Monthly coaching ($2K/mo)",
    "DIY course ($297)"
  ],
  "BD_Q4_website_url": "https://example.com",
  "BD_Q4_website_file": "uploads/diagnostic_123/website.pdf",
  "BD_Q5_content_samples": [
    "uploads/diagnostic_123/sample1.pdf",
    "https://linkedin.com/posts/johndoe/12345"
  ],
  "BD_Q6_competitors": [
    "CompetitorA - competitora.com",
    "CompetitorB - competitorb.com"
  ],
  "BD_Q7_competitor_feedback": "CompetitorA has great branding but vague positioning. CompetitorB is too expensive.",
  "BD_Q8_perception_gap": "I think people see me as technical consultant, but they actually think I'm just a coder",
  "BD_Q9_audience_search": {
    "searches": ["AI automation for small business", "no-code tools"],
    "needs": ["Save time on repetitive tasks", "Scale without hiring"],
    "help": ["Build custom automation workflows", "Train on AI tools"]
  },
  "BD_Q10_inbound": "~5 inquiries/month, mostly LinkedIn, 40% convert",
  "BD_Q11_cac": "~$200 (mostly time investment in content)",
  "BD_Q12_unique_value": "I don't just build the system, I teach you how to maintain it so you're not dependent on me",
  "BD_Q13_revenue_diversification": "C",
  "BD_Q15a_open_text_a": "I'm burnt out from 1:1 work and want to productize my knowledge",
  "BD_Q15b_open_text_b": "Building a creator brand where I teach AI systems to 100K+ audience while earning $50K/mo passively"
}
```

---

#### **pillar_responses:**
```json
{
  "presence": {
    "P_Q1": "C",
    "P_Q2": "C",
    "P_Q3": "C",
    "P_Q4": 4,
    "P_Q6": 3,
    "P_Q8": "C",
    "P_Q9": 4,
    "P_Q10": "C",
    "P_Q11": "C"
  },
  "digital_self": {
    "DS_Q1": 4,
    "DS_Q2": "C",
    "DS_Q3": 4,
    "DS_Q4": "C",
    "DS_Q5": "C",
    "DS_Q6": "C",
    "DS_Q7": 4,
    "DS_Q8": "C",
    "DS_Q8_5": "C",
    "DS_Q9": "C",
    "DS_Q10": "C",
    "DS_Q11": "C",
    "DS_Q12_selections": ["None"],
    "DS_Q12_followup": "D",
    "DS_Q13": "C",
    "DS_Q15": "B",
    "DS_Q16": "C",
    "DS_Q17": "C"
  },
  "relationships": {
    "R_Q1": "C",
    "R_Q2": "C",
    "R_Q3": "C",
    "R_Q4": 4,
    "R_Q5": "C",
    "R_Q6": "C",
    "R_Q7": "C",
    "R_Q9": 4,
    "R_Q10": "C",
    "R_Q11_ranking": ["Professional", "Online", "Personal", "Family"],
    "R_Q12": "C",
    "R_Q12_followup": "E",
    "R_Q13": "C",
    "R_Q14": "C",
    "R_Q16": "C",
    "R_Q17": "C",
    "R_Q17_followup": 4,
    "R_Q18": "C"
  },
  "creative_flow": {
    "CF_Q1_selections": ["Strategy / systems thinking", "Teaching / translating ideas", "Writing / storytelling"],
    "CF_Q3": "D",
    "CF_Q4": "C",
    "CF_Q5": "C",
    "CF_Q6": "C",
    "CF_Q7": "C",
    "CF_Q8": 4,
    "CF_Q9": "C",
    "CF_Q10_ranking": ["Work/entrepreneurship", "Technology/AI", "Personal growth", "Money/finance"],
    "CF_Q11": "C",
    "CF_Q12": "C",
    "CF_Q13": "C",
    "CF_Q14_selections": ["Time scarcity", "Unclear direction"],
    "CF_Q15": "C",
    "CF_Q16": "C",
    "CF_Q17": "C",
    "CF_Q18_secret_hope": "I hope AI handles all the tactical execution so I can focus purely on strategy and creative vision"
  }
}
```

---

#### **scores:**
```json
{
  "pillar_scores": {
    "presence": {
      "score": 3.8,
      "band": "Mostly Grounded"
    },
    "digital_self": {
      "score": 4.1,
      "band": "Systems Builder"
    },
    "relationships": {
      "score": 3.9,
      "band": "Relational Builder"
    },
    "creative_flow": {
      "score": 4.2,
      "band": "Developing Artist"
    }
  },
  "mess_level": {
    "level": "Controlled Chaos",
    "stars": 3,
    "average": 4.0
  },
  "business_scores": {
    "offer_clarity": {
      "score": 68,
      "components": {
        "elevator_pitch": 18,
        "offer_coherence": 14,
        "perception_alignment": 12,
        "audience_understanding": 12,
        "unique_value": 7,
        "communication": 5
      }
    },
    "dark_funnel": {
      "score": 52,
      "components": {
        "platform_coverage": 10,
        "profile_quality": 12,
        "website_clarity": 15,
        "content_voice": 8,
        "discoverability": 4,
        "leverage": 3
      }
    },
    "systems": {
      "score": 71,
      "components": {
        "foundation": 18,
        "automation": 22,
        "performance": 14,
        "tool_stack": 12,
        "resilience": 5
      }
    }
  },
  "readiness_score": {
    "score": 68,
    "band": "Building Stage",
    "user_score": 80,
    "business_score": 63.7
  }
}
```

---

#### **report_data:**

**Structure:** 17 sections, each with generated content
```json
{
  "section_1_identity": {
    "title": "Identity Deep Dive",
    "content": "Full AI-generated markdown content for this section...",
    "key_insights": [
      "Operating from mostly sovereignty with occasional survival mode triggers",
      "Natural gifts: Strategy, teaching, writing",
      "Core motivation: Impact-driven creation"
    ]
  },
  "section_2_capacity": {
    "title": "User Capacity & Constraints",
    "content": "Full AI-generated markdown content...",
    "key_insights": [
      "10-20 hours/week available",
      "$500-1K/month budget",
      "Primary constraint: Time (not money or skills)"
    ]
  },
  "section_3_strengths": {
    "title": "User Strengths & Natural Tendencies",
    "content": "Full AI-generated markdown content...",
    "key_insights": []
  },
  "section_4_beliefs": {
    "title": "User Beliefs & Habits",
    "content": "Full AI-generated markdown content...",
    "key_insights": []
  },
  "section_5_pillar_scores": {
    "title": "4 Pillar Scores + Mess Level + Readiness",
    "content": "Full AI-generated markdown content...",
    "key_insights": []
  },
  "section_6_offer_clarity": {
    "title": "Offer Clarity Assessment",
    "content": "Full AI-generated markdown content...",
    "key_insights": []
  },
  "section_7_dark_funnel": {
    "title": "Online Presence & Brand",
    "content": "Full AI-generated markdown content...",
    "key_insights": []
  },
  "section_8_content_messaging": {
    "title": "Content & Messaging",
    "content": "Full AI-generated markdown content...",
    "word_cloud_data": {
      "words": [
        { "text": "automation", "value": 45 },
        { "text": "AI", "value": 38 },
        { "text": "systems", "value": 32 }
      ],
      "themes": [
        {
          "name": "AI & Automation",
          "percentage": 35,
          "keywords": ["AI", "automation", "workflows"]
        }
      ]
    },
    "key_insights": []
  },
  "section_9_systems": {
    "title": "Systems & Operations",
    "content": "Full AI-generated markdown content...",
    "key_insights": []
  },
  "section_10_competitive": {
    "title": "Competitive Positioning",
    "content": "Full AI-generated markdown content...",
    "key_insights": []
  },
  "section_11_gap_analysis": {
    "title": "Gap Analysis",
    "content": "Full AI-generated markdown content...",
    "key_insights": []
  },
  "section_12_leverage_map": {
    "title": "Leverage Map",
    "content": "Full AI-generated markdown content...",
    "leverage_opportunities": [
      {
        "name": "AI Systems Course",
        "roi": "high",
        "effort": "medium",
        "timeline": "30 days"
      }
    ],
    "key_insights": []
  },
  "section_13_bottleneck": {
    "title": "Bottleneck Diagnosis",
    "content": "Full AI-generated markdown content...",
    "primary_bottleneck": {
      "type": "Business",
      "specific": "Weak dark funnel - people can't find you"
    },
    "key_insights": []
  },
  "section_14_support": {
    "title": "Support Systems Blueprint",
    "content": "Full AI-generated markdown content...",
    "key_insights": []
  },
  "section_15_roadmap": {
    "title": "Integrated Growth Roadmap",
    "content": "Full AI-generated markdown content...",
    "action_plan_30_day": {
      "week_1": [],
      "week_2": [],
      "week_3": [],
      "week_4": []
    },
    "key_insights": []
  },
  "section_16_ai_opportunities": {
    "title": "AI & Creator Economy Opportunities",
    "content": "Full AI-generated markdown content...",
    "ai_tier": "Integrator",
    "job_market_risk": "Medium",
    "key_insights": []
  },
  "section_17_next_steps": {
    "title": "Next Steps & Recommended Support",
    "content": "Full AI-generated markdown content...",
    "key_insights": []
  },
  "generated_at": "2026-03-15T14:30:00Z",
  "word_count": 18543
}
```

---

#### **support_recommendations:**
```json
{
  "primary_bottleneck": "Business",
  "specific_bottleneck": "Dark Funnel Readiness (52/100)",
  "support_types_needed": [
    {
      "type": "expertise",
      "priority": 1,
      "reason": "Need SEO/content strategy expertise to improve discoverability",
      "examples": ["SEO consultant", "Content strategist", "Brand designer"]
    },
    {
      "type": "execution",
      "priority": 2,
      "reason": "Need help implementing content calendar and repurposing system",
      "examples": ["VA with content skills", "Social media manager", "Repurposing specialist"]
    }
  ],
  "budget_tier": "creator",
  "time_availability": "moderate",
  "hot_mess_agents": [
    {
      "agent": "seo_keyword_strategy",
      "relevance": "high",
      "reason": "Dark Funnel Score 52/100, weak discoverability"
    },
    {
      "agent": "content_calendar",
      "relevance": "high",
      "reason": "Creative consistency score 3/5, sporadic posting"
    },
    {
      "agent": "voice_amplifier",
      "relevance": "medium",
      "reason": "Content voice consistency could be stronger"
    },
    {
      "agent": "niche_finder",
      "relevance": "low",
      "reason": "Offer clarity 68/100 - decent but could refine"
    }
  ],
  "third_party_needs": [
    "SEO consultant for keyword strategy and on-page optimization",
    "Content repurposing VA (5-10 hours/week)",
    "Website redesign/optimization"
  ]
}
```

---

## TABLE 3: `purchases`

**Purpose:** Track all purchases (both paid diagnostics and future products)

**Schema:**
```sql
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id),
  email TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  product_type TEXT NOT NULL, -- 'paid_diagnostic', 'agent_waitlist', 'report_upgrade', etc.
  amount INTEGER NOT NULL, -- in cents
  status TEXT DEFAULT 'pending', -- pending, completed, refunded
  metadata JSONB, -- Additional product-specific data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_purchases_email ON purchases(email);
CREATE INDEX idx_purchases_stripe_session ON purchases(stripe_session_id);
CREATE INDEX idx_purchases_product_type ON purchases(product_type);
```

---

## TABLE 4: `user_sessions`

**Purpose:** Track user sessions (already exists, add profile_completed flag)

**Schema Update:**
```sql
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;
```

---

## STORAGE BUCKETS

### **Bucket: `diagnostic-uploads`**

**Purpose:** Store user-uploaded files (website, content samples)

**Structure:**
```
diagnostic-uploads/
├── {diagnostic_id}/
│   ├── website.pdf
│   ├── website_screenshot.png
│   ├── content_sample_1.pdf
│   ├── content_sample_2.mp4
│   └── content_sample_3_url.txt
```

**Policies:**
- Authenticated users can upload to their own diagnostic folder
- Files are private by default
- Hot Mess OS system can read all files for analysis
- Users can download their own uploads
```sql
-- Storage policy for uploads
CREATE POLICY "Users can upload to their diagnostic folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'diagnostic-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read their own uploads"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'diagnostic-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

### **Bucket: `diagnostic-reports`**

**Purpose:** Store generated PDF reports

**Structure:**
```
diagnostic-reports/
├── {diagnostic_id}/
│   └── report.pdf
```

**Policies:**
- System can write PDFs
- Users can read their own report
- Reports are private

---

## ROW LEVEL SECURITY (RLS)

**Enable RLS on all tables:**
```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE paid_diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
TO authenticated
USING (email = auth.jwt() ->> 'email');

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
TO authenticated
USING (email = auth.jwt() ->> 'email');

-- Policy: Users can read their own diagnostics
CREATE POLICY "Users can view own diagnostics"
ON paid_diagnostics FOR SELECT
TO authenticated
USING (email = auth.jwt() ->> 'email');

-- Policy: System (service role) can write diagnostics
CREATE POLICY "System can write diagnostics"
ON paid_diagnostics FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "System can update diagnostics"
ON paid_diagnostics FOR UPDATE
TO service_role
USING (true);
```

---

## HELPER FUNCTIONS

### **Function: Update `updated_at` timestamp**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_paid_diagnostics_updated_at BEFORE UPDATE ON paid_diagnostics
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## MIGRATION SCRIPT

**Run this to set up all tables:**
```sql
-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  business_models JSONB,
  elevator_pitch TEXT,
  team_size TEXT,
  working_style TEXT,
  monthly_revenue TEXT,
  hours_per_week TEXT,
  monthly_budget TEXT,
  platforms JSONB,
  biggest_constraint TEXT,
  primary_goal TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- 2. Create paid_diagnostics table
CREATE TABLE IF NOT EXISTS paid_diagnostics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  amount_paid INTEGER DEFAULT 4700,
  status TEXT DEFAULT 'pending',
  business_deep_dive JSONB,
  pillar_responses JSONB,
  scores JSONB,
  report_data JSONB,
  support_recommendations JSONB,
  report_pdf_url TEXT,
  email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_paid_diagnostics_email ON paid_diagnostics(email);
CREATE INDEX idx_paid_diagnostics_stripe_session ON paid_diagnostics(stripe_session_id);
CREATE INDEX idx_paid_diagnostics_status ON paid_diagnostics(status);

-- 3. Update user_sessions (if exists)
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- 4. Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE paid_diagnostics ENABLE ROW LEVEL SECURITY;

-- 5. Create policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT TO authenticated
USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE TO authenticated
USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Users can view own diagnostics" ON paid_diagnostics FOR SELECT TO authenticated
USING (email = auth.jwt() ->> 'email');

CREATE POLICY "System can write diagnostics" ON paid_diagnostics FOR INSERT TO service_role
WITH CHECK (true);

CREATE POLICY "System can update diagnostics" ON paid_diagnostics FOR UPDATE TO service_role
USING (true);

-- 6. Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_paid_diagnostics_updated_at BEFORE UPDATE ON paid_diagnostics
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## NOTES

- All JSONB fields allow flexible storage of complex nested data
- `support_recommendations` is saved for future matching with partners/products
- `report_data` stores the complete generated report for re-rendering
- Scores are calculated and stored separately from raw responses for quick access
- File uploads go to Storage buckets, not database (only URLs stored)
- RLS ensures users can only access their own data
- Service role (API) has full write access for system operations
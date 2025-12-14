-- Create ecommerce_wizard_submissions table
CREATE TABLE IF NOT EXISTS ecommerce_wizard_submissions (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id),
  
  -- Step 1: Goals & Vision
  business_name VARCHAR(255),
  business_goal_short TEXT,
  business_goal_long TEXT,
  revenue_target NUMERIC(15, 2),
  kpis TEXT,
  success_looks_like TEXT,
  
  -- Step 2: Strategy & Market Research
  business_type VARCHAR(100),
  target_market TEXT,
  competitors TEXT,
  market_position TEXT,
  value_proposition TEXT,
  
  -- Step 3: Platform & Setup
  platform_selected VARCHAR(100),
  account_created BOOLEAN DEFAULT false,
  branding_ready BOOLEAN DEFAULT false,
  payment_setup BOOLEAN DEFAULT false,
  shipping_setup BOOLEAN DEFAULT false,
  
  -- Step 4: Product & Alibaba Sourcing
  product_name VARCHAR(255),
  supplier_name VARCHAR(255),
  moq INTEGER,
  unit_price NUMERIC(10, 2),
  shipping_method VARCHAR(100),
  sample_ordered BOOLEAN DEFAULT false,
  
  -- Step 5: Implementation Steps (JSON array)
  implementation_steps JSONB,
  
  -- Step 6: Timeline
  start_date DATE,
  end_date DATE,
  milestones JSONB,
  
  -- Step 7: Marketing & Traffic
  marketing_channels JSONB,
  content_plan TEXT,
  funnel_description TEXT,
  
  -- Metadata
  status VARCHAR(50) DEFAULT 'in_progress',
  current_step INTEGER DEFAULT 1,
  submitted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(group_id)
);

-- Create index for faster lookups
CREATE INDEX idx_ecommerce_wizard_group_id ON ecommerce_wizard_submissions(group_id);
CREATE INDEX idx_ecommerce_wizard_status ON ecommerce_wizard_submissions(status);

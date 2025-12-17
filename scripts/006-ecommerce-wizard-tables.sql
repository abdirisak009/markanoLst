-- E-commerce Implementation Wizard Tables
-- For Business Development groups to create ecommerce business plans

-- Main wizard submissions table
CREATE TABLE IF NOT EXISTS ecommerce_wizard_submissions (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'reviewed')),
  current_step INTEGER DEFAULT 1,
  
  -- Step 1: Goals & Vision
  business_name VARCHAR(255),
  business_goal_short TEXT,
  business_goal_long TEXT,
  revenue_target VARCHAR(100),
  kpis TEXT,
  success_definition TEXT,
  
  -- Step 2: Strategy & Market Research
  business_type VARCHAR(100),
  target_market TEXT,
  competitors TEXT,
  market_position TEXT,
  value_proposition TEXT,
  
  -- Step 3: Platform & Setup
  platform_selected VARCHAR(50),
  account_created BOOLEAN DEFAULT FALSE,
  branding_ready BOOLEAN DEFAULT FALSE,
  payment_setup BOOLEAN DEFAULT FALSE,
  shipping_setup BOOLEAN DEFAULT FALSE,
  
  -- Step 4: Product & Alibaba Sourcing
  product_name VARCHAR(255),
  supplier_name VARCHAR(255),
  moq VARCHAR(50),
  unit_price DECIMAL(10,2),
  shipping_method VARCHAR(100),
  sample_ordered BOOLEAN DEFAULT FALSE,
  
  -- Step 6: Timeline
  start_date DATE,
  end_date DATE,
  
  -- Step 7: Marketing & Traffic
  marketing_channels TEXT[], -- Array of selected channels
  content_plan TEXT,
  funnel_description TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP,
  
  UNIQUE(group_id)
);

-- Step 5: Implementation Steps (dynamic list)
CREATE TABLE IF NOT EXISTS ecommerce_implementation_steps (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER NOT NULL REFERENCES ecommerce_wizard_submissions(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Step 6: Milestones (for timeline)
CREATE TABLE IF NOT EXISTS ecommerce_milestones (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER NOT NULL REFERENCES ecommerce_wizard_submissions(id) ON DELETE CASCADE,
  milestone_title VARCHAR(255) NOT NULL,
  milestone_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wizard_group_id ON ecommerce_wizard_submissions(group_id);
CREATE INDEX IF NOT EXISTS idx_wizard_status ON ecommerce_wizard_submissions(status);
CREATE INDEX IF NOT EXISTS idx_impl_steps_submission ON ecommerce_implementation_steps(submission_id);
CREATE INDEX IF NOT EXISTS idx_milestones_submission ON ecommerce_milestones(submission_id);

-- Insert sample data for testing
INSERT INTO ecommerce_wizard_submissions (
  group_id, status, current_step, business_name, business_goal_short, 
  revenue_target, platform_selected, product_name
) 
SELECT 
  g.id,
  CASE WHEN random() > 0.5 THEN 'submitted' ELSE 'in_progress' END,
  CASE WHEN random() > 0.5 THEN 8 ELSE floor(random() * 7 + 1)::int END,
  'TechStore ' || g.name,
  'Launch successful ecommerce business',
  '$' || (floor(random() * 50 + 10) * 1000)::text,
  CASE floor(random() * 4)::int 
    WHEN 0 THEN 'Shopify'
    WHEN 1 THEN 'Amazon'
    WHEN 2 THEN 'Alibaba'
    ELSE 'Website'
  END,
  CASE floor(random() * 5)::int 
    WHEN 0 THEN 'Smart Watch'
    WHEN 1 THEN 'Wireless Earbuds'
    WHEN 2 THEN 'Phone Cases'
    WHEN 3 THEN 'LED Lights'
    ELSE 'Laptop Stand'
  END
FROM groups g
LIMIT 10
ON CONFLICT (group_id) DO NOTHING;

-- Create forum categories table
CREATE TABLE IF NOT EXISTS forum_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(20) DEFAULT '#e63946',
  icon VARCHAR(50) DEFAULT 'folder',
  topics_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create forum topics table
CREATE TABLE IF NOT EXISTS forum_topics (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES forum_categories(id) ON DELETE CASCADE,
  author_id VARCHAR(50) NOT NULL,
  author_type VARCHAR(20) DEFAULT 'student', -- 'student', 'admin', 'teacher'
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  is_solved BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  last_reply_at TIMESTAMP,
  last_reply_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create forum replies table
CREATE TABLE IF NOT EXISTS forum_replies (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER REFERENCES forum_topics(id) ON DELETE CASCADE,
  author_id VARCHAR(50) NOT NULL,
  author_type VARCHAR(20) DEFAULT 'student',
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create forum topic participants (users who replied)
CREATE TABLE IF NOT EXISTS forum_topic_participants (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER REFERENCES forum_topics(id) ON DELETE CASCADE,
  user_id VARCHAR(50) NOT NULL,
  user_type VARCHAR(20) DEFAULT 'student',
  participated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(topic_id, user_id)
);

-- Insert default forum categories
INSERT INTO forum_categories (name, slug, description, color, icon) VALUES
('General Discussion', 'general', 'General conversations and announcements', '#6366f1', 'message-circle'),
('HTML & CSS', 'html-css', 'Questions about HTML and CSS', '#f97316', 'code'),
('JavaScript', 'javascript', 'JavaScript programming questions', '#eab308', 'file-code'),
('React & Next.js', 'react-nextjs', 'React and Next.js framework discussions', '#22d3ee', 'component'),
('Python', 'python', 'Python programming help', '#22c55e', 'terminal'),
('Database & SQL', 'database-sql', 'Database design and SQL queries', '#ec4899', 'database'),
('Cybersecurity', 'cybersecurity', 'Security topics and discussions', '#ef4444', 'shield'),
('Career & Jobs', 'career', 'Career advice and job opportunities', '#8b5cf6', 'briefcase')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample topics
INSERT INTO forum_topics (category_id, author_id, author_type, title, content, views, replies_count, is_pinned, created_at) VALUES
(1, 'admin', 'admin', 'Welcome to Markano Forum!', 'This community is for Markano students to ask questions, share knowledge, and help each other succeed. Please be respectful and follow our community guidelines.', 1250, 5, true, NOW() - INTERVAL '30 days'),
(2, '137606', 'student', 'How to center a div in CSS?', 'I''ve been trying different methods but nothing seems to work. Can someone explain the best way to center elements?', 342, 8, false, NOW() - INTERVAL '2 hours'),
(3, '137606', 'student', 'Understanding async/await in JavaScript', 'Can someone explain how async/await works? I''m confused about promises.', 156, 3, false, NOW() - INTERVAL '5 hours'),
(4, '137606', 'student', 'Best practices for Next.js App Router', 'What are the recommended patterns for organizing routes in Next.js 14?', 89, 2, false, NOW() - INTERVAL '1 day'),
(6, '137606', 'student', 'SQL JOIN query not working', 'My LEFT JOIN is returning unexpected results. Here is my query...', 234, 6, false, NOW() - INTERVAL '20 hours'),
(7, '137606', 'student', 'How to secure API endpoints?', 'What are the best practices for securing REST APIs against common attacks?', 567, 12, false, NOW() - INTERVAL '3 days'),
(5, '137606', 'student', 'Python list comprehension help', 'I need help understanding when to use list comprehensions vs regular loops.', 123, 4, false, NOW() - INTERVAL '4 days'),
(8, '137606', 'student', 'Tips for tech interviews?', 'I have an interview next week. Any advice on how to prepare?', 890, 15, false, NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_topics_category ON forum_topics(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_author ON forum_topics(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_topic ON forum_replies(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_created ON forum_topics(created_at DESC);

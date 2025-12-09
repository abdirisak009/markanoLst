-- Insert default admin user (password: admin123)
INSERT INTO admin_users (username, password, role) 
VALUES ('admin', 'admin123', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert sample universities
INSERT INTO universities (name, abbreviation) VALUES
('Somali International University', 'SIU'),
('SIMAD University', 'SIMAD'),
('Mogadishu University', 'MU'),
('Somalia National University', 'UNISO')
ON CONFLICT DO NOTHING;

-- Insert sample classes
INSERT INTO classes (name, type, university_id, description) VALUES
('CMS5E', 'university', 1, 'Semester 1-A-FullTime'),
('CMS5D', 'university', 1, 'Semester 2-B'),
('CMS5C', 'university', 1, 'N/A'),
('CMS5B', 'university', 1, 'N/A'),
('CMS5A', 'university', 1, 'N/A'),
('CMSAPT', 'university', 1, 'N/A'),
('CMS3E', 'university', 1, 'N/A'),
('CMS3C', 'university', 1, 'adscffs'),
('CMS3D', 'university', 1, 'Semester 3aad ee Jamacada SIU')
ON CONFLICT DO NOTHING;

-- Insert sample courses
INSERT INTO courses (title, description, instructor, duration, thumbnail, rating, students_count, type) VALUES
('HTML & CSS Basics', 'Barashada aasaaska dhisiida websites-ka', 'Abdirisaq Mohamed Yusuf', '4 hours', '/placeholder.svg?height=200&width=300', 4.8, 1234, 'university'),
('JavaScript Fundamentals', 'Learn the core concepts of JavaScript programming', 'Fatima Hassan', '6 hours', '/placeholder.svg?height=200&width=300', 4.7, 2156, 'university'),
('Python Programming', 'Master Python from basics to advanced', 'Mohamed Omar', '8 hours', '/placeholder.svg?height=200&width=300', 4.9, 1876, 'university'),
('React Development', 'Build modern web applications with React', 'Ahmed Ali', '10 hours', '/placeholder.svg?height=200&width=300', 4.6, 1543, 'university'),
('Node.js Backend', 'Create scalable backend applications', 'Aisha Abdi', '7 hours', '/placeholder.svg?height=200&width=300', 4.5, 987, 'university'),
('Database Design', 'Learn SQL and database management', 'Hassan Mohamed', '5 hours', '/placeholder.svg?height=200&width=300', 4.7, 1654, 'university')
ON CONFLICT DO NOTHING;

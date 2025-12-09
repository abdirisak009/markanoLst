// Course and student data structure for localStorage

export interface Lesson {
  id: string
  title: string
  duration: string
  videoUrl: string
  transcript: string
  completed: boolean
}

export interface Module {
  id: string
  title: string
  lessons: Lesson[]
}

export interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: string
  lessonsCount: number
  rating: number
  modules: Module[]
}

export interface Student {
  id: string
  fullName: string
  email: string
  phone: string
  course: string
  startDate: string
  progress: number
  completedLessons: string[]
}

export interface AdminUser {
  username: string
  password: string
}

// Sample courses data
export const sampleCourses: Course[] = [
  {
    id: "html-css-basics",
    title: "HTML & CSS Basics",
    description:
      "Master the fundamentals of web development with HTML and CSS. Build beautiful, responsive websites from scratch.",
    thumbnail: "/html-css-coding-screen.jpg",
    duration: "8 hours",
    lessonsCount: 12,
    rating: 4.8,
    modules: [
      {
        id: "module-1",
        title: "Getting Started with HTML",
        lessons: [
          {
            id: "lesson-1-1",
            title: "Introduction to HTML",
            duration: "15:00",
            videoUrl: "https://www.youtube.com/embed/qz0aGYrrlhU",
            transcript: "Welcome to HTML basics. HTML stands for HyperText Markup Language...",
            completed: false,
          },
          {
            id: "lesson-1-2",
            title: "HTML Elements and Tags",
            duration: "20:00",
            videoUrl: "https://www.youtube.com/embed/qz0aGYrrlhU",
            transcript: "In this lesson, we'll explore HTML elements and how tags work...",
            completed: false,
          },
          {
            id: "lesson-1-3",
            title: "HTML Attributes",
            duration: "18:00",
            videoUrl: "https://www.youtube.com/embed/qz0aGYrrlhU",
            transcript: "HTML attributes provide additional information about elements...",
            completed: false,
          },
          {
            id: "lesson-1-4",
            title: "Semantic HTML",
            duration: "22:00",
            videoUrl: "https://www.youtube.com/embed/qz0aGYrrlhU",
            transcript: "Semantic HTML helps make your code more meaningful and accessible...",
            completed: false,
          },
        ],
      },
      {
        id: "module-2",
        title: "Styling with CSS",
        lessons: [
          {
            id: "lesson-2-1",
            title: "Introduction to CSS",
            duration: "18:00",
            videoUrl: "https://www.youtube.com/embed/qz0aGYrrlhU",
            transcript: "CSS stands for Cascading Style Sheets and controls the visual presentation...",
            completed: false,
          },
          {
            id: "lesson-2-2",
            title: "CSS Selectors",
            duration: "25:00",
            videoUrl: "https://www.youtube.com/embed/qz0aGYrrlhU",
            transcript: "CSS selectors allow you to target specific HTML elements for styling...",
            completed: false,
          },
          {
            id: "lesson-2-3",
            title: "The Box Model",
            duration: "20:00",
            videoUrl: "https://www.youtube.com/embed/qz0aGYrrlhU",
            transcript: "Understanding the CSS box model is crucial for layout design...",
            completed: false,
          },
          {
            id: "lesson-2-4",
            title: "Flexbox Layout",
            duration: "28:00",
            videoUrl: "https://www.youtube.com/embed/qz0aGYrrlhU",
            transcript: "Flexbox provides a powerful way to create flexible layouts...",
            completed: false,
          },
        ],
      },
      {
        id: "module-3",
        title: "Responsive Design",
        lessons: [
          {
            id: "lesson-3-1",
            title: "Media Queries",
            duration: "22:00",
            videoUrl: "https://www.youtube.com/embed/qz0aGYrrlhU",
            transcript: "Media queries allow you to apply styles based on device characteristics...",
            completed: false,
          },
          {
            id: "lesson-3-2",
            title: "Mobile-First Design",
            duration: "20:00",
            videoUrl: "https://www.youtube.com/embed/qz0aGYrrlhU",
            transcript: "Mobile-first design starts with mobile layouts and scales up...",
            completed: false,
          },
          {
            id: "lesson-3-3",
            title: "CSS Grid",
            duration: "26:00",
            videoUrl: "https://www.youtube.com/embed/qz0aGYrrlhU",
            transcript: "CSS Grid is a powerful two-dimensional layout system...",
            completed: false,
          },
          {
            id: "lesson-3-4",
            title: "Building a Responsive Portfolio",
            duration: "35:00",
            videoUrl: "https://www.youtube.com/embed/qz0aGYrrlhU",
            transcript: "Let's put everything together and build a complete responsive portfolio...",
            completed: false,
          },
        ],
      },
    ],
  },
  {
    id: "javascript-fundamentals",
    title: "JavaScript Fundamentals",
    description:
      "Learn JavaScript from basics to advanced concepts. Build interactive web applications with modern JavaScript.",
    thumbnail: "/javascript-code-laptop.jpg",
    duration: "12 hours",
    lessonsCount: 15,
    rating: 4.9,
    modules: [
      {
        id: "module-1",
        title: "JavaScript Basics",
        lessons: [
          {
            id: "lesson-1-1",
            title: "Variables and Data Types",
            duration: "20:00",
            videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
            transcript: "JavaScript variables can hold different types of data...",
            completed: false,
          },
          {
            id: "lesson-1-2",
            title: "Operators and Expressions",
            duration: "18:00",
            videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
            transcript: "Operators allow you to perform operations on values...",
            completed: false,
          },
          {
            id: "lesson-1-3",
            title: "Control Flow",
            duration: "25:00",
            videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
            transcript: "Control flow statements determine the execution path of your code...",
            completed: false,
          },
          {
            id: "lesson-1-4",
            title: "Functions",
            duration: "30:00",
            videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
            transcript: "Functions are reusable blocks of code that perform specific tasks...",
            completed: false,
          },
        ],
      },
      {
        id: "module-2",
        title: "Working with Arrays and Objects",
        lessons: [
          {
            id: "lesson-2-1",
            title: "Array Methods",
            duration: "28:00",
            videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
            transcript: "JavaScript arrays come with powerful built-in methods...",
            completed: false,
          },
          {
            id: "lesson-2-2",
            title: "Object Basics",
            duration: "22:00",
            videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
            transcript: "Objects store collections of key-value pairs...",
            completed: false,
          },
          {
            id: "lesson-2-3",
            title: "JSON and Data Handling",
            duration: "20:00",
            videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
            transcript: "JSON is a lightweight data format for storing and transferring data...",
            completed: false,
          },
          {
            id: "lesson-2-4",
            title: "Destructuring and Spread",
            duration: "24:00",
            videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
            transcript: "Modern JavaScript provides elegant ways to work with data structures...",
            completed: false,
          },
        ],
      },
      {
        id: "module-3",
        title: "DOM Manipulation",
        lessons: [
          {
            id: "lesson-3-1",
            title: "Selecting Elements",
            duration: "18:00",
            videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
            transcript: "The DOM API provides methods to select and manipulate HTML elements...",
            completed: false,
          },
          {
            id: "lesson-3-2",
            title: "Event Handling",
            duration: "26:00",
            videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
            transcript: "Events allow JavaScript to respond to user interactions...",
            completed: false,
          },
          {
            id: "lesson-3-3",
            title: "Dynamic Content",
            duration: "22:00",
            videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
            transcript: "Learn how to dynamically create and modify page content...",
            completed: false,
          },
        ],
      },
      {
        id: "module-4",
        title: "Asynchronous JavaScript",
        lessons: [
          {
            id: "lesson-4-1",
            title: "Callbacks and Promises",
            duration: "30:00",
            videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
            transcript: "Asynchronous operations allow code to run without blocking...",
            completed: false,
          },
          {
            id: "lesson-4-2",
            title: "Async/Await",
            duration: "25:00",
            videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
            transcript: "Async/await provides cleaner syntax for handling promises...",
            completed: false,
          },
          {
            id: "lesson-4-3",
            title: "Fetch API",
            duration: "28:00",
            videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
            transcript: "The Fetch API provides an interface for making HTTP requests...",
            completed: false,
          },
        ],
      },
    ],
  },
  {
    id: "python-programming",
    title: "Python Programming",
    description:
      "Start your programming journey with Python. Learn programming fundamentals and build real-world projects.",
    thumbnail: "/python-programming-code.jpg",
    duration: "10 hours",
    lessonsCount: 13,
    rating: 4.7,
    modules: [
      {
        id: "module-1",
        title: "Python Basics",
        lessons: [
          {
            id: "lesson-1-1",
            title: "Getting Started with Python",
            duration: "15:00",
            videoUrl: "https://www.youtube.com/embed/_uQrJ0TkZlc",
            transcript: "Python is a versatile, beginner-friendly programming language...",
            completed: false,
          },
          {
            id: "lesson-1-2",
            title: "Variables and Data Types",
            duration: "22:00",
            videoUrl: "https://www.youtube.com/embed/_uQrJ0TkZlc",
            transcript: "Python has several built-in data types for different kinds of data...",
            completed: false,
          },
          {
            id: "lesson-1-3",
            title: "Operators and Expressions",
            duration: "20:00",
            videoUrl: "https://www.youtube.com/embed/_uQrJ0TkZlc",
            transcript: "Learn how to perform operations on data in Python...",
            completed: false,
          },
          {
            id: "lesson-1-4",
            title: "Control Structures",
            duration: "25:00",
            videoUrl: "https://www.youtube.com/embed/_uQrJ0TkZlc",
            transcript: "Control structures allow you to control the flow of your program...",
            completed: false,
          },
        ],
      },
      {
        id: "module-2",
        title: "Data Structures",
        lessons: [
          {
            id: "lesson-2-1",
            title: "Lists and Tuples",
            duration: "28:00",
            videoUrl: "https://www.youtube.com/embed/_uQrJ0TkZlc",
            transcript: "Lists and tuples are fundamental data structures in Python...",
            completed: false,
          },
          {
            id: "lesson-2-2",
            title: "Dictionaries and Sets",
            duration: "26:00",
            videoUrl: "https://www.youtube.com/embed/_uQrJ0TkZlc",
            transcript: "Dictionaries store key-value pairs while sets store unique values...",
            completed: false,
          },
          {
            id: "lesson-2-3",
            title: "String Manipulation",
            duration: "20:00",
            videoUrl: "https://www.youtube.com/embed/_uQrJ0TkZlc",
            transcript: "Python provides powerful tools for working with text...",
            completed: false,
          },
        ],
      },
      {
        id: "module-3",
        title: "Functions and Modules",
        lessons: [
          {
            id: "lesson-3-1",
            title: "Defining Functions",
            duration: "24:00",
            videoUrl: "https://www.youtube.com/embed/_uQrJ0TkZlc",
            transcript: "Functions help organize code into reusable blocks...",
            completed: false,
          },
          {
            id: "lesson-3-2",
            title: "Working with Modules",
            duration: "22:00",
            videoUrl: "https://www.youtube.com/embed/_uQrJ0TkZlc",
            transcript: "Modules allow you to organize Python code across multiple files...",
            completed: false,
          },
          {
            id: "lesson-3-3",
            title: "File Handling",
            duration: "26:00",
            videoUrl: "https://www.youtube.com/embed/_uQrJ0TkZlc",
            transcript: "Learn how to read from and write to files in Python...",
            completed: false,
          },
        ],
      },
      {
        id: "module-4",
        title: "Object-Oriented Programming",
        lessons: [
          {
            id: "lesson-4-1",
            title: "Classes and Objects",
            duration: "30:00",
            videoUrl: "https://www.youtube.com/embed/_uQrJ0TkZlc",
            transcript: "OOP allows you to structure code using classes and objects...",
            completed: false,
          },
          {
            id: "lesson-4-2",
            title: "Inheritance and Polymorphism",
            duration: "28:00",
            videoUrl: "https://www.youtube.com/embed/_uQrJ0TkZlc",
            transcript: "Inheritance allows classes to inherit properties from other classes...",
            completed: false,
          },
          {
            id: "lesson-4-3",
            title: "Building a Project",
            duration: "35:00",
            videoUrl: "https://www.youtube.com/embed/_uQrJ0TkZlc",
            transcript: "Let's build a complete Python project from scratch...",
            completed: false,
          },
        ],
      },
    ],
  },
  {
    id: "react-essentials",
    title: "React Essentials",
    description: "Build modern, interactive user interfaces with React. Learn components, hooks, and state management.",
    thumbnail: "/react-javascript-development.jpg",
    duration: "14 hours",
    lessonsCount: 16,
    rating: 4.9,
    modules: [
      {
        id: "module-1",
        title: "React Fundamentals",
        lessons: [
          {
            id: "lesson-1-1",
            title: "What is React?",
            duration: "18:00",
            videoUrl: "https://www.youtube.com/embed/Tn6-PIqc4UM",
            transcript: "React is a JavaScript library for building user interfaces...",
            completed: false,
          },
          {
            id: "lesson-1-2",
            title: "JSX and Components",
            duration: "25:00",
            videoUrl: "https://www.youtube.com/embed/Tn6-PIqc4UM",
            transcript: "JSX allows you to write HTML-like code in JavaScript...",
            completed: false,
          },
          {
            id: "lesson-1-3",
            title: "Props and State",
            duration: "28:00",
            videoUrl: "https://www.youtube.com/embed/Tn6-PIqc4UM",
            transcript: "Props and state are core concepts for managing data in React...",
            completed: false,
          },
          {
            id: "lesson-1-4",
            title: "Event Handling",
            duration: "20:00",
            videoUrl: "https://www.youtube.com/embed/Tn6-PIqc4UM",
            transcript: "Learn how to handle user events in React applications...",
            completed: false,
          },
        ],
      },
      {
        id: "module-2",
        title: "React Hooks",
        lessons: [
          {
            id: "lesson-2-1",
            title: "useState Hook",
            duration: "22:00",
            videoUrl: "https://www.youtube.com/embed/Tn6-PIqc4UM",
            transcript: "useState allows functional components to have state...",
            completed: false,
          },
          {
            id: "lesson-2-2",
            title: "useEffect Hook",
            duration: "26:00",
            videoUrl: "https://www.youtube.com/embed/Tn6-PIqc4UM",
            transcript: "useEffect handles side effects in functional components...",
            completed: false,
          },
          {
            id: "lesson-2-3",
            title: "useContext Hook",
            duration: "24:00",
            videoUrl: "https://www.youtube.com/embed/Tn6-PIqc4UM",
            transcript: "useContext provides a way to pass data through the component tree...",
            completed: false,
          },
          {
            id: "lesson-2-4",
            title: "Custom Hooks",
            duration: "28:00",
            videoUrl: "https://www.youtube.com/embed/Tn6-PIqc4UM",
            transcript: "Create your own hooks to reuse stateful logic...",
            completed: false,
          },
        ],
      },
      {
        id: "module-3",
        title: "Component Patterns",
        lessons: [
          {
            id: "lesson-3-1",
            title: "Controlled Components",
            duration: "20:00",
            videoUrl: "https://www.youtube.com/embed/Tn6-PIqc4UM",
            transcript: "Controlled components have their state controlled by React...",
            completed: false,
          },
          {
            id: "lesson-3-2",
            title: "Composition vs Inheritance",
            duration: "22:00",
            videoUrl: "https://www.youtube.com/embed/Tn6-PIqc4UM",
            transcript: "React favors composition over inheritance for code reuse...",
            completed: false,
          },
          {
            id: "lesson-3-3",
            title: "Higher-Order Components",
            duration: "26:00",
            videoUrl: "https://www.youtube.com/embed/Tn6-PIqc4UM",
            transcript: "HOCs are advanced patterns for reusing component logic...",
            completed: false,
          },
          {
            id: "lesson-3-4",
            title: "Render Props",
            duration: "24:00",
            videoUrl: "https://www.youtube.com/embed/Tn6-PIqc4UM",
            transcript: "Render props is a technique for sharing code between components...",
            completed: false,
          },
        ],
      },
      {
        id: "module-4",
        title: "Advanced Concepts",
        lessons: [
          {
            id: "lesson-4-1",
            title: "React Router",
            duration: "30:00",
            videoUrl: "https://www.youtube.com/embed/Tn6-PIqc4UM",
            transcript: "React Router enables navigation in single-page applications...",
            completed: false,
          },
          {
            id: "lesson-4-2",
            title: "State Management",
            duration: "32:00",
            videoUrl: "https://www.youtube.com/embed/Tn6-PIqc4UM",
            transcript: "Learn patterns for managing complex application state...",
            completed: false,
          },
          {
            id: "lesson-4-3",
            title: "Performance Optimization",
            duration: "28:00",
            videoUrl: "https://www.youtube.com/embed/Tn6-PIqc4UM",
            transcript: "Optimize your React applications for better performance...",
            completed: false,
          },
          {
            id: "lesson-4-4",
            title: "Building a Complete App",
            duration: "40:00",
            videoUrl: "https://www.youtube.com/embed/Tn6-PIqc4UM",
            transcript: "Put everything together to build a full React application...",
            completed: false,
          },
        ],
      },
    ],
  },
  {
    id: "web-design-basics",
    title: "Web Design Basics",
    description: "Learn the principles of great web design. Create beautiful, user-friendly websites that convert.",
    thumbnail: "/web-design-ui-mockup.jpg",
    duration: "6 hours",
    lessonsCount: 10,
    rating: 4.6,
    modules: [
      {
        id: "module-1",
        title: "Design Fundamentals",
        lessons: [
          {
            id: "lesson-1-1",
            title: "Color Theory",
            duration: "20:00",
            videoUrl: "https://www.youtube.com/embed/AvgCkHrcj90",
            transcript: "Understanding color theory is essential for effective web design...",
            completed: false,
          },
          {
            id: "lesson-1-2",
            title: "Typography Basics",
            duration: "22:00",
            videoUrl: "https://www.youtube.com/embed/AvgCkHrcj90",
            transcript: "Typography affects readability and user experience...",
            completed: false,
          },
          {
            id: "lesson-1-3",
            title: "Layout Principles",
            duration: "24:00",
            videoUrl: "https://www.youtube.com/embed/AvgCkHrcj90",
            transcript: "Good layout guides users through your content effectively...",
            completed: false,
          },
          {
            id: "lesson-1-4",
            title: "Whitespace and Balance",
            duration: "18:00",
            videoUrl: "https://www.youtube.com/embed/AvgCkHrcj90",
            transcript: "Whitespace creates breathing room and visual hierarchy...",
            completed: false,
          },
        ],
      },
      {
        id: "module-2",
        title: "User Experience",
        lessons: [
          {
            id: "lesson-2-1",
            title: "UX Principles",
            duration: "25:00",
            videoUrl: "https://www.youtube.com/embed/AvgCkHrcj90",
            transcript: "User experience design focuses on how users interact with your site...",
            completed: false,
          },
          {
            id: "lesson-2-2",
            title: "Navigation Design",
            duration: "20:00",
            videoUrl: "https://www.youtube.com/embed/AvgCkHrcj90",
            transcript: "Clear navigation helps users find what they're looking for...",
            completed: false,
          },
          {
            id: "lesson-2-3",
            title: "Mobile Design",
            duration: "22:00",
            videoUrl: "https://www.youtube.com/embed/AvgCkHrcj90",
            transcript: "Mobile-first design is crucial in today's multi-device world...",
            completed: false,
          },
        ],
      },
      {
        id: "module-3",
        title: "Design Tools",
        lessons: [
          {
            id: "lesson-3-1",
            title: "Figma Basics",
            duration: "28:00",
            videoUrl: "https://www.youtube.com/embed/AvgCkHrcj90",
            transcript: "Figma is a powerful tool for designing interfaces...",
            completed: false,
          },
          {
            id: "lesson-3-2",
            title: "Prototyping",
            duration: "26:00",
            videoUrl: "https://www.youtube.com/embed/AvgCkHrcj90",
            transcript: "Prototypes help validate design decisions before development...",
            completed: false,
          },
          {
            id: "lesson-3-3",
            title: "Design Systems",
            duration: "30:00",
            videoUrl: "https://www.youtube.com/embed/AvgCkHrcj90",
            transcript: "Design systems ensure consistency across your application...",
            completed: false,
          },
        ],
      },
    ],
  },
  {
    id: "nodejs-backend",
    title: "Node.js Backend Development",
    description: "Build scalable server-side applications with Node.js. Learn APIs, databases, and authentication.",
    thumbnail: "/node-js-server-backend.jpg",
    duration: "16 hours",
    lessonsCount: 18,
    rating: 4.8,
    modules: [
      {
        id: "module-1",
        title: "Node.js Fundamentals",
        lessons: [
          {
            id: "lesson-1-1",
            title: "Introduction to Node.js",
            duration: "20:00",
            videoUrl: "https://www.youtube.com/embed/TlB_eWDSMt4",
            transcript: "Node.js allows you to run JavaScript on the server...",
            completed: false,
          },
          {
            id: "lesson-1-2",
            title: "NPM and Modules",
            duration: "22:00",
            videoUrl: "https://www.youtube.com/embed/TlB_eWDSMt4",
            transcript: "NPM is the package manager for Node.js applications...",
            completed: false,
          },
          {
            id: "lesson-1-3",
            title: "Asynchronous Programming",
            duration: "28:00",
            videoUrl: "https://www.youtube.com/embed/TlB_eWDSMt4",
            transcript: "Understanding async patterns is crucial for Node.js development...",
            completed: false,
          },
        ],
      },
      {
        id: "module-2",
        title: "Building APIs",
        lessons: [
          {
            id: "lesson-2-1",
            title: "Express.js Basics",
            duration: "25:00",
            videoUrl: "https://www.youtube.com/embed/TlB_eWDSMt4",
            transcript: "Express.js is the most popular Node.js web framework...",
            completed: false,
          },
          {
            id: "lesson-2-2",
            title: "REST API Design",
            duration: "30:00",
            videoUrl: "https://www.youtube.com/embed/TlB_eWDSMt4",
            transcript: "RESTful APIs follow conventions for building web services...",
            completed: false,
          },
          {
            id: "lesson-2-3",
            title: "Middleware",
            duration: "24:00",
            videoUrl: "https://www.youtube.com/embed/TlB_eWDSMt4",
            transcript: "Middleware functions process requests before they reach routes...",
            completed: false,
          },
        ],
      },
      {
        id: "module-3",
        title: "Database Integration",
        lessons: [
          {
            id: "lesson-3-1",
            title: "Working with MongoDB",
            duration: "32:00",
            videoUrl: "https://www.youtube.com/embed/TlB_eWDSMt4",
            transcript: "MongoDB is a popular NoSQL database for Node.js applications...",
            completed: false,
          },
          {
            id: "lesson-3-2",
            title: "Mongoose ODM",
            duration: "28:00",
            videoUrl: "https://www.youtube.com/embed/TlB_eWDSMt4",
            transcript: "Mongoose provides elegant MongoDB object modeling...",
            completed: false,
          },
        ],
      },
      {
        id: "module-4",
        title: "Authentication & Security",
        lessons: [
          {
            id: "lesson-4-1",
            title: "JWT Authentication",
            duration: "30:00",
            videoUrl: "https://www.youtube.com/embed/TlB_eWDSMt4",
            transcript: "JSON Web Tokens provide stateless authentication...",
            completed: false,
          },
          {
            id: "lesson-4-2",
            title: "Security Best Practices",
            duration: "26:00",
            videoUrl: "https://www.youtube.com/embed/TlB_eWDSMt4",
            transcript: "Learn how to secure your Node.js applications...",
            completed: false,
          },
        ],
      },
    ],
  },
]

// Default admin user
export const defaultAdmin: AdminUser = {
  username: "admin",
  password: "admin123",
}

// Sample students data
export const sampleStudents: Student[] = [
  {
    id: "student-1",
    fullName: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "+1234567890",
    course: "html-css-basics",
    startDate: "2024-01-15",
    progress: 75,
    completedLessons: [
      "lesson-1-1",
      "lesson-1-2",
      "lesson-1-3",
      "lesson-2-1",
      "lesson-2-2",
      "lesson-2-3",
      "lesson-3-1",
      "lesson-3-2",
      "lesson-3-3",
    ],
  },
  {
    id: "student-2",
    fullName: "Michael Chen",
    email: "m.chen@example.com",
    phone: "+1234567891",
    course: "javascript-fundamentals",
    startDate: "2024-01-20",
    progress: 60,
    completedLessons: [
      "lesson-1-1",
      "lesson-1-2",
      "lesson-1-3",
      "lesson-1-4",
      "lesson-2-1",
      "lesson-2-2",
      "lesson-2-3",
      "lesson-3-1",
      "lesson-3-2",
    ],
  },
  {
    id: "student-3",
    fullName: "Emily Rodriguez",
    email: "emily.r@example.com",
    phone: "+1234567892",
    course: "react-essentials",
    startDate: "2024-02-01",
    progress: 45,
    completedLessons: [
      "lesson-1-1",
      "lesson-1-2",
      "lesson-1-3",
      "lesson-1-4",
      "lesson-2-1",
      "lesson-2-2",
      "lesson-2-3",
    ],
  },
  {
    id: "student-4",
    fullName: "David Kim",
    email: "david.k@example.com",
    phone: "+1234567893",
    course: "python-programming",
    startDate: "2024-02-10",
    progress: 30,
    completedLessons: ["lesson-1-1", "lesson-1-2", "lesson-1-3", "lesson-1-4"],
  },
  {
    id: "student-5",
    fullName: "Jessica Brown",
    email: "jessica.b@example.com",
    phone: "+1234567894",
    course: "web-design-basics",
    startDate: "2024-02-15",
    progress: 90,
    completedLessons: [
      "lesson-1-1",
      "lesson-1-2",
      "lesson-1-3",
      "lesson-1-4",
      "lesson-2-1",
      "lesson-2-2",
      "lesson-2-3",
      "lesson-3-1",
      "lesson-3-2",
    ],
  },
]

// Initialize localStorage with sample data
export function initializeLocalStorage() {
  if (typeof window === "undefined") return

  if (!localStorage.getItem("markano_courses")) {
    localStorage.setItem("markano_courses", JSON.stringify(sampleCourses))
  }

  if (!localStorage.getItem("markano_students")) {
    localStorage.setItem("markano_students", JSON.stringify(sampleStudents))
  }

  if (!localStorage.getItem("markano_admin")) {
    localStorage.setItem("markano_admin", JSON.stringify(defaultAdmin))
  }
}

// LocalStorage utility functions
export function getCourses(): Course[] {
  if (typeof window === "undefined") return sampleCourses
  const stored = localStorage.getItem("markano_courses")
  return stored ? JSON.parse(stored) : sampleCourses
}

export function getCourse(id: string): Course | undefined {
  const courses = getCourses()
  return courses.find((c) => c.id === id)
}

export function getStudents(): Student[] {
  if (typeof window === "undefined") return sampleStudents
  const stored = localStorage.getItem("markano_students")
  return stored ? JSON.parse(stored) : sampleStudents
}

export function addStudent(student: Omit<Student, "id" | "progress" | "completedLessons">): Student {
  const students = getStudents()
  const newStudent: Student = {
    ...student,
    id: `student-${Date.now()}`,
    progress: 0,
    completedLessons: [],
  }
  students.push(newStudent)
  localStorage.setItem("markano_students", JSON.stringify(students))
  return newStudent
}

export function updateStudentProgress(studentId: string, lessonId: string, completed: boolean) {
  const students = getStudents()
  const studentIndex = students.findIndex((s) => s.id === studentId)

  if (studentIndex !== -1) {
    const student = students[studentIndex]
    if (completed && !student.completedLessons.includes(lessonId)) {
      student.completedLessons.push(lessonId)
    } else if (!completed) {
      student.completedLessons = student.completedLessons.filter((id) => id !== lessonId)
    }

    // Calculate progress percentage
    const course = getCourse(student.course)
    if (course) {
      const totalLessons = course.lessonsCount
      student.progress = Math.round((student.completedLessons.length / totalLessons) * 100)
    }

    students[studentIndex] = student
    localStorage.setItem("markano_students", JSON.stringify(students))
  }
}

export function getAdmin(): AdminUser {
  if (typeof window === "undefined") return defaultAdmin
  const stored = localStorage.getItem("markano_admin")
  return stored ? JSON.parse(stored) : defaultAdmin
}

export function verifyAdmin(username: string, password: string): boolean {
  const admin = getAdmin()
  console.log("[v0] Verifying admin:", {
    inputUsername: username,
    inputPassword: password,
    storedUsername: admin.username,
    storedPassword: admin.password,
    match: admin.username === username && admin.password === password,
  })
  return admin.username === username && admin.password === password
}

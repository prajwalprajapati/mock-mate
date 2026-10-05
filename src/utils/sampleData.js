export const SAMPLE_DATASETS = [
  {
    id: "cs_web_dev",
    title: "Computer Science & Web Development (10 MCQs)",
    description: "Covers JavaScript, React, HTTP, Algorithms, and Data Structures.",
    questions: [
      {
        id: "sample_cs_1",
        index: 1,
        question: "Which of the following is NOT a JavaScript primitive data type?",
        options: [
          { key: "A", text: "String" },
          { key: "B", text: "Boolean" },
          { key: "C", text: "Object" },
          { key: "D", text: "Symbol" }
        ],
        correctAnswer: "C",
        explanation: "In JavaScript, Object is a structural/reference type, while String, Number, BigInt, Boolean, Undefined, Symbol, and Null are primitive types."
      },
      {
        id: "sample_cs_2",
        index: 2,
        question: "What is the time complexity of searching an element in a balanced Binary Search Tree (BST)?",
        options: [
          { key: "A", text: "O(1)" },
          { key: "B", text: "O(log N)" },
          { key: "C", text: "O(N)" },
          { key: "D", text: "O(N log N)" }
        ],
        correctAnswer: "B",
        explanation: "In a balanced BST like AVL or Red-Black Tree, search, insert, and delete operations take O(log N) time."
      },
      {
        id: "sample_cs_3",
        index: 3,
        question: "Which HTTP status code signifies that the requested resource has moved permanently?",
        options: [
          { key: "A", text: "301 Moved Permanently" },
          { key: "B", text: "302 Found" },
          { key: "C", text: "404 Not Found" },
          { key: "D", text: "500 Internal Server Error" }
        ],
        correctAnswer: "A",
        explanation: "301 is the standard status code indicating that the target resource has been assigned a new permanent URI."
      },
      {
        id: "sample_cs_4",
        index: 4,
        question: "In React, what hook is primarily used to perform side effects such as data fetching and DOM subscriptions?",
        options: [
          { key: "A", text: "useState" },
          { key: "B", text: "useContext" },
          { key: "C", text: "useEffect" },
          { key: "D", text: "useReducer" }
        ],
        correctAnswer: "C",
        explanation: "useEffect allows you to perform side effects in function components, replacing lifecycle methods like componentDidMount and componentDidUpdate."
      },
      {
        id: "sample_cs_5",
        index: 5,
        question: "Which CSS layout module is optimized for two-dimensional grid layouts with rows and columns?",
        options: [
          { key: "A", text: "Flexbox" },
          { key: "B", text: "CSS Grid" },
          { key: "C", text: "Floats" },
          { key: "D", text: "Inline-Block" }
        ],
        correctAnswer: "B",
        explanation: "CSS Grid is designed for 2D layout (rows and columns simultaneously), whereas Flexbox is designed for 1D layout (rows OR columns)."
      },
      {
        id: "sample_cs_6",
        index: 6,
        question: "What is the purpose of the Dockerfile in containerized applications?",
        options: [
          { key: "A", text: "To specify network routing rules" },
          { key: "B", text: "A text script containing all commands to build a Docker container image" },
          { key: "C", text: "A database migration file" },
          { key: "D", text: "To store encrypted environment secrets" }
        ],
        correctAnswer: "B",
        explanation: "A Dockerfile is a text document that contains all the commands a user could call on the command line to assemble an image."
      },
      {
        id: "sample_cs_7",
        index: 7,
        question: "Which of the following data structures operates on a Last In First Out (LIFO) principle?",
        options: [
          { key: "A", text: "Queue" },
          { key: "B", text: "Stack" },
          { key: "C", text: "Linked List" },
          { key: "D", text: "Heap" }
        ],
        correctAnswer: "B",
        explanation: "A Stack follows the LIFO (Last In First Out) principle, where the last element added is the first one removed."
      },
      {
        id: "sample_cs_8",
        index: 8,
        question: "What does CORS stand for in web security?",
        options: [
          { key: "A", text: "Cross-Origin Resource Sharing" },
          { key: "B", text: "Centralized Open Routing System" },
          { key: "C", text: "Client Origin Request Service" },
          { key: "D", text: "Cross-Object Relay Socket" }
        ],
        correctAnswer: "A",
        explanation: "CORS (Cross-Origin Resource Sharing) is an HTTP-header based mechanism that allows a server to indicate any origins other than its own from which a browser should permit loading resources."
      },
      {
        id: "sample_cs_9",
        index: 9,
        question: "Which SQL clause is used to filter rows after an aggregation (GROUP BY) has been applied?",
        options: [
          { key: "A", text: "WHERE" },
          { key: "B", text: "ORDER BY" },
          { key: "C", text: "HAVING" },
          { key: "D", text: "FILTER" }
        ],
        correctAnswer: "C",
        explanation: "The HAVING clause was added to SQL because the WHERE keyword cannot be used with aggregate functions."
      },
      {
        id: "sample_cs_10",
        index: 10,
        question: "Which protocol is used by Git for secure distributed version control communication over SSH?",
        options: [
          { key: "A", text: "Port 80 HTTP" },
          { key: "B", text: "Port 22 SSH" },
          { key: "C", text: "Port 21 FTP" },
          { key: "D", text: "Port 53 DNS" }
        ],
        correctAnswer: "B",
        explanation: "Git over SSH runs on standard TCP port 22 with public/private key authentication."
      }
    ]
  },
  {
    id: "general_science",
    title: "General Science & Physics Quiz (8 MCQs)",
    description: "Fundamental physics, chemistry, and biology revision questions.",
    questions: [
      {
        id: "sci_1",
        index: 1,
        question: "What is the SI unit of electric potential difference?",
        options: [
          { key: "A", text: "Ampere" },
          { key: "B", text: "Volt" },
          { key: "C", text: "Ohm" },
          { key: "D", text: "Watt" }
        ],
        correctAnswer: "B",
        explanation: "The Volt (V) is the SI unit of electromotive force and electric potential difference."
      },
      {
        id: "sci_2",
        index: 2,
        question: "What organelle is known as the powerhouse of the eukaryotic cell?",
        options: [
          { key: "A", text: "Ribosome" },
          { key: "B", text: "Mitochondria" },
          { key: "C", text: "Golgi apparatus" },
          { key: "D", text: "Endoplasmic Reticulum" }
        ],
        correctAnswer: "B",
        explanation: "Mitochondria generate most of the chemical energy needed to power the cells biochemical reactions (ATP)."
      },
      {
        id: "sci_3",
        index: 3,
        question: "Which gas is the most abundant in Earths atmosphere?",
        options: [
          { key: "A", text: "Oxygen" },
          { key: "B", text: "Carbon Dioxide" },
          { key: "C", text: "Nitrogen" },
          { key: "D", text: "Argon" }
        ],
        correctAnswer: "C",
        explanation: "Nitrogen makes up approximately 78% of Earths atmosphere by volume."
      },
      {
        id: "sci_4",
        index: 4,
        question: "What is Newtons First Law of Motion commonly referred to as?",
        options: [
          { key: "A", text: "Law of Universal Gravitation" },
          { key: "B", text: "Law of Inertia" },
          { key: "C", text: "Law of Acceleration (F=ma)" },
          { key: "D", text: "Action and Reaction" }
        ],
        correctAnswer: "B",
        explanation: "Newtons First Law states that an object remains at rest or in uniform motion unless acted on by an external force (Law of Inertia)."
      },
      {
        id: "sci_5",
        index: 5,
        question: "What is the pH value of pure water at 25 degrees Celsius?",
        options: [
          { key: "A", text: "0" },
          { key: "B", text: "7" },
          { key: "C", text: "14" },
          { key: "D", text: "5.5" }
        ],
        correctAnswer: "B",
        explanation: "Pure water has a neutral pH of 7 at 25 degrees Celsius."
      },
      {
        id: "sci_6",
        index: 6,
        question: "Light travels fastest through which of the following mediums?",
        options: [
          { key: "A", text: "Water" },
          { key: "B", text: "Glass" },
          { key: "C", text: "Diamond" },
          { key: "D", text: "Vacuum" }
        ],
        correctAnswer: "D",
        explanation: "Light travels at its maximum speed of approx 3x10^8 m/s in a vacuum, slowing down when entering denser media."
      },
      {
        id: "sci_7",
        index: 7,
        question: "Which element has the chemical symbol Au?",
        options: [
          { key: "A", text: "Silver" },
          { key: "B", text: "Gold" },
          { key: "C", text: "Argon" },
          { key: "D", text: "Aluminum" }
        ],
        correctAnswer: "B",
        explanation: "Au comes from the Latin word Aurum, meaning gold."
      },
      {
        id: "sci_8",
        index: 8,
        question: "What type of lens is used to correct myopia (nearsightedness)?",
        options: [
          { key: "A", text: "Convex lens" },
          { key: "B", text: "Concave lens" },
          { key: "C", text: "Cylindrical lens" },
          { key: "D", text: "Bifocal lens" }
        ],
        correctAnswer: "B",
        explanation: "Concave (diverging) lenses spread out light rays before they hit the eye, focusing distant images correctly on the retina."
      }
    ]
  }
];
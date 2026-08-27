"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const course_model_1 = __importDefault(require("../models/course.model"));
const chapter_model_1 = __importDefault(require("../models/chapter.model"));
const topic_model_1 = __importDefault(require("../models/topic.model"));
const flashcard_model_1 = __importDefault(require("../models/flashcard.model"));
const mcq_model_1 = __importDefault(require("../models/mcq.model"));
const db_config_1 = require("../config/db.config");
const aiMlCourseSeed = {
    course: {
        title: 'AI & Machine Learning with Scikit-Learn',
        description: 'Learn to build smart AI models step by step using Python and Scikit-Learn.',
        longDescription: 'A beginner-friendly, hands-on introduction to Artificial Intelligence and Machine Learning. Learn how to prepare data, train smart prediction models, evaluate results, and build real-world projects — using Google Colab, VS Code, or your mobile phone with Pydroid 3.',
        category: 'Artificial Intelligence',
        difficulty: 'beginner',
        whatYouWillLearn: [
            'Run ML code on Google Colab, VS Code, and Pydroid 3',
            'Prepare, clean, and scale data with Pandas and Scikit-Learn',
            'Train prediction models for housing, customer churn, and credit risk',
            'Build Decision Trees, Random Forests, and end-to-end ML Pipelines',
        ],
        isPublished: true,
        order: 2,
        isFree: true,
        price: 0,
    },
    topics: [
        {
            title: 'Module 1: What is AI & Using Google Colab',
            description: 'Learn what Machine Learning is and write your first AI code in Google Colab.',
            contents: [
                {
                    type: 'text',
                    title: 'Welcome to Machine Learning',
                    content: "Welcome! You just finished your beginner Python course — congratulations!\n\nYou already know variables, print(), loops, and functions. Now you are stepping into Artificial Intelligence (AI) and Machine Learning (ML).",
                },
                {
                    type: 'text',
                    title: 'Traditional Programming vs Machine Learning',
                    content: "Real-Life Analogy: Teaching a Friend to Bake\n- Traditional Code: You write an exact recipe ('Add 200g flour, bake at 180°C'). The computer follows your exact instructions.\n- Machine Learning: You give your friend 100 cakes to taste along with ratings (9/10, 2/10). Your friend tastes them and figures out what makes a great cake by themselves!\n\nMAIN POINT TO REMEMBER:\nIn regular Python, YOU write the rules. In Machine Learning, the COMPUTER discovers the rules from data!",
                },
                {
                    type: 'quiz',
                    title: 'Quick Check: Traditional vs Machine Learning',
                    content: 'Quiz',
                    quiz: {
                        question: "In regular Python, you write an if/else statement to check if a student passes (score >= 50). Is this Traditional Programming or Machine Learning?",
                        options: [
                            { text: "Traditional Programming — because a human explicitly wrote the rule 'score >= 50'", isCorrect: true },
                            { text: "Machine Learning — because Python automatically guessed the passing mark", isCorrect: false },
                            { text: "Unsupervised Learning — because there are no students", isCorrect: false },
                            { text: "Deep Learning — because score is a variable", isCorrect: false },
                        ],
                        explanation: "In traditional programming, you manually code rules like score >= 50. In Machine Learning, the computer analyzes 1,000 past student records to discover the passing rule by itself.",
                    },
                },
                {
                    type: 'text',
                    title: 'What is AI vs Machine Learning vs Deep Learning?',
                    content: "These terms fit inside each other like Russian nesting dolls:\n\n- Artificial Intelligence (AI): The big umbrella concept — making machines smart.\n- Machine Learning (ML): The engine inside AI — teaching computers using data instead of hardcoded rules.\n- Deep Learning (DL): A subset of ML using multi-layer artificial neural networks.",
                },
                {
                    type: 'text',
                    title: 'The 3 Main Types of Machine Learning',
                    content: "1. Supervised Learning: Learning with a teacher and an answer key (e.g. house prices, spam detection).\n2. Unsupervised Learning: Sorting laundry into piles by color without labels (e.g. customer groups).\n3. Reinforcement Learning: Training a puppy with treats by trial and error (e.g. self-driving cars).\n\nMAIN POINT TO REMEMBER:\nIn this course, we start with Supervised Learning — where every training example comes with a correct answer key!",
                },
                {
                    type: 'text',
                    title: 'Meet Your Playground: Google Colab',
                    content: "Google Colab is a free, web-based Python editor hosted by Google.\n\nWhy use Colab?\n- No Installation Needed: Runs directly in your browser on Mac, Windows, or mobile.\n- Free Cloud Computers: Google lets you run Python code on fast cloud servers for free!\n\nAnalogy: Walking into a 5-star master kitchen with all pans and stoves pre-installed!",
                },
                {
                    type: 'text',
                    title: 'Master Keyboard Shortcuts',
                    content: "Shortcuts to remember:\n- Shift + Enter: Run current cell and move to the next cell (MOST IMPORTANT!)\n- Ctrl + Enter: Run current cell and stay\n- Ctrl + M + B: Insert a new code cell below\n\nMAIN POINT TO REMEMBER:\nPress Shift + Enter to run any code cell in Google Colab!",
                },
                {
                    type: 'text',
                    title: 'Working with Files & Google Drive in Colab',
                    content: "Temporary vs Permanent Storage:\n- Direct file uploads in Colab are temporary (deleted when session ends).\n- Solution: Connect (mount) your Google Drive to Colab so your files stay saved forever!\n\nCode to mount Google Drive:\nfrom google.colab import drive\ndrive.mount('/content/drive')",
                },
                {
                    type: 'code',
                    title: 'Mounting Google Drive & Checking Hardware Specs',
                    content: "from google.colab import drive\n# drive.mount('/content/drive')\n\nimport platform\nimport psutil\nimport sklearn\n\nprint('Operating System:', platform.system())\nprint(f'RAM Available: {psutil.virtual_memory().total / (1024**3):.2f} GB')\nprint('Scikit-Learn Version:', sklearn.__version__)",
                    language: 'python',
                },
                {
                    type: 'text',
                    title: 'Your First Scikit-Learn Code',
                    content: "Scikit-Learn (sklearn) is the premier Python library for Machine Learning. It comes pre-installed in Google Colab!\n\nLet's write a quick script to load the Iris Flower Dataset — a dataset containing 150 flower samples.",
                },
                {
                    type: 'code',
                    title: 'Loading Iris Dataset with Scikit-Learn',
                    content: "import sklearn\nfrom sklearn.datasets import load_iris\n\n# Load dataset\niris = load_iris()\nprint('Scikit-Learn Version:', sklearn.__version__)\nprint('Dataset loaded successfully!')\nprint('Flower Categories:', iris.target_names)\nprint('Feature Names:', iris.feature_names)\nprint('Data Shape (Rows, Columns):', iris.data.shape)",
                    language: 'python',
                },
                {
                    type: 'exercise',
                    title: 'Exercise 1: Print Environment Greeting',
                    content: 'Exercise',
                    exercise: {
                        instructions: 'Write a Python script that stores your name in a variable, checks your Scikit-Learn version, and prints a customized greeting message.',
                        starterCode: 'my_name = "___"  # Replace with your name\nimport sklearn\n\n# Print your greeting and sklearn version\n',
                        language: 'python',
                        solution: 'my_name = "Ada"\nimport sklearn\nprint(f"Hello {my_name}! Welcome to ML with Scikit-Learn v{sklearn.__version__}!")',
                    },
                },
                {
                    type: 'exercise',
                    title: 'Exercise 2: Inspecting Dataset Shape',
                    content: 'Exercise',
                    exercise: {
                        instructions: 'Import load_iris from sklearn.datasets, load the dataset into a variable named iris, and print the shape of iris.data.',
                        starterCode: 'from sklearn.datasets import load_iris\n\n# Load data\n\n# Print shape of iris.data\n',
                        language: 'python',
                        solution: 'from sklearn.datasets import load_iris\niris = load_iris()\nprint("Feature matrix shape:", iris.data.shape)',
                    },
                },
            ],
            flashcards: [
                { question: 'What is the primary difference between Traditional Programming and Machine Learning?', answer: 'In Traditional Programming, humans write rules explicitly. In Machine Learning, the computer automatically discovers rules from data.' },
                { question: 'What is Supervised Learning?', answer: 'Training an ML model using input data (X) alongside correct target answers (y).' },
                { question: 'What keyboard shortcut executes a code cell in Google Colab?', answer: 'Shift + Enter' },
                { question: 'How do you mount Google Drive in Colab to save files permanently?', answer: 'from google.colab import drive; drive.mount("/content/drive")' },
                { question: 'How do you check which version of Scikit-Learn is installed in Python?', answer: 'import sklearn; print(sklearn.__version__)' },
            ],
            mcqs: [
                {
                    question: 'What does a Machine Learning algorithm learn after studying training data?',
                    options: [
                        { text: 'A list of syntax errors', isCorrect: false },
                        { text: 'Rules / Patterns mapping inputs to target outputs', isCorrect: true },
                        { text: 'A new operating system', isCorrect: false },
                        { text: 'Unorganized text files', isCorrect: false },
                    ],
                    explanation: 'ML algorithms analyze input data (X) and known outputs (y) to find mathematical rules that predict answers for new, unseen data.',
                },
                {
                    question: 'Which type of Machine Learning would you use to group customers into 4 clusters based on spending habits, when you have NO pre-existing category labels?',
                    options: [
                        { text: 'Supervised Learning', isCorrect: false },
                        { text: 'Unsupervised Learning', isCorrect: true },
                        { text: 'Reinforcement Learning', isCorrect: false },
                        { text: 'Manual Programming', isCorrect: false },
                    ],
                    explanation: 'Unsupervised Learning finds natural groups and patterns in data when no target labels or answers are provided.',
                },
                {
                    question: 'How do you mount your Google Drive inside a Google Colab notebook?',
                    options: [
                        { text: 'import drive', isCorrect: false },
                        { text: "from google.colab import drive followed by drive.mount('/content/drive')", isCorrect: true },
                        { text: 'pip install google-drive', isCorrect: false },
                        { text: 'Drive mounts automatically without any code', isCorrect: false },
                    ],
                    explanation: "Executing from google.colab import drive and drive.mount('/content/drive') prompts authorization to link your Google Drive folder structure directly to Colab.",
                },
                {
                    question: 'What happens when you type import sklearn in Google Colab?',
                    options: [
                        { text: 'It fails because Scikit-Learn must be installed with pip first', isCorrect: false },
                        { text: 'It imports Scikit-Learn directly because it comes pre-installed in Colab', isCorrect: true },
                        { text: 'It deletes your notebook', isCorrect: false },
                        { text: 'It opens a browser pop-up window', isCorrect: false },
                    ],
                    explanation: 'Google Colab comes with popular data science and machine learning libraries (Scikit-Learn, Pandas, NumPy, Matplotlib) pre-installed!',
                },
            ],
        },
        {
            title: 'Module 2: Code Anywhere – VS Code, Jupyter & Pydroid 3',
            description: 'Set up Python on your computer or write ML code on your phone with Pydroid 3.',
            contents: [
                {
                    type: 'text',
                    title: 'Why Code Outside Google Colab?',
                    content: "Google Colab is great for cloud notebooks, but coding offline gives you full independence!\n\nReal-Life Analogy: Hotel vs Apartment\n- Colab is like a hotel room: convenient for short visits, but gets reset when you leave.\n- Local setup is like owning your apartment: your files stay saved forever and you can code without internet.\n\nMAIN POINT TO REMEMBER:\nSetting up local tools lets you practice Machine Learning offline anytime, anywhere!",
                },
                {
                    type: 'text',
                    title: 'Virtual Environments (venv) — Your Clean Room',
                    content: "What is a Virtual Environment?\nImagine having two cooking recipes: one needs white flour, and another needs gluten-free almond flour. If you mix both flours in one bowl, you ruin both recipes!\n\nIn Python, different projects might require different library versions. A Virtual Environment (venv) is a separate, clean folder that isolates packages for one specific project.\n\nMAIN POINT TO REMEMBER:\nAlways activate your virtual environment before installing or running project packages!",
                },
                {
                    type: 'quiz',
                    title: 'Quick Check: Why Virtual Environments?',
                    content: 'Quiz',
                    quiz: {
                        question: "Why do programmers use virtual environments for Python projects?",
                        options: [
                            { text: "To create isolated rooms so project packages do not clash", isCorrect: true },
                            { text: "To make Python download faster", isCorrect: false },
                            { text: "To delete old code automatically", isCorrect: false },
                            { text: "To change monitor screen colors", isCorrect: false },
                        ],
                        explanation: "Virtual environments isolate package versions per project, preventing conflicts across different Python projects.",
                    },
                },
                {
                    type: 'text',
                    title: 'Installing Libraries with Pip',
                    content: "pip is Python's package delivery driver. Once your virtual environment is active, run this command in terminal to install core ML packages:\n\npip install scikit-learn pandas numpy matplotlib notebook",
                },
                {
                    type: 'text',
                    title: 'Desktop Setup: VS Code & Jupyter',
                    content: "VS Code is a free, light code editor.\n\nQuick 3-step setup:\n1. Download VS Code from code.visualstudio.com\n2. Open Extensions tab -> Install 'Python' & 'Jupyter' extensions\n3. Press Ctrl + Shift + P -> Select 'Python: Select Interpreter' -> Pick your ml_env virtual environment!\n\nNow you can write .py script files or .ipynb notebook files directly inside VS Code.",
                },
                {
                    type: 'text',
                    title: 'Mobile Setup: Pydroid 3 on Android',
                    content: "Don't have a laptop right now? No problem! You can write and run full Machine Learning code on your Android phone using Pydroid 3.\n\nHow to install packages in Pydroid 3:\n1. Open Pydroid 3 app on Android\n2. Tap Menu (top left) -> Pip\n3. Search 'scikit-learn' -> Tap Install (repeat for pandas and numpy)\n4. Write code in the editor and tap the yellow Play button!\n\nMAIN POINT TO REMEMBER:\nPydroid 3 lets you practice real Scikit-Learn code on your mobile phone anywhere!",
                },
                {
                    type: 'quiz',
                    title: 'Quick Check: Pydroid 3 Setup',
                    content: 'Quiz',
                    quiz: {
                        question: "Where do you go inside the Pydroid 3 mobile app to install scikit-learn?",
                        options: [
                            { text: "Menu -> Pip -> Search 'scikit-learn' -> Install", isCorrect: true },
                            { text: "Settings -> Battery -> Storage", isCorrect: false },
                            { text: "Google Chrome browser downloads", isCorrect: false },
                            { text: "Calculator menu", isCorrect: false },
                        ],
                        explanation: "Pydroid 3 includes a built-in Pip menu allowing you to search and install Python packages directly on Android.",
                    },
                },
                {
                    type: 'code',
                    title: 'Environment Verification Script',
                    content: "import numpy as np\nimport pandas as pd\nimport sklearn\n\nprint('=== Environment Verification ===')\nprint('NumPy Version:', np.__version__)\nprint('Pandas Version:', pd.__version__)\nprint('Scikit-Learn Version:', sklearn.__version__)\nprint('SUCCESS: Your ML environment is 100% ready!')",
                    language: 'python',
                },
                {
                    type: 'exercise',
                    title: 'Exercise 1: Environment Diagnostic Script',
                    content: 'Exercise',
                    exercise: {
                        instructions: 'Write a Python script that imports pandas and sklearn, and prints "All systems ready!".',
                        starterCode: '# Import pandas and sklearn\n\n# Print success message\n',
                        language: 'python',
                        solution: 'import pandas as pd\nimport sklearn\nprint("Pandas:", pd.__version__)\nprint("Scikit-Learn:", sklearn.__version__)\nprint("All systems ready!")',
                    },
                },
                {
                    type: 'exercise',
                    title: 'Exercise 2: Creating a Sample Table',
                    content: 'Exercise',
                    exercise: {
                        instructions: 'Use Pandas to create a dictionary with student names and study hours, convert it into a DataFrame, and print it.',
                        starterCode: 'import pandas as pd\n\ndata = {\n    "Name": ["Amara", "Chidi"],\n    "Hours": [4, 7]\n}\n\n# Convert to DataFrame and print\n',
                        language: 'python',
                        solution: 'import pandas as pd\ndata = {"Name": ["Amara", "Chidi"], "Hours": [4, 7]}\ndf = pd.DataFrame(data)\nprint(df)',
                    },
                },
            ],
            flashcards: [
                { question: 'How do you create a Python virtual environment named ml_env?', answer: 'python -m venv ml_env' },
                { question: 'How do you activate a virtual environment on macOS/Linux vs Windows?', answer: 'macOS/Linux: source ml_env/bin/activate | Windows: ml_env\\Scripts\\activate' },
                { question: 'What single pip command installs scikit-learn, pandas, and numpy?', answer: 'pip install scikit-learn pandas numpy' },
                { question: 'How do you install scikit-learn on an Android mobile phone?', answer: 'Open Pydroid 3 app -> Menu -> Pip -> Search scikit-learn -> Install.' },
                { question: 'What file extension is used for Jupyter Notebooks vs Python scripts?', answer: 'Jupyter Notebook: .ipynb | Python Script: .py' },
            ],
            mcqs: [
                {
                    question: 'What does pip do in Python development?',
                    options: [
                        { text: 'It compiles C++ code into HTML', isCorrect: false },
                        { text: 'It downloads and installs external Python libraries from PyPI', isCorrect: true },
                        { text: 'It formats your hard drive', isCorrect: false },
                        { text: 'It runs code on GPUs only', isCorrect: false },
                    ],
                    explanation: 'pip is Python\'s package manager used to install external libraries like scikit-learn, pandas, and numpy.',
                },
                {
                    question: 'Why should you activate a virtual environment before working on a new project?',
                    options: [
                        { text: 'Python will crash without it', isCorrect: false },
                        { text: 'It keeps project packages isolated so dependencies do not clash', isCorrect: true },
                        { text: 'It makes your computer 10x faster', isCorrect: false },
                        { text: 'It encrypts your source code', isCorrect: false },
                    ],
                    explanation: 'Virtual environments isolate libraries per project, preventing conflicts between different package versions.',
                },
                {
                    question: 'Which mobile application allows you to install scikit-learn via Pip and run Python scripts on Android?',
                    options: [
                        { text: 'WhatsApp', isCorrect: false },
                        { text: 'Pydroid 3', isCorrect: true },
                        { text: 'Chrome', isCorrect: false },
                        { text: 'Calculator', isCorrect: false },
                    ],
                    explanation: 'Pydroid 3 is a feature-rich Python IDE for Android that supports C/C++ compilation and Pip package installation.',
                },
                {
                    question: 'How do you know your virtual environment ml_env is currently active in your terminal?',
                    options: [
                        { text: 'Your screen turns green', isCorrect: false },
                        { text: 'You see (ml_env) displayed at the start of your terminal prompt line', isCorrect: true },
                        { text: 'A popup window appears on desktop', isCorrect: false },
                        { text: 'Python automatically opens in browser', isCorrect: false },
                    ],
                    explanation: 'Active virtual environments prefix your terminal prompt with the environment name inside parentheses, e.g., (ml_env).',
                },
            ],
        },
        {
            title: 'Module 3: Math & Data Basics (NumPy & Pandas)',
            description: 'Store numbers in matrices and load tables of data with Pandas.',
            contents: [
                {
                    type: 'text',
                    title: 'NumPy Arrays and Pandas DataFrames',
                    content: "Machine learning models love numbers! NumPy handles lists of numbers (arrays), while Pandas handles tables of data (DataFrames) like Excel spreadsheets.\n\nPandas makes loading datasets super simple:\nimport pandas as pd\ndf = pd.read_csv('dataset.csv')\nprint(df.head())",
                },
                {
                    type: 'code',
                    title: 'Loading Data with Pandas',
                    content: 'import pandas as pd\nimport numpy as np\n\n# Create a simple table\ndata = {"Age": [22, 25, 47, 52], "Income": [30000, 45000, 80000, 110000]}\ndf = pd.DataFrame(data)\nprint(df)',
                    language: 'python',
                },
            ],
            flashcards: [
                { question: 'What is a Pandas DataFrame?', answer: 'A 2D table of data with rows and columns, similar to an Excel sheet.' },
                { question: 'What function reads a CSV file into Pandas?', answer: 'pd.read_csv("filename.csv")' },
            ],
            mcqs: [
                {
                    question: 'Which Pandas method shows the first 5 rows of a dataset?',
                    options: [
                        { text: 'df.head()', isCorrect: true },
                        { text: 'df.first()', isCorrect: false },
                        { text: 'df.show()', isCorrect: false },
                        { text: 'df.top()', isCorrect: false },
                    ],
                    explanation: 'df.head() displays the top 5 rows of a DataFrame by default.',
                },
            ],
        },
        {
            title: 'Module 4: How Scikit-Learn Works',
            description: 'Learn the standard fit-and-predict pattern used by all Scikit-Learn models.',
            contents: [
                {
                    type: 'text',
                    title: 'The Scikit-Learn Pattern',
                    content: "Every model in Scikit-Learn follows the exact same 3 steps:\n1. Import & initialize: model = ModelName()\n2. Train (Fit): model.fit(X_train, y_train)\n3. Predict: predictions = model.predict(X_test)\n\nFeature Matrix (X): The input information (like house size, bedrooms).\nTarget Vector (y): What you want to predict (like house price).",
                },
                {
                    type: 'code',
                    title: 'Splitting Data with train_test_split',
                    content: 'from sklearn.model_selection import train_test_split\nimport numpy as np\n\nX = np.array([[1], [2], [3], [4], [5], [6]])\ny = np.array([2, 4, 6, 8, 10, 12])\n\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\nprint("Train shape:", X_train.shape)\nprint("Test shape:", X_test.shape)',
                    language: 'python',
                },
            ],
            flashcards: [
                { question: 'What does model.fit(X, y) do?', answer: 'It trains the model so it learns patterns from features X to target y.' },
                { question: 'What is X in machine learning?', answer: 'The 2D feature matrix containing input variables.' },
            ],
            mcqs: [
                {
                    question: 'Which method makes predictions on new data in Scikit-Learn?',
                    options: [
                        { text: 'model.predict()', isCorrect: true },
                        { text: 'model.guess()', isCorrect: false },
                        { text: 'model.answer()', isCorrect: false },
                        { text: 'model.run()', isCorrect: false },
                    ],
                    explanation: 'model.predict(X) outputs predictions for input feature matrix X.',
                },
            ],
        },
        {
            title: 'Module 5: Fixing Missing Data',
            description: 'Learn how to fill in missing numbers so your AI model can learn cleanly.',
            contents: [
                {
                    type: 'text',
                    title: 'Handling Missing Values',
                    content: "Real-world data often has empty spots (missing values). Scikit-Learn models crash if you feed them missing numbers! We fill missing spots using an Imputer.\n\nSimpleImputer fills empty spots with the average (mean) or middle (median) value of that column.",
                },
                {
                    type: 'code',
                    title: 'Filling Missing Data with SimpleImputer',
                    content: 'from sklearn.impute import SimpleImputer\nimport numpy as np\n\nX = np.array([[1, 2], [np.nan, 3], [7, 6]])\nimputer = SimpleImputer(strategy="mean")\nX_filled = imputer.fit_transform(X)\nprint("Filled array:\\n", X_filled)',
                    language: 'python',
                },
            ],
            flashcards: [
                { question: 'Why must missing data be fixed before feeding to Scikit-Learn models?', answer: 'Most ML algorithms cannot compute mathematical equations if numbers are missing (NaN).' },
                { question: 'What is SimpleImputer used for?', answer: 'To fill missing values in a dataset using strategies like mean or median.' },
            ],
            mcqs: [
                {
                    question: 'What strategy replaces missing numbers with the column average?',
                    options: [
                        { text: 'mean', isCorrect: true },
                        { text: 'zero', isCorrect: false },
                        { text: 'drop', isCorrect: false },
                        { text: 'max', isCorrect: false },
                    ],
                    explanation: 'strategy="mean" replaces missing values with the arithmetic mean of the column.',
                },
            ],
        },
        {
            title: 'Module 6: Converting Words & Categories to Numbers',
            description: 'Turn text choices like "Red" or "Blue" into numbers your model understands.',
            contents: [
                {
                    type: 'text',
                    title: 'One-Hot Encoding',
                    content: "Computers only understand numbers. If your dataset has words like ['Red', 'Green', 'Blue'], we turn each color into its own 1 or 0 column!\n\nThis is called One-Hot Encoding:\n- Red   -> [1, 0, 0]\n- Green -> [0, 1, 0]\n- Blue  -> [0, 0, 1]",
                },
                {
                    type: 'code',
                    title: 'Using OneHotEncoder',
                    content: 'from sklearn.preprocessing import OneHotEncoder\nimport pandas as pd\n\ncolors = pd.DataFrame({"Color": ["Red", "Blue", "Green", "Red"]})\nencoder = OneHotEncoder(sparse_output=False)\nencoded = encoder.fit_transform(colors)\nprint(encoded)',
                    language: 'python',
                },
            ],
            flashcards: [
                { question: 'What is One-Hot Encoding?', answer: 'Converting categorical text labels into 1s and 0s binary columns.' },
            ],
            mcqs: [
                {
                    question: 'Why do we encode text categories into numbers for ML?',
                    options: [
                        { text: 'Because ML math equations require numerical inputs', isCorrect: true },
                        { text: 'To reduce file size', isCorrect: false },
                        { text: 'To hide data secrets', isCorrect: false },
                        { text: 'Text is not allowed in Python', isCorrect: false },
                    ],
                    explanation: 'Machine learning models rely on linear algebra and numeric math, so categorical text must be encoded.',
                },
            ],
        },
        {
            title: 'Module 7: Predicting Numbers (Linear Regression)',
            description: 'Teach your computer to predict values like prices and scores using straight lines.',
            contents: [
                {
                    type: 'text',
                    title: 'Linear Regression Basics',
                    content: "Linear Regression finds the best straight line through your data points to predict continuous numbers (like house prices, temperature, or salary).\n\nLine equation: Price = (Slope * Size) + Starting Price",
                },
                {
                    type: 'code',
                    title: 'Training Linear Regression',
                    content: 'from sklearn.linear_model import LinearRegression\nimport numpy as np\n\n# Sizes in sq ft\nX = np.array([[500], [1000], [1500], [2000]])\n# Prices in $1000s\ny = np.array([100, 200, 300, 400])\n\nmodel = LinearRegression()\nmodel.fit(X, y)\n\nnew_house = np.array([[1200]])\nprint("Predicted Price:", model.predict(new_house)[0])',
                    language: 'python',
                },
            ],
            flashcards: [
                { question: 'What type of task is Linear Regression used for?', answer: 'Predicting continuous numerical values (Regression).' },
            ],
            mcqs: [
                {
                    question: 'Which metric measures the average prediction error in the same units as the target?',
                    options: [
                        { text: 'MAE (Mean Absolute Error)', isCorrect: true },
                        { text: 'Accuracy', isCorrect: false },
                        { text: 'Precision', isCorrect: false },
                        { text: 'Confusion Matrix', isCorrect: false },
                    ],
                    explanation: 'MAE measures the average absolute difference between predicted and actual values.',
                },
            ],
        },
        {
            title: 'Module 8: Stopping Models from Overthinking (Regularization)',
            description: 'Use Ridge and Lasso to keep your prediction models simple and accurate.',
            contents: [
                {
                    type: 'text',
                    title: 'Overfitting and Regularization',
                    content: "Overfitting happens when a model memorizes the training data too hard (like memorizing exam answers instead of understanding concepts). Regularization forces the model to stay simple and generalize better to new data!\n\n- Ridge ($L_2$): Shrinks large feature weights.\n- Lasso ($L_1$): Shrinks unimportant feature weights to zero.",
                },
                {
                    type: 'code',
                    title: 'Using Ridge Regression',
                    content: 'from sklearn.linear_model import Ridge\nimport numpy as np\n\nX = np.array([[1], [2], [3], [4]])\ny = np.array([2.1, 3.9, 6.1, 8.0])\n\nridge = Ridge(alpha=1.0)\nridge.fit(X, y)\nprint("Ridge Slope:", ridge.coef_[0])',
                    language: 'python',
                },
            ],
            flashcards: [
                { question: 'What is overfitting?', answer: 'When a model learns training data noise so closely that it performs poorly on new test data.' },
            ],
            mcqs: [
                {
                    question: 'Which regularized model can set unused feature weights strictly to zero?',
                    options: [
                        { text: 'Lasso', isCorrect: true },
                        { text: 'Linear Regression', isCorrect: false },
                        { text: 'KNN', isCorrect: false },
                        { text: 'Decision Tree', isCorrect: false },
                    ],
                    explanation: 'Lasso (L1 regularization) performs feature selection by setting insignificant feature coefficients to zero.',
                },
            ],
        },
        {
            title: 'Module 9: Project 1: House Price Predictor',
            description: 'Build your very first complete ML project to predict real estate prices.',
            contents: [
                {
                    type: 'text',
                    title: 'Hands-on Project 1 Goal',
                    content: "Congratulations on reaching your first project! You will load a real housing dataset, split data, train a Linear Regression model, evaluate its predictions, and calculate the RMSE score.",
                },
                {
                    type: 'code',
                    title: 'Full House Price Prediction Code',
                    content: 'from sklearn.datasets import fetch_california_housing\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.metrics import mean_squared_error\nimport numpy as np\n\n# Load dataset\ndata = fetch_california_housing(as_frame=True)\nX, y = data.data, data.target\n\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\n\npreds = model.predict(X_test)\nrmse = np.sqrt(mean_squared_error(y_test, preds))\nprint(f"House Price RMSE: ${rmse * 100000:.2f}")',
                    language: 'python',
                },
            ],
            flashcards: [
                { question: 'What is the goal of Project 1?', answer: 'To build a complete regression pipeline predicting housing values.' },
            ],
            mcqs: [
                {
                    question: 'Why do we split data into train and test sets before evaluating?',
                    options: [
                        { text: 'To measure how well the model predicts on unseen data', isCorrect: true },
                        { text: 'To speed up Python', isCorrect: false },
                        { text: 'To delete half the dataset', isCorrect: false },
                        { text: 'To convert data to CSV', isCorrect: false },
                    ],
                    explanation: 'Evaluating on unseen test data proves whether your model actually learned patterns or just memorized train data.',
                },
            ],
        },
        {
            title: 'Module 10: Making Yes/No Decisions (Logistic Regression)',
            description: 'Teach your computer to answer yes-or-no questions like spam vs not spam.',
            contents: [
                {
                    type: 'text',
                    title: 'Classification & Logistic Regression',
                    content: "When your output is a category (Spam/Not Spam, Pass/Fail, Cat/Dog), you are doing Classification.\n\nLogistic Regression outputs a probability percentage between 0% and 100% using the Sigmoid curve. If probability > 50%, it predicts YES (1); otherwise NO (0).",
                },
                {
                    type: 'code',
                    title: 'Training Logistic Regression',
                    content: 'from sklearn.linear_model import LogisticRegression\nimport numpy as np\n\n# Hours studied\nX = np.array([[1], [2], [3], [4], [5], [6]])\n# Passed exam (0 = No, 1 = Yes)\ny = np.array([0, 0, 0, 1, 1, 1])\n\nclf = LogisticRegression()\nclf.fit(X, y)\n\nprint("Pass probability for 4.5 hours:", clf.predict_proba([[4.5]])[0][1])',
                    language: 'python',
                },
            ],
            flashcards: [
                { question: 'What task is Logistic Regression used for?', answer: 'Classification (predicting categories/labels like yes or no).' },
            ],
            mcqs: [
                {
                    question: 'What function maps any real number into a probability between 0 and 1?',
                    options: [
                        { text: 'Sigmoid function', isCorrect: true },
                        { text: 'Linear function', isCorrect: false },
                        { text: 'Modulo function', isCorrect: false },
                        { text: 'Random function', isCorrect: false },
                    ],
                    explanation: 'The Sigmoid function squashes values into a range between 0 and 1, ideal for probabilities.',
                },
            ],
        },
        {
            title: 'Module 11: Measuring Accuracy & Checking Curves',
            description: 'Learn how to check if your model is guessing correctly using scores and graphs.',
            contents: [
                {
                    type: 'text',
                    title: 'Classification Metrics',
                    content: "Accuracy alone can trick you! If 99% of emails are not spam, a dummy model guessing 'Not Spam' always gets 99% accuracy!\n\nBetter metrics:\n- Precision: When the model says YES, how often is it right?\n- Recall: Out of all real YES cases, how many did the model catch?\n- F1-Score: Balance between Precision and Recall.",
                },
                {
                    type: 'code',
                    title: 'Generating a Classification Report',
                    content: 'from sklearn.metrics import classification_report\n\ny_true = [0, 1, 0, 1, 0, 1]\ny_pred = [0, 1, 0, 0, 0, 1]\n\nprint(classification_report(y_true, y_pred))',
                    language: 'python',
                },
            ],
            flashcards: [
                { question: 'What is Precision?', answer: 'The percentage of positive predictions that were actually correct.' },
                { question: 'What is Recall?', answer: 'The percentage of actual positive instances that the model correctly identified.' },
            ],
            mcqs: [
                {
                    question: 'Which tool summarizes True Positives, False Positives, True Negatives, and False Negatives?',
                    options: [
                        { text: 'Confusion Matrix', isCorrect: true },
                        { text: 'Linear Plot', isCorrect: false },
                        { text: 'Scatter plot', isCorrect: false },
                        { text: 'Correlation Table', isCorrect: false },
                    ],
                    explanation: 'A Confusion Matrix displays detailed true/false counts for positive and negative classes.',
                },
            ],
        },
        {
            title: 'Module 12: Nearest Neighbors & Boundary Line Classifiers',
            description: 'Use KNN and SVM algorithms to classify items by distance and boundaries.',
            contents: [
                {
                    type: 'text',
                    title: 'KNN and SVM Classifiers',
                    content: "K-Nearest Neighbors (KNN): Classifies a new sample by looking at the K closest items around it ('birds of a feather flock together').\n\nSupport Vector Machines (SVM): Draws a wide safety street (margin) separating different categories.",
                },
                {
                    type: 'code',
                    title: 'Using KNeighborsClassifier',
                    content: 'from sklearn.neighbors import KNeighborsClassifier\nimport numpy as np\n\nX = np.array([[1, 1], [1, 2], [5, 5], [6, 5]])\ny = np.array([0, 0, 1, 1])\n\nknn = KNeighborsClassifier(n_neighbors=3)\nknn.fit(X, y)\nprint("Prediction for [2, 2]:", knn.predict([[2, 2]]))',
                    language: 'python',
                },
            ],
            flashcards: [
                { question: 'How does K-Nearest Neighbors classify a new point?', answer: 'By finding the majority vote among its K closest neighbor points.' },
            ],
            mcqs: [
                {
                    question: 'Why is feature scaling essential before using KNN?',
                    options: [
                        { text: 'KNN relies on distance calculations, so large scales skew distance', isCorrect: true },
                        { text: 'KNN only works with text', isCorrect: false },
                        { text: 'KNN deletes unscaled features', isCorrect: false },
                        { text: 'KNN is written in HTML', isCorrect: false },
                    ],
                    explanation: 'Unscaled features with large ranges dominate distance equations (Euclidean distance) in KNN.',
                },
            ],
        },
        {
            title: 'Module 13: Project 2: Customer Churn Predictor',
            description: 'Build a model that predicts whether a customer will stay or leave.',
            contents: [
                {
                    type: 'text',
                    title: 'Hands-on Project 2 Goal',
                    content: "In this project, you will build a classification model to spot customers who are about to cancel their subscription (churn). Early warning lets companies send discount offers!",
                },
                {
                    type: 'code',
                    title: 'Churn Classification Code',
                    content: 'from sklearn.datasets import make_classification\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import accuracy_score, recall_score\n\n# Synthetic customer data\nX, y = make_classification(n_samples=500, n_features=5, random_state=42)\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\nmodel = LogisticRegression()\nmodel.fit(X_train, y_train)\n\npreds = model.predict(X_test)\nprint("Accuracy:", accuracy_score(y_test, preds))\nprint("Recall (Churn Caught):", recall_score(y_test, preds))',
                    language: 'python',
                },
            ],
            flashcards: [
                { question: 'What is customer churn?', answer: 'When customers cancel or stop using a service.' },
            ],
            mcqs: [
                {
                    question: 'In churn prediction, why is Recall often more important than Accuracy?',
                    options: [
                        { text: 'Because missing a churning customer means losing a subscriber permanently', isCorrect: true },
                        { text: 'Recall is easier to calculate', isCorrect: false },
                        { text: 'Accuracy is not real', isCorrect: false },
                        { text: 'Recall makes models run faster', isCorrect: false },
                    ],
                    explanation: 'High recall ensures the company catches as many at-risk customers as possible before they cancel.',
                },
            ],
        },
        {
            title: 'Module 14: Decision Trees (Flowchart Learning)',
            description: 'Use simple yes/no question trees to make smart predictions.',
            contents: [
                {
                    type: 'text',
                    title: 'Decision Trees Explained',
                    content: "A Decision Tree works like a flowchart: 'Is income > $50k?' -> Yes -> 'Is credit score > 700?' -> Yes -> Approve Loan.\n\nThey are easy to understand and plot, but deep decision trees can easily overfit if you don't limit their depth (`max_depth`).",
                },
                {
                    type: 'code',
                    title: 'Training DecisionTreeClassifier',
                    content: 'from sklearn.tree import DecisionTreeClassifier, export_text\nfrom sklearn.datasets import load_iris\n\niris = load_iris()\nclf = DecisionTreeClassifier(max_depth=3, random_state=42)\nclf.fit(iris.data, iris.target)\n\nprint(export_text(clf, feature_names=iris.feature_names))',
                    language: 'python',
                },
            ],
            flashcards: [
                { question: 'What parameter controls how deep a Decision Tree can grow?', answer: 'max_depth' },
            ],
            mcqs: [
                {
                    question: 'What is a major advantage of Decision Trees?',
                    options: [
                        { text: 'They are easy to interpret and visualize like a flowchart', isCorrect: true },
                        { text: 'They never overfit', isCorrect: false },
                        { text: 'They do not require numbers', isCorrect: false },
                        { text: 'They run without Python', isCorrect: false },
                    ],
                    explanation: 'Decision Trees create transparent split rules that humans can inspect easily.',
                },
            ],
        },
        {
            title: 'Module 15: Random Forests (Wisdom of Many Trees)',
            description: 'Combine hundreds of decision trees together for super accurate results.',
            contents: [
                {
                    type: 'text',
                    title: 'The Power of Random Forests',
                    content: "A single decision tree can make mistakes. A Random Forest trains 100+ decision trees on random subsets of data and takes a majority vote! This makes Random Forests one of the most powerful and reliable algorithms in all of ML.",
                },
                {
                    type: 'code',
                    title: 'Training a RandomForestClassifier',
                    content: 'from sklearn.ensemble import RandomForestClassifier\nfrom sklearn.datasets import load_iris\n\niris = load_iris()\nrf = RandomForestClassifier(n_estimators=100, random_state=42)\nrf.fit(iris.data, iris.target)\n\nprint("Feature Importances:", rf.feature_importances_)',
                    language: 'python',
                },
            ],
            flashcards: [
                { question: 'What is a Random Forest?', answer: 'An ensemble model combining predictions from many randomized decision trees.' },
                { question: 'What parameter sets the number of trees in a Random Forest?', answer: 'n_estimators' },
            ],
            mcqs: [
                {
                    question: 'What attribute reveals which features influenced a Random Forest the most?',
                    options: [
                        { text: 'feature_importances_', isCorrect: true },
                        { text: 'tree_weights', isCorrect: false },
                        { text: 'feature_scores', isCorrect: false },
                        { text: 'model_stats', isCorrect: false },
                    ],
                    explanation: 'rf.feature_importances_ scores how much each column helped reduce impurity across all trees.',
                },
            ],
        },
        {
            title: 'Module 16: Gradient Boosting (Learning from Mistakes)',
            description: 'Train smart models that focus on fixing errors made by earlier steps.',
            contents: [
                {
                    type: 'text',
                    title: 'Boosting vs Bagging',
                    content: "In Bagging (Random Forest), trees are built independently in parallel. In Boosting, trees are built sequentially one after another — each new tree focuses on fixing the mistakes of the previous tree!",
                },
                {
                    type: 'code',
                    title: 'Using HistGradientBoostingClassifier',
                    content: 'from sklearn.ensemble import HistGradientBoostingClassifier\nfrom sklearn.datasets import load_iris\n\niris = load_iris()\nhgb = HistGradientBoostingClassifier(random_state=42)\nhgb.fit(iris.data, iris.target)\nprint("Score:", hgb.score(iris.data, iris.target))',
                    language: 'python',
                },
            ],
            flashcards: [
                { question: 'How does Gradient Boosting build trees?', answer: 'Sequentially, with each new tree trying to fix the residual errors of prior trees.' },
            ],
            mcqs: [
                {
                    question: 'Which Scikit-Learn boosting model is optimized for fast performance on large datasets?',
                    options: [
                        { text: 'HistGradientBoostingClassifier', isCorrect: true },
                        { text: 'LinearRegression', isCorrect: false },
                        { text: 'SimpleImputer', isCorrect: false },
                        { text: 'KMeans', isCorrect: false },
                    ],
                    explanation: 'HistGradientBoostingClassifier uses histogram binning for fast training on large data.',
                },
            ],
        },
        {
            title: 'Module 17: Finding the Best Settings (Hyperparameter Tuning)',
            description: 'Automatically test different settings to get the highest accuracy.',
            contents: [
                {
                    type: 'text',
                    title: 'Grid Search vs Random Search',
                    content: "Model settings (like `n_estimators`, `max_depth`) are called hyperparameters. Testing them manually takes forever!\n\n`GridSearchCV` tests every combination in a grid, while `RandomizedSearchCV` picks random combinations much faster.",
                },
                {
                    type: 'code',
                    title: 'GridSearchCV Example',
                    content: 'from sklearn.model_selection import GridSearchCV\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.datasets import load_iris\n\niris = load_iris()\nparam_grid = {"n_estimators": [10, 50], "max_depth": [3, 5]}\n\ngrid = GridSearchCV(RandomForestClassifier(random_state=42), param_grid, cv=3)\ngrid.fit(iris.data, iris.target)\nprint("Best parameters:", grid.best_params_)',
                    language: 'python',
                },
            ],
            flashcards: [
                { question: 'What does GridSearchCV do?', answer: 'Systematically evaluates every combination of hyperparameter choices using cross-validation.' },
            ],
            mcqs: [
                {
                    question: 'What is a hyperparameter?',
                    options: [
                        { text: 'A setting configured by you before training starts', isCorrect: true },
                        { text: 'A number learned automatically during fit()', isCorrect: false },
                        { text: 'A type of database file', isCorrect: false },
                        { text: 'An error message', isCorrect: false },
                    ],
                    explanation: 'Hyperparameters are model parameters set by the user prior to training (e.g., max_depth).',
                },
            ],
        },
        {
            title: 'Module 18: Building Clean ML Pipelines',
            description: 'Chain all your data steps into one clean, reusable pipeline.',
            contents: [
                {
                    type: 'text',
                    title: 'Why Use Pipelines?',
                    content: "Instead of manually running imputer -> scaler -> model on train data and repeating on test data, a Scikit-Learn `Pipeline` bundles everything into one single object!",
                },
                {
                    type: 'code',
                    title: 'Creating a Pipeline & Saving it',
                    content: 'from sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.ensemble import RandomForestClassifier\nimport joblib\n\npipeline = make_pipeline(StandardScaler(), RandomForestClassifier(n_estimators=50))\nprint("Pipeline created!")\njoblib.dump(pipeline, "my_ml_pipeline.joblib")',
                    language: 'python',
                },
            ],
            flashcards: [
                { question: 'What is a Scikit-Learn Pipeline?', answer: 'A composite object chaining preprocessing steps and an estimator together seamlessly.' },
                { question: 'What library is used to save models to disk?', answer: 'joblib (joblib.dump)' },
            ],
            mcqs: [
                {
                    question: 'Why do Pipelines prevent data leakage?',
                    options: [
                        { text: 'They ensure transformers fit ONLY on training folds during cross-validation', isCorrect: true },
                        { text: 'They encrypt your data', isCorrect: false },
                        { text: 'They compress CSV files', isCorrect: false },
                        { text: 'They prevent internet access', isCorrect: false },
                    ],
                    explanation: 'Pipelines re-fit preprocessing steps inside each cross-validation fold automatically.',
                },
            ],
        },
        {
            title: 'Module 19: Project 3: Bank Credit Risk Predictor',
            description: 'Build a professional loan approval model and save it to a file.',
            contents: [
                {
                    type: 'text',
                    title: 'Hands-on Project 3 Goal',
                    content: "You will build an end-to-end credit risk classifier for loan applications, wrap it in a Pipeline, optimize parameters, and export `credit_model.joblib` to disk.",
                },
                {
                    type: 'code',
                    title: 'Bank Credit Risk Pipeline Code',
                    content: 'from sklearn.datasets import make_classification\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.ensemble import RandomForestClassifier\nimport joblib\n\nX, y = make_classification(n_samples=1000, n_features=8, random_state=42)\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\npipe = make_pipeline(StandardScaler(), RandomForestClassifier(n_estimators=100, random_state=42))\npipe.fit(X_train, y_train)\n\nscore = pipe.score(X_test, y_test)\nprint(f"Credit Model Accuracy: {score * 100:.2f}%")\njoblib.dump(pipe, "credit_model.joblib")',
                    language: 'python',
                },
            ],
            flashcards: [
                { question: 'How do you load a saved model back into Python?', answer: 'model = joblib.load("model_filename.joblib")' },
            ],
            mcqs: [
                {
                    question: 'What is the format returned by joblib.dump()?',
                    options: [
                        { text: 'A serialized binary file containing trained model state', isCorrect: true },
                        { text: 'A text PDF file', isCorrect: false },
                        { text: 'An MP4 video file', isCorrect: false },
                        { text: 'An HTML webpage', isCorrect: false },
                    ],
                    explanation: 'joblib serializes Python objects into compact binary files on disk.',
                },
            ],
        },
        {
            title: 'Module 20: Grouping Similar Data (Clustering with K-Means)',
            description: 'Group customers or items automatically without needing correct answers.',
            contents: [
                {
                    type: 'text',
                    title: 'Unsupervised Learning & K-Means',
                    content: "In Unsupervised Learning, there are no target answers ($y$)! The model looks for hidden clusters and natural patterns in features ($X$).\n\nK-Means divides data into K cluster groups around center points (centroids).",
                },
                {
                    type: 'code',
                    title: 'Running KMeans Clustering',
                    content: 'from sklearn.cluster import KMeans\nimport numpy as np\n\nX = np.array([[1, 2], [1, 4], [1, 0], [10, 2], [10, 4], [10, 0]])\nkmeans = KMeans(n_clusters=2, random_state=42)\nkmeans.fit(X)\n\nprint("Cluster Labels:", kmeans.labels_)\nprint("Cluster Centers:\\n", kmeans.cluster_centers_)',
                    language: 'python',
                },
            ],
            flashcards: [
                { question: 'What is Unsupervised Learning?', answer: 'Finding patterns or clusters in unlabeled data without target labels y.' },
                { question: 'What does K represent in K-Means?', answer: 'The number of clusters to form.' },
            ],
            mcqs: [
                {
                    question: 'Which metric helps find the optimal number of clusters by measuring cluster separation?',
                    options: [
                        { text: 'Silhouette Score', isCorrect: true },
                        { text: 'Accuracy', isCorrect: false },
                        { text: 'R2 Score', isCorrect: false },
                        { text: 'MAE', isCorrect: false },
                    ],
                    explanation: 'Silhouette Score ranges from -1 to 1, measuring how similar points are to their own cluster versus other clusters.',
                },
            ],
        },
        {
            title: 'Module 21: Simplifying Complex Data (PCA)',
            description: 'Shrink large tables of data while keeping the most important patterns.',
            contents: [
                {
                    type: 'text',
                    title: 'Dimensionality Reduction with PCA',
                    content: "If your dataset has 50 columns, it is hard to plot or process. Principal Component Analysis (PCA) combines 50 columns down to 2 or 3 super-columns while keeping most of the information!",
                },
                {
                    type: 'code',
                    title: 'Using PCA',
                    content: 'from sklearn.decomposition import PCA\nfrom sklearn.datasets import load_iris\n\niris = load_iris()\npca = PCA(n_components=2)\nX_reduced = pca.fit_transform(iris.data)\n\nprint("Original shape:", iris.data.shape)\nprint("Reduced shape:", X_reduced.shape)\nprint("Variance explained:", pca.explained_variance_ratio_)',
                    language: 'python',
                },
            ],
            flashcards: [
                { question: 'What does PCA stand for?', answer: 'Principal Component Analysis.' },
                { question: 'Why do we use PCA?', answer: 'To reduce feature columns while retaining maximum original variance/information.' },
            ],
            mcqs: [
                {
                    question: 'What does pca.explained_variance_ratio_ tell you?',
                    options: [
                        { text: 'The percentage of information preserved by each component', isCorrect: true },
                        { text: 'The accuracy score of the model', isCorrect: false },
                        { text: 'The number of missing rows', isCorrect: false },
                        { text: 'The time taken to run code', isCorrect: false },
                    ],
                    explanation: 'explained_variance_ratio_ quantifies how much total variance each principal component captures.',
                },
            ],
        },
        {
            title: 'Module 22: Project 4: Customer Segmentation',
            description: 'Group customers into smart shopping groups for targeted marketing.',
            contents: [
                {
                    type: 'text',
                    title: 'Hands-on Project 4 Goal',
                    content: "You will take customer transaction features, apply StandardScaler, compress data with PCA, and run K-Means to discover distinct customer groups (e.g. VIP Spenders vs Occasional Buyers).",
                },
                {
                    type: 'code',
                    title: 'Customer Segmentation Code',
                    content: 'from sklearn.datasets import make_blobs\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.decomposition import PCA\nfrom sklearn.cluster import KMeans\n\nX, _ = make_blobs(n_samples=300, centers=3, n_features=5, random_state=42)\n\nX_scaled = StandardScaler().fit_transform(X)\nX_pca = PCA(n_components=2).fit_transform(X_scaled)\n\nkmeans = KMeans(n_clusters=3, random_state=42).fit(X_pca)\nprint("Segment sizes:", [list(kmeans.labels_).count(i) for i in range(3)])',
                    language: 'python',
                },
            ],
            flashcards: [
                { question: 'What is customer segmentation?', answer: 'Grouping customers with similar buying habits into target personas using clustering.' },
            ],
            mcqs: [
                {
                    question: 'Why scale features before running PCA and K-Means?',
                    options: [
                        { text: 'Both algorithms rely on variance/distance calculations that require equal scales', isCorrect: true },
                        { text: 'To delete negative numbers', isCorrect: false },
                        { text: 'To convert numbers to text', isCorrect: false },
                        { text: 'Scaling is optional and has no impact', isCorrect: false },
                    ],
                    explanation: 'Features on larger numerical scales dominate variance in PCA and distance in K-Means.',
                },
            ],
        },
        {
            title: 'Module 23: Anomaly Detection & Intro to Neural Networks',
            description: 'Find unusual outliers and build simple brain-like neural network models.',
            contents: [
                {
                    type: 'text',
                    title: 'Outliers & Neural Networks',
                    content: "Anomaly Detection: Spotting strange outliers (like fraudulent credit card charges) using `IsolationForest`.\n\nNeural Networks: `MLPClassifier` (Multi-Layer Perceptron) mimics layers of biological neurons to learn complex non-linear patterns.",
                },
                {
                    type: 'code',
                    title: 'Training an MLPClassifier',
                    content: 'from sklearn.neural_network import MLPClassifier\nfrom sklearn.datasets import load_iris\n\niris = load_iris()\nmlp = MLPClassifier(hidden_layer_sizes=(10, 10), max_iter=500, random_state=42)\nmlp.fit(iris.data, iris.target)\nprint("Neural Net Accuracy:", mlp.score(iris.data, iris.target))',
                    language: 'python',
                },
            ],
            flashcards: [
                { question: 'What does MLP stand for in Scikit-Learn?', answer: 'Multi-Layer Perceptron (a feedforward artificial neural network).' },
            ],
            mcqs: [
                {
                    question: 'Which Scikit-Learn class is designed specifically for anomaly detection?',
                    options: [
                        { text: 'IsolationForest', isCorrect: true },
                        { text: 'LinearRegression', isCorrect: false },
                        { text: 'SimpleImputer', isCorrect: false },
                        { text: 'LabelEncoder', isCorrect: false },
                    ],
                    explanation: 'IsolationForest isolates anomalies by randomly partitioning feature space.',
                },
            ],
        },
        {
            title: 'Module 24: Capstone Project: Build & Share Your ML App',
            description: 'Combine everything you learned into a complete AI app you can show off!',
            contents: [
                {
                    type: 'text',
                    title: 'Final Capstone Project Milestone',
                    content: "You made it to the final module! In this capstone project, you will combine all 23 modules to build a production model, save it, and load it in an interactive app script (using Streamlit or a Python script on Colab/Pydroid 3).\n\nCongratulations on completing your journey into AI & Machine Learning with Scikit-Learn!",
                },
                {
                    type: 'code',
                    title: 'Final App Inference Script Template',
                    content: 'import joblib\nimport pandas as pd\n\nprint("=== Welcome to My AI Predictor App ===")\n# Load trained pipeline\n# model = joblib.load("credit_model.joblib")\n\n# Sample input from user\nsample_input = {"Income": 65000, "CreditScore": 720, "Debt": 5000}\nprint("Input Payload:", sample_input)\nprint("Model ready for real-time predictions!")',
                    language: 'python',
                },
            ],
            flashcards: [
                { question: 'What is the best way to keep building your ML skills after this course?', answer: 'Build real-world projects, compete on Kaggle, and deploy your models as web apps.' },
            ],
            mcqs: [
                {
                    question: 'What is the final step in a complete Machine Learning project workflow?',
                    options: [
                        { text: 'Deploying the model to production and monitoring predictions', isCorrect: true },
                        { text: 'Deleting your Python code', isCorrect: false },
                        { text: 'Formating your hard drive', isCorrect: false },
                        { text: 'Memorizing the documentation', isCorrect: false },
                    ],
                    explanation: 'Deploying the trained model allows users or API clients to get predictions in real time.',
                },
            ],
        },
    ],
};
const run = async () => {
    try {
        await (0, db_config_1.connectDB)();
        console.log('Checking for existing AI & Machine Learning course...');
        const existingCourse = await course_model_1.default.findOne({ title: aiMlCourseSeed.course.title });
        if (existingCourse) {
            console.log(`Found existing course "${existingCourse.title}". Cleaning up old topics and related data...`);
            const existingTopics = await topic_model_1.default.find({ course: existingCourse._id });
            const existingTopicIds = existingTopics.map((t) => t._id);
            await Promise.all([
                flashcard_model_1.default.deleteMany({ topic: { $in: existingTopicIds } }),
                mcq_model_1.default.deleteMany({ topic: { $in: existingTopicIds } }),
                topic_model_1.default.deleteMany({ course: existingCourse._id }),
                course_model_1.default.deleteOne({ _id: existingCourse._id }),
            ]);
            console.log('Old course version removed.');
        }
        console.log('Creating "AI & Machine Learning with Scikit-Learn" course...');
        const course = await course_model_1.default.create(aiMlCourseSeed.course);
        // Create 3 structured Chapters for the curriculum
        const chapters = await chapter_model_1.default.create([
            {
                course: course._id,
                title: 'Introduction to AI & Environment Setup',
                description: 'Understand the fundamentals of machine learning, Google Colab, VS Code, and mobile environments.',
                order: 0,
            },
            {
                course: course._id,
                title: 'Data Preparation, Pandas & Regression Models',
                description: 'Clean, encode, scale datasets, and train linear and polynomial regression predictors.',
                order: 1,
            },
            {
                course: course._id,
                title: 'Classification, Decision Trees & Model Evaluation',
                description: 'Train classification models, decision trees, random forests, and evaluate with confusion matrices.',
                order: 2,
            },
        ]);
        let totalTopics = 0;
        let totalFlashcards = 0;
        let totalMcqs = 0;
        for (let i = 0; i < aiMlCourseSeed.topics.length; i++) {
            const topicSeed = aiMlCourseSeed.topics[i];
            const chapterId = i < 2 ? chapters[0]._id : i < 5 ? chapters[1]._id : chapters[2]._id;
            const topic = await topic_model_1.default.create({
                course: course._id,
                chapter: chapterId,
                title: topicSeed.title,
                description: topicSeed.description,
                contents: topicSeed.contents,
                order: i + 1,
                xp: 50,
                isPublished: true,
            });
            totalTopics++;
            if (topicSeed.flashcards.length > 0) {
                await flashcard_model_1.default.insertMany(topicSeed.flashcards.map((f) => ({ topic: topic._id, question: f.question, answer: f.answer })));
                totalFlashcards += topicSeed.flashcards.length;
            }
            if (topicSeed.mcqs.length > 0) {
                await mcq_model_1.default.insertMany(topicSeed.mcqs.map((m) => ({ topic: topic._id, question: m.question, options: m.options, explanation: m.explanation })));
                totalMcqs += topicSeed.mcqs.length;
            }
        }
        console.log('\n========================================');
        console.log('AI/ML Course seeded successfully into database!');
        console.log('========================================');
        console.log(`Created course "${course.title}" (ID: ${course._id})`);
        console.log(`Modules/Topics: ${totalTopics}`);
        console.log(`Flashcards: ${totalFlashcards}`);
        console.log(`MCQs: ${totalMcqs}`);
        console.log('========================================\n');
        await mongoose_1.default.connection.close();
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding AI/ML course:', error);
        process.exit(1);
    }
};
run();

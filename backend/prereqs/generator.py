import pandas as pd
import random

department_abbreviations = {
    "African American Studies": "AAS",
    "African Studies": "AFS",
    "American Studies": "AMS",
    "Anthropology": "ANT",
    "Atmospheric and Oceanic Sciences": "AOS",
    "Applied and Computational Mathematics": "APC",
    "Arabic": "ARA",
    "Architecture": "ARC",
    "Art and Archaeology": "ART",
    "Asian American Studies": "ASA",
    "American Sign Language": "ASL",
    "Astrophysical Sciences": "AST",
    "Atelier": "ATL",
    "Bosnian-Croatian-Serbian": "BCS",
    "Bengali": "BNG",
    "Chemical and Biological Engineering": "CBE",
    "Center for Digital Humanities": "CDH",
    "Civil and Environmental Engineering": "CEE",
    "Comparative German Studies": "CGS",
    "Chinese": "CHI",
    "Chemistry": "CHM",
    "Center for Human Values": "CHV",
    "Classics": "CLA",
    "Comparative Literature": "COM",
    "Computer Science": "COS",
    "Creative Writing": "CWR",
    "Czech": "CZE",
    "Dance": "DAN",
    "East Asian Studies": "EAS",
    "Electrical and Computer Engineering": "ECE",
    "Economics": "ECO",
    "European Cultural Studies": "ECS",
    "Ecology and Evolutionary Biology": "EEB",
    "Engineering Interdisciplinary Courses": "EGR",
    "Energy Studies Certificate Program": "ENE",
    "English": "ENG",
    "Entrepreneurship Certificate Program": "ENT",
    "Environmental Studies Certificate Program": "ENV",
    "Contemporary European Politics and Society Certificate Program": "EPS",
    "Finance Certificate Program": "FIN",
    "French and Italian": "FRE",
    "Freshman Seminars": "FRS",
    "Geosciences": "GEO",
    "German": "GER",
    "Germanic Languages and Literatures": "GEZ",
    "Global Health and Health Policy Certificate Program": "GHP",
    "Gender and Sexuality Studies": "GSS",
    "Hebrew": "HEB",
    "Hindi": "HIN",
    "History": "HIS",
    "Hellenic Studies": "HLS",
    "History of Science": "HOS",
    "Humanities Council Interdisciplinary Courses": "HUM",
    "Integrated Science Curriculum": "ISC",
    "Italian": "ITA",
    "Judaic Studies": "JDS",
    "Japanese": "JPN",
    "Journalism Certificate Program": "JRN",
    "Korean": "KOR",
    "Lao": "LAO",
    "Latin American Studies": "LAS",
    "Latin": "LAT",
    "Lewis Center for the Arts": "LCA",
    "Linguistics": "LIN",
    "Mechanical and Aerospace Engineering": "MAE",
    "Mathematics": "MAT",
    "Medieval Studies": "MED",
    "Media and Modernity Certificate Program": "MOD",
    "Modern Greek": "MOG",
    "Molecular Biology": "MOL",
    "Master in Public Policy Program": "MPP",
    "Materials Science and Engineering Certificate Program": "MSE",
    "Music Theater Certificate Program": "MTD",
    "Music": "MUS",
    "Near Eastern Studies": "NES",
    "Neuroscience Certificate Program": "NEU",
    "Operations Research and Financial Engineering": "ORF",
    "Princeton Atelier Workshop Courses": "PAW",
    "Persian": "PER",
    "Philosophy": "PHI",
    "Physics": "PHY",
    "Polish": "PLS",
    "Politics": "POL",
    "Population Studies Certificate Program": "POP",
    "Portuguese": "POR",
    "Psychology": "PSY",
    "Quantitative and Computational Biology Certificate Program": "QCB",
    "Religion": "REL",
    "Renaissance and Early Modern Studies Certificate Program": "RES",
    "Russian": "RUS",
    "Sanskrit": "SAN",
    "Slavic Languages and Literatures": "SLA",
    "Statistics and Machine Learning Certificate Program": "SML",
    "Sociology": "SOC",
    "Spanish": "SPA",
    "School of Public and International Affairs": "SPI",
    "Science, Technology, and Environmental Policy Certificate Program": "STC",
    "Swahili": "SWA",
    "Theater": "THR",
    "Teacher Preparation Certificate Program": "TPP",
    "Translation and Intercultural Communication Certificate Program": "TRA",
    "Turkish": "TUR",
    "Twi": "TWI",
    "Ukrainian": "UKR",
    "Urban Studies Certificate Program": "URB",
    "Urdu": "URD",
    "Visual Arts": "VIS",
    "Writing Seminars": "WRI"
}

# List of subjects based on the given departments
subjects_list = [
    "probability", "statistics", "algorithms", "computer science", "coding", "calculus",
    "linear algebra", "optimization", "numerical analysis", "stochastic processes", "physics",
    "chemistry", "biology", "economics", "engineering",
    "environmental science", "materials science", "molecular biology", "neuroscience",
    "quantitative biology", "atmospheric science", "computational mathematics",
    "sociology", "psychology", "ethics", "art history", "music theory", "political science",
    "global health", "gender studies", "African American studies", "African studies",
    "American studies", "anthropology", "Arabic", "architecture", "Asian American studies",
    "astrophysics", "Bosnian-Croatian-Serbian", "Bengali", "digital humanities",
    "comparative literature", "creative writing", "Czech", "dance", "East Asian studies",
    "European studies", "ecology", "English", "entrepreneurship", "environmental studies",
    "European politics", "finance", "French and Italian", "geosciences", "German",
    "Germanic languages", "Hellenic studies", "history of science", "humanities",
    "Italian", "Judaic studies", "Japanese", "journalism", "Korean", "Lao",
    "Latin American studies", "Latin", "linguistics", "mechanical engineering",
    "mathematics", "medieval studies", "modern Greek", "public policy", "music",
    "Near Eastern studies", "Persian", "philosophy", "Polish", "population studies",
    "Portuguese", "religion", "Renaissance studies", "Russian", "Sanskrit", "Slavic languages",
    "Spanish", "public affairs", "environmental policy", "Swahili", "theater",
    "teacher preparation", "translation", "Turkish", "Twi", "Ukrainian", "urban studies", "Urdu",
    "visual arts", "writing"
]

# Extend subjects list based on departments subtopics
subjects_list.extend([
    # African American Studies
    "African American literature", "Black history", "racial politics"

    # Anthropology
    "archeology", "cultural anthropology", "physical anthropology"

    # Atmospheric and Oceanic Sciences
    "climatology", "meteorology", "oceanography"

    # Applied and Computational Mathematics
    "numerical analysis", "optimization", "stochastic processes"

    # Arabic
    "Arabic literature", "Islamic studies", "Middle Eastern history"

    # Architecture
    "architectural history", "building technology", "urban design"

    # Art and Archaeology
    "art conservation", "prehistoric art", "visual culture"

    # Asian American Studies
    "Asian American history", "Asian diaspora", "ethnic studies"

    # American Sign Language
    "ASL grammar", "deaf culture", "sign linguistics"

    # Astrophysical Sciences
    "cosmology", "galactic dynamics", "stellar physics"

    # Chemical and Biological Engineering
    "bioprocesses", "chemical kinetics", "process engineering"

    # Civil and Environmental Engineering
    "environmental engineering", "structural engineering", "water resources"

    # Comparative Literature
    "cross-cultural studies", "literary theory", "world literature"

    # Computer Science
    "algorithms", "machine learning", "software engineering"

    # Creative Writing
    "fiction writing", "poetry writing", "scriptwriting"

    # Dance
    "choreography", "dance history", "performance studies"

    # East Asian Studies
    "Chinese philosophy", "Japanese history", "Korean culture"

    # Electrical and Computer Engineering
    "VLSI design", "embedded systems", "signal processing"

    # Economics
    "behavioral economics", "macroeconomics", "microeconomics"

    # Ecology and Evolutionary Biology
    "conservation biology", "genetic evolution", "population ecology"

    # Engineering Interdisciplinary Courses
    "data science", "robotics", "systems engineering"

    # Energy Studies Certificate Program
    "energy economics", "energy policy", "renewable energy"

    # European Cultural Studies
    "European history", "European languages", "European politics"

    # Finance Certificate Program
    "corporate finance", "financial markets", "investment theory"

    # French and Italian
    "French literature", "Italian Renaissance", "Romance linguistics"

    # Geosciences
    "geology", "paleontology", "seismology"

    # German
    "German literature", "German philosophy", "Germanic linguistics"

    # Global Health and Health Policy
    "epidemiology", "healthcare management", "public health ethics"

    # Gender and Sexuality Studies
    "feminist theory", "gender roles", "queer studies"

    # Hebrew
    "Biblical Hebrew", "Hebrew literature", "Modern Hebrew"

    # Hindi
    "Hindi grammar", "Hindi literature", "Indian history"

    # History
    "historiography", "medieval history", "modern history"

    # Hellenic Studies
    "Byzantine history", "Greek philosophy", "ancient Greek"

    # History of Science
    "history of medicine", "history of technology", "scientific revolution"

    # Humanities
    "art history", "literature", "philosophy"

    # Integrated Science
    "computational science", "interdisciplinary science", "systems biology"

    # Italian
    "Italian cinema", "Italian history", "Italian literature"

    # Judaic Studies
    "Holocaust studies", "Jewish history", "Jewish philosophy"

    # Japanese
    "Japanese history", "Japanese linguistics", "Japanese literature"

    # Journalism
    "broadcast journalism", "investigative journalism", "media ethics"

    # Korean
    "Korean history", "Korean linguistics", "Korean literature"

    # Latin American Studies
    "Latin American history", "Latin American literature", "Latin American politics"

    # Latin
    "Classical Latin", "Latin literature", "Medieval Latin"

    # Linguistics
    "phonetics", "semantics", "syntax"

    # Mechanical and Aerospace Engineering
    "aerodynamics", "fluid mechanics", "thermodynamics"

    # Mathematics
    "algebra", "calculus", "geometry"

    # Medieval Studies
    "medieval history", "medieval literature", "medieval philosophy"

    # Molecular Biology
    "biochemistry", "cell biology", "genetics"

    # Music
    "composition", "music history", "music theory"

    # Near Eastern Studies
    "Islamic studies", "Middle Eastern languages", "ancient Near East"

    # Neuroscience
    "behavioral neuroscience", "cognitive neuroscience", "neural networks"

    # Operations Research and Financial Engineering
    "financial engineering", "operations management", "stochastic modeling"

    # Philosophy
    "ethics", "logic", "metaphysics"

    # Physics
    "particle physics", "quantum mechanics", "relativity"

    # Politics
    "international relations", "political theory", "public policy"

    # Psychology
    "clinical psychology", "cognitive psychology", "social psychology"

    # Religion
    "religious ethics", "theology", "world religions"

    # Russian
    "Russian history", "Russian linguistics", "Russian literature"

    # Sociology
    "social theory", "sociology of religion", "urban sociology"

    # Spanish
    "Latin American literature", "Spanish linguistics", "Spanish literature"

    # Theater
    "dramatic theory", "playwriting", "theater history"

    # Visual Arts
    "graphic design", "painting", "sculpture"

    # Writing
    "creative writing", "rhetoric", "technical writing"
])

# TODO: Make sure to add all relevant courses otherwise model will basically just guess if it's required.
# Extend subjects list by popular courses
subjects_list.extend([
    # McGraw courses
    "CHM 201", "CHM 202", "CHM 207", "CHM 215", "CHM 301", "CHM 304", "COS 126",
    "COS 240", "COS 340", "COS 217", "COS 226", "ECO 100", "ECO 101", "ECO 202", 
    "EGR 151", "EGR 152", "EGR 153", "EGR 154", "EGR 156", "MAT 103", "MAT 104", 
    "MAT 175", "MAT 201", "MAT 202", "MAT 203", "MAT 204", "MAT 210", "MAT 214", 
    "MAT 215", "MAT 216", "MAT 217", "MAT 218", "MOL 214", "ORF 245", "ORF 309", 
    "ORF 335", "ORF 307", "ORF 363", "PHY 101", "PHY 102","PHY 103", "PHY 104", 
    "PHY 105", "PHY 106", "PHY 108", "POL 345", "PSY 251", "SPI 200", "R-Programming"
])

# Expanding the sentence structures for prerequisites
positive_phrases = [
    "{} or equivalent.",
    "Students must have a basic understanding of {}.",
    "A prerequisite is a solid foundation in {}.",
    "Knowledge of {} is required.",
    "Students are expected to have completed courses in {}.",
    "Candidates should have a grasp of {}.",
    "An understanding of {} is necessary.",
    "A background in {} is essential.",
    "The course assumes familiarity with {}.",
    "A strong background in {} is essential.",
    "A strong grasp of {} is crucial.",
    "Prior coursework in {} is mandatory.",
    "Knowledge of {} assumed.",
    "Students are expected to have completed {}.",
    "Familiarity with {} is a prerequisite.",
    "Candidates must have taken a course in {}.",
    "Proficiency in {} is required for this course.",
    "Students must have completed {} or an equivalent course.",
    "This course assumes prior knowledge in {}.",
    "Enrollment requires successful completion of {}.",
    "{} is a hard prerequisite for this course.",
    "An interview confirming proficiency in {} is required.",
    "Completion of {} is a must.",
    "Prior experience with {} is compulsory.",
    "Students without {} will not be considered.",
    "It's a requirement to have taken {}.",
    "Students are required to have prior experience in {}.",
    "Candidates should be proficient in {}.",
    "Meeting the professor to discuss your background in {} is mandatory."
]

# Expanding the sentence structures for non-prerequisites
negative_phrases = [
    "None.",
    "No prerequisites.",
    "N/A",
    "There are no prerequisites, but {} is beneficial.",
    "{} is suggested but not required.",
    "No previous coursework in {} is required.",
    "Students may take this course without any knowledge of {}.",
    "{} is not a required prerequisite for this course.",
    "A solid grasp of {} is highly recommended.",
    "While {} is beneficial, it is not mandatory.",
    "No prior coursework in {} is necessary.",
    "It's permissible to enroll without having taken {}.",
    "{} can be taken concurrently with this course.",
    "This course is open to students without a background in {}.",
    "Lack of experience in {} will not disqualify you.",
    "Though helpful, {} is not a pre-condition for enrollment.",
    "Meeting the professor to discuss your background in {} is optional but advised.",
    "An interview is optional for those without a background in {}.",
    "Though {} is advised, alternative experiences can also be considered.",
    "Having a background in {} is not strictly enforced.",
    "No prior knowledge of {} is assumed.",
    "Prior knowledge of {} is useful.",
    "Prior knowledge of {} is useful but not required",
    "Having a background in {} is not necessary.",
    "A good understanding of {} is not a prerequisite.",
    "While {} is taught, no prior knowledge is required.",
    "{} may be taken concurrently.",
    "It's not necessary to have completed {}.",
    "{} is not mandatory, but it's a plus.",
    "{} would help.",
    "You don't need {}.",
    "Though not compulsory, {} will be beneficial.",
    "{} is optional but strongly recommended."
]

# Generate the synthetic dataset

# TODO: Add these data augmentation techniques eventually to strengthen dataset:
# Back Translation: Translate the sentence to another language and then back to English. This usually changes the phrasing but keeps the meaning intact.
# Synonym Replacement: Replace words in the sentence with their synonyms. Be careful to maintain the original meaning and grammatical correctness.
# Sentence Shuffling: For longer sentences with multiple clauses, you can shuffle the order of the clauses.
# Adding Noise: Introduce typos or grammatical errors, within reason. This can make your model more robust.
# Random Insertion: Insert synonyms of existing non-stop words into the sentence at random positions.
# Random Deletion: Randomly remove non-essential words from the sentence.
# Useful Python library for synonym replacements: NLTK


def generate_sentences(subjects, phrases, label, num_samples):
    return [(random.choice(phrases).format(random.choice(subjects)), label) for _ in range(num_samples)]

# Total samples per label
num_samples = 500000  # 50,000 samples in total (25,000 for each label)

# Generate positive and negative samples
positive_samples = generate_sentences(
    subjects_list, positive_phrases, 1, num_samples)
negative_samples = generate_sentences(
    subjects_list, negative_phrases, 0, num_samples)

# Combine and shuffle the samples
all_samples = positive_samples + negative_samples
random.shuffle(all_samples)

# Create a DataFrame
df = pd.DataFrame(all_samples, columns=['sentence', 'label'])

# Save the dataset to a CSV file
dataset_path = '/Users/minhtri/Desktop/Princeton/COS/COS 333/compass/backend/large-prereq-classification-dataset.csv'
df.to_csv(dataset_path, index=False)

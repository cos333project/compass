import spacy
from spacy.matcher import PhraseMatcher

# Initialize Spacy and matcher
nlp = spacy.load('en_core_web_trf')
matcher = PhraseMatcher(nlp.vocab, attr='LOWER')

# Define terms and their corresponding courses
terms = [
    'probability',
    'statistics',
    'algorithms',
    'computer science fundamentals',
    'multivariable calculus',
    'linear algebra',
    'physics',
    'chemistry',
    'biology',
    'microeconomics',
    'literature',
    'philosophy',
    'sociology',
    'psychology',
    'ethics',
    'art history',
]

keyword_to_course = {
    'probability': 'ORF 309',
    'statistics': 'ORF 245',
    'algorithms': 'COS 226',
    'computer science fundamentals': 'COS 126',
    'multivariable calculus': 'MAT 201',
    'linear algebra': 'MAT 202',
    'physics': 'PHY 103',
    'chemistry': 'CHM 201',
    'biology': 'MOL 214',
    'microeconomics': 'ECO 100',
    'literature': 'ENG 101',
    'philosophy': 'PHI 201',
    'sociology': 'SOC 101',
    'psychology': 'PSY 101',
    'ethics': 'PHI 202',
    'art history': 'ART 100',
}

# Add patterns to the matcher
patterns = [nlp.make_doc(text) for text in terms]
matcher.add('TerminologyList', patterns)

# Test sentences
test_sentencess = [
    'Students must have a basic understanding of algorithms.',
    'A prerequisite is a solid foundation in probability.',
    'Knowledge of statistics is required.',
    'Students are expected to have completed courses in algorithms and statistics.',
    'Candidates should have a grasp of computer science fundamentals.',
    'An understanding of probability or statistics is necessary.',
    'While not mandatory, a comprehension of algorithms and computer science basics would be beneficial.',
    'Prospective students should have dabbled in the realms of probability, statistics, or equivalent mathematical disciplines.',
    "It's presumed that enrollees are not complete novices and have some experience in algorithms.",
    "It's advisable to be acquainted with the rudiments of probability or similar statistical methods.",
    'A background in calculus and linear algebra is essential.',
    'The course assumes familiarity with basic economics and political science.',
    'Candidates should be well-versed in history and literature.',
    'An introductory course in philosophy or ethics is recommended.',
    'Understanding the basics of psychology and sociology will be beneficial.',
    'Some exposure to art history or music theory is useful but not mandatory.',
]

test_sentences = [
    'A good understanding of probability is not a prerequisite.',
    'While algorithms are taught, no prior knowledge is required.',
    'Statistics may be taken concurrently.',
    "It's not necessary to have completed linear algebra.",
    "Physics is not mandatory, but it's a plus.",
    "You don't need computer science fundamentals.",
    'Art history or a similar course should have been completed, or you can take it concurrently.',
    'Though not compulsory, calculus will be beneficial.',
    'Microeconomics is optional but strongly recommended.',
    "You might think psychology is a requirement, but it's not.",
]

# Loop through each test sentence
for text in test_sentences:
    doc = nlp.make_doc(text)
    matches = matcher(doc)
    matched_courses = [
        keyword_to_course.get(doc[start:end].text.lower())
        for match_id, start, end in matches
    ]
    print(f"For sentence: '{text}', matched courses are: {matched_courses}")

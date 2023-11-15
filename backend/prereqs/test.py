from joblib import load
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score
import pandas as pd

# Load the pretrained Logistic Regression model
prereq_classifier = load('prereq_classifier.joblib')

# Load the TF-IDF vectorizer
vectorizer = TfidfVectorizer()
vectorizer = load('prereq_vectorizer.joblib')

# Load the benchmark data
df_benchmark = pd.read_csv(
    '/Users/minhtri/Desktop/Princeton/COS/COS 333/compass/backend/prereqs/benchmark.csv',
    na_values=[],
    keep_default_na=False,
)

# Vectorize the benchmark sentences
X_test = vectorizer.transform(df_benchmark['sentence'])
y_test = df_benchmark['label']

# Make predictions on the benchmark data
y_pred = prereq_classifier.predict(X_test)

# Calculate and print the accuracy
accuracy = accuracy_score(y_test, y_pred)

# Print results in a box
print('=' * 38)
print(f"||{'Final Benchmark Accuracy:':^34}||")
print(f"||{f'{accuracy * 100:.2f}%':^34}||")
print('=' * 38)

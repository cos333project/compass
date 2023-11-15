import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from joblib import dump

# -----------------------------------------------------------------------------#


def load_data(train_path, benchmark_path):
    """
    Load training and benchmark data from CSV files.

    Parameters:
        train_path (str): Path to the training data CSV file.
        benchmark_path (str): Path to the benchmark data CSV file.

    Returns:
        tuple: A tuple containing training and benchmark dataframes.
    """
    df_train = pd.read_csv(train_path, na_values=[], keep_default_na=False)
    df_benchmark = pd.read_csv(benchmark_path, na_values=[], keep_default_na=False)
    return df_train, df_benchmark


# -----------------------------------------------------------------------------#


def init(df_train, df_benchmark):
    """
    Initialize a TF-IDF vectorizer and transform the data.

    Parameters:
        df_train (DataFrame): Training data.
        df_benchmark (DataFrame): Benchmark data.

    Returns:
        tuple: A tuple containing transformed training and benchmark data.
    """
    vectorizer = TfidfVectorizer()
    X_train = vectorizer.fit_transform(df_train['sentence'])
    X_test = vectorizer.transform(df_benchmark['sentence'])
    y_train = df_train['label']
    y_test = df_benchmark['label']
    return X_train, X_test, y_train, y_test, vectorizer


# -----------------------------------------------------------------------------#


def train(X_train, y_train):
    """
    Train a logistic regression classifier.

    Parameters:
        X_train (csr_matrix): Transformed training data.
        y_train (Series): Training labels.

    Returns:
        LogisticRegression: Trained logistic regression model.
    """
    log_reg = LogisticRegression()
    log_reg.fit(X_train, y_train)
    return log_reg


# -----------------------------------------------------------------------------#


def make_and_print_predictions(sample_text, vectorizer, log_reg):
    """
    Make predictions on sample text and print the results.

    Parameters:
        sample_text (list): List of sample sentences.
        vectorizer (TfidfVectorizer): Initialized TF-IDF vectorizer.
        log_reg (LogisticRegression): Trained logistic regression model.
    """
    X_sample = vectorizer.transform(sample_text)
    predictions = log_reg.predict(X_sample)
    label_map = {0: 'No prereqs required', 1: 'Prereq required'}

    for sentence, label_idx in zip(sample_text, predictions):
        print(f"'{sentence}' -> {label_map[label_idx]}")


# -----------------------------------------------------------------------------#

if __name__ == '__main__':
    # Load your training and benchmark data
    df_train, df_benchmark = load_data(
        '/Users/minhtri/Desktop/Princeton/COS/COS 333/compass/backend/prereqs/large-prereq-classification-dataset.csv',
        '/Users/minhtri/Desktop/Princeton/COS/COS 333/compass/backend/prereqs/benchmark.csv',
    )

    # Initialize TF-IDF Vectorizer and transform data
    X_train, X_test, y_train, y_test, vectorizer = init(df_train, df_benchmark)

    # Train Logistic Regression model
    prereq_classifier = train(X_train, y_train)

    # Save the model and vectorizer
    dump(prereq_classifier, 'prereq_classifier.joblib')
    dump(vectorizer, 'prereq_vectorizer.joblib')

    # To load the model, import load from joblib and run
    # log_reg = load('log_reg_model.joblib')

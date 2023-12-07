import requests # use async
from bs4 import BeautifulSoup
import os
import json # use json
from base64 import b64decode

# Load environment variables (equivalent to dotenv in Node.js)
from dotenv import load_dotenv
load_dotenv()

# Define session cookie and other variables
session_cookie = os.getenv('SESSION_COOKIE')
user_agent = 'Princeton Courses (https://www.princetoncourses.com)'

def construct_evaluation_url(course_id, semester):
    base_url = 'https://registrarapps.princeton.edu/course-evaluation'
    return f'{base_url}?courseinfo={course_id}&terminfo={semester}'

def load_page(term, course_id, callback):
    url = construct_evaluation_url(course_id, term)
    headers = {'Cookie': f'PHPSESSID={session_cookie};', 'User-Agent': user_agent}

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print('Error in request')
        return

    callback(response.text)

def get_course_evaluation_data(semester, course_id, external_callback):
    def internal_callback(data):
        soup = BeautifulSoup(data, 'html.parser')
        # Update the condition based on the new page's title or other identifying features
        if 'Course Evaluation Results' not in soup.title.string:
            print('Scraping the evaluations failed. Your session cookie was probably bad. You must provide a valid session cookie.')
            print('Goodbye.')
            return

        print(f'\tReceived data for course {course_id} in semester {semester}.')

        if not soup.find('td', {'bgcolor': 'Gainsboro'}).find(
            'a', href=f'terminfo={semester}'
        ):
            external_callback({}, [])
            return
        

        # Get Chart Data
        b64_encoded_chart_data = soup.find('input', {'id': 'chart_settings'}).get(
            'value'
        )
        scores = {}
        if b64_encoded_chart_data:
            chart_data = b64decode(b64_encoded_chart_data).decode('ascii')
            chart = json.loads(chart_data)

            x_items = chart['PlotArea']['XAxis']['Items']
            y_items = chart['PlotArea']['ListOfSeries'][0]['Items']
            for index, item in enumerate(x_items):
                scores[item['Text']] = float(y_items[index]['YValue'])

        # Extract student comments
        comments = [
            comment.text.replace('\n', ' ').replace('\r', ' ').strip()
            for comment in soup.select('table:last-child tr:not(:first-child) td')
        ]

        external_callback(scores, comments)

    load_page(semester, course_id, internal_callback)

def construct_evaluation_url(course_id, semester):
    base_url = 'https://registrarapps.princeton.edu/course-evaluation'
    return f'{base_url}?courseinfo={course_id}&terminfo={semester}'

# Example usage
url = construct_evaluation_url('COS126', '2023Spring')
print(url)  # Output: https://registrarapps.princeton.edu/course-evaluation?courseinfo=COS126&terminfo=2023Spring


# Example usage
def handle_evaluation_data(scores, comments):
    print('Scores:', scores)
    print('Comments:', comments)


get_course_evaluation_data('1242', '002051', handle_evaluation_data)

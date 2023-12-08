import sys
import re
import time
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, WebDriverException
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from concurrent.futures import ThreadPoolExecutor
from selenium.webdriver.chrome.options import Options

# initialize
options = Options()
# options.add_argument('--headless')
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
driver.set_page_load_timeout(100)

# Navigate and initialize
driver.get('https://registrar.princeton.edu/course-offerings?term=1242')

# Wait for the 'Search' button and click it to display all courses
WebDriverWait(driver, 10).until(EC.element_to_be_clickable(
    (By.ID, 'classes-search-button'))).click()


# Wait for the navigation to the last page of search results
WebDriverWait(driver, 10).until(EC.element_to_be_clickable(
    (By.CSS_SELECTOR, 'div.pager a:last-child'))).click()

# Wait for the course list to load
# Wait for the course list to load
wait = WebDriverWait(driver, 5)
wait.until(EC.presence_of_all_elements_located(
    (By.CSS_SELECTOR, 'td.class-info')))

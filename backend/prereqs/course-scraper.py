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

# A mapping from free text to course numbers
text_to_course = {
    "basic statistics": "ORF 245",
    "probability": "ORF 309",
    "multivariable calculus": "MAT 201",
    # Add more mappings as needed
}

def process_prerequisites(prerequisite_text):
    # course_numbers = re.findall(r'([A-Z]{2,4})\s*([\d]{1,3}[A-Z]?)', prerequisite_text)
    course_numbers = re.findall(r'(?<![/.])([A-Z]{2,4})\s*([\d]{1,3}[A-Z]?)(?![/.])', prerequisite_text)
    course_numbers = [f"{dept}{num}" for dept, num in course_numbers]
    
    additional_requirements = []
    
    for text, course in text_to_course.items():
        if text in prerequisite_text.lower():
            course_numbers.append(course)
            
    if "permission of the instructor" in prerequisite_text.lower():
        additional_requirements.append("Permission of the instructor")
        
    if not course_numbers:
        return {'course_numbers': [], 'additional_requirements': [prerequisite_text]}
    
    return {
        'course_numbers': list(set(course_numbers)),  # Remove duplicates
        'additional_requirements': additional_requirements
    }

# Initialize WebDriver
options = webdriver.ChromeOptions()
options.add_argument('--headless')  # No GUI
service = Service(ChromeDriverManager().install())
service.start()
driver = webdriver.Remote(service.service_url, options=options)
driver.set_page_load_timeout(100)

# Navigate and initialize
driver.get('https://registrar.princeton.edu/course-offerings?term=1242')
WebDriverWait(driver, 10).until(EC.presence_of_element_located(
    (By.ID, 'classes-search-button'))).click()
WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div.pager a:last-child'))).click()

# Wait for the course list to load
wait = WebDriverWait(driver, 30)
wait.until(EC.presence_of_all_elements_located(
    (By.CSS_SELECTOR, 'td.class-info')))

prerequisites = []
skipped_courses = []

# Start scraping timer
start_time = time.time()

# Main window handle
main_window = driver.current_window_handle

# Loop through courses
try:
    course_elements = driver.find_elements(By.CSS_SELECTOR, 'td.class-info a')
    print(f"Found {len(course_elements)} courses.")
    for i in range(len(course_elements)):

        # Refresh the list of course elements to prevent stale elements
        course_elements = driver.find_elements(
            By.CSS_SELECTOR, 'td.class-info a')
        if len(course_elements) == 0:
            print("No course elements found. Waiting...")
            time.sleep(1.5)  # Wait for website
            continue

        course_element = course_elements[i]
        course_name = course_element.text
        # print(f"Starting to process course #{i+1}: {course_name}")  # Debugging output

        try:
            # Open course details in new tab
            action = webdriver.ActionChains(driver)
            action.move_to_element(course_element)
            action.key_down(Keys.COMMAND if 'darwin' ==
                            sys.platform else Keys.CONTROL)
            action.click()
            action.key_up(Keys.COMMAND if 'darwin' ==
                        sys.platform else Keys.CONTROL)
            action.perform()
            # print(f"Opened details for {course_name} in new tab.")  # Debugging output
            time.sleep(2)  # Wait for website

            # Switch to new tab and scrape
            # driver.switch_to.window(driver.window_handles[1])
            new_windows = driver.window_handles
            if len(new_windows) > 1:
                driver.switch_to.window(new_windows[1])
            else:
                print(f"Failed to open a new tab for {course_name}. Skipping.")
                skipped_courses.append({
                    'Course Name': course_name,
                    'Error': str(e)
                })
                continue
        except Exception as e:
            print(f"Exception while trying to open a new tab for {course_name}: {e}")
            continue

        # print(f"Switched to new tab for {course_name}.")  # Debugging output

        # Wait for the details to load
        wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, 'div.container')))
        # print(f"Details loaded for {course_name}.")  # Debugging output

        # Scrape prerequisites
        try:
            prereqs_section = driver.find_element(
                By.CSS_SELECTOR, 'div.prereqs-and-other-restrictions p span').text
            processed_prereqs = process_prerequisites(prereqs_section)
            prerequisites.append({
                'Course Name': course_name,
                # regex matching before: 'Course Numbers': ', '.join(processed_prereqs['course_numbers']),
                # 'Additional Requirements': ', '.join(processed_prereqs['additional_requirements'])
                'Course Numbers': processed_prereqs,  # changed this line
                'Additional Requirements': processed_prereqs  # and this line
            })
            print(
                f"Found prerequisites for {course_name}: {processed_prereqs}")
        except NoSuchElementException:
            print(f"No prerequisites found for {course_name}.")

        # Close new tab and switch back to main tab
        driver.close()
        # print(f"Closed tab for {course_name}.")  # Debugging output
        driver.switch_to.window(main_window)
        # print(f"Switched back to main tab.")  # Debugging output
        time.sleep(1.5)  # Wait for website

        # Wait for course list to reload
        wait.until(EC.presence_of_all_elements_located(
            (By.CSS_SELECTOR, 'td.class-info')))
except (NoSuchElementException, WebDriverException) as e:
    print(f"An error occurred: {e}. Exiting gracefully.")
    driver.quit()

# Stop the timer
end_time = time.time()
elapsed_time = end_time - start_time

# Close driver
driver.quit()

# Convert list to DataFrame
df_prerequisites = pd.DataFrame(prerequisites)

# Export to CSV for readability
df_prerequisites.to_csv("course_prerequisites.csv", index=False)

# At the end of your script, print out or save the skipped_courses list
print("Skipped Courses due to errors:")
for skipped in skipped_courses:
    print(f"Course: {skipped['Course Name']}, Error: {skipped['Error']}")

# Print elapsed time
print("--" * 20)
print(f"Time elapsed: {elapsed_time:.2f} seconds")
print("--" * 20)

# Optionally, save to a CSV
pd.DataFrame(skipped_courses).to_csv("skipped_courses.csv", index=False)

# import sys
# import re
# import time
# import pandas as pd
# from selenium import webdriver
# from selenium.webdriver.common.by import By
# from selenium.webdriver.common.keys import Keys
# from selenium.webdriver.support.ui import WebDriverWait
# from selenium.webdriver.support import expected_conditions as EC
# from selenium.common.exceptions import NoSuchElementException, WebDriverException
# from webdriver_manager.chrome import ChromeDriverManager
# from selenium.webdriver.chrome.service import Service
# from concurrent.futures import ThreadPoolExecutor

# # A mapping from free text to course numbers
# text_to_course = {
#     "basic statistics": "ORF 245",
#     "probability": "ORF 309",
#     "multivariable calculus": "MAT 201",
#     # Add more mappings as needed
# }

# def process_prerequisites(prerequisite_text):
#     course_numbers = re.findall(r'(?<![/.])([A-Z]{2,4})\s*([\d]{1,3}[A-Z]?)(?![/.])', prerequisite_text)
#     course_numbers = [f"{dept}{num}" for dept, num in course_numbers]
    
#     additional_requirements = []
    
#     for text, course in text_to_course.items():
#         if text in prerequisite_text.lower():
#             course_numbers.append(course)
            
#     if "permission of the instructor" in prerequisite_text.lower():
#         additional_requirements.append("Permission of the instructor")
        
#     if not course_numbers:
#         return {'course_numbers': [], 'additional_requirements': [prerequisite_text]}
    
#     return {
#         'course_numbers': list(set(course_numbers)),  # Remove duplicates
#         'additional_requirements': additional_requirements
#     }

# # Initialize WebDriver
# options = webdriver.ChromeOptions()
# options.add_argument('--headless')  # No GUI
# service = Service(ChromeDriverManager().install())
# service.start()
# driver = webdriver.Remote(service.service_url, options=options)
# driver.set_page_load_timeout(100)

# # Navigate and initialize
# driver.get('https://registrar.princeton.edu/course-offerings?term=1242')
# WebDriverWait(driver, 10).until(EC.presence_of_element_located(
#     (By.ID, 'classes-search-button'))).click()
# WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div.pager a:last-child'))).click()

# # Wait for the course list to load
# wait = WebDriverWait(driver, 30)
# wait.until(EC.presence_of_all_elements_located(
#     (By.CSS_SELECTOR, 'td.class-info')))

# # Initialize a DataFrame for prerequisites
# prerequisites = []

# # Main window handle
# main_window = driver.current_window_handle

# # Loop through courses
# try:
#     course_elements = driver.find_elements(By.CSS_SELECTOR, 'td.class-info a')
#     print(f"Found {len(course_elements)} courses.")
#     for i in range(len(course_elements)):

#         # Refresh the list of course elements to prevent stale elements
#         course_elements = driver.find_elements(
#             By.CSS_SELECTOR, 'td.class-info a')
#         if len(course_elements) == 0:
#             print("No course elements found. Waiting...")
#             time.sleep(1.5)  # Wait for website
#             continue

#         course_element = course_elements[i]
#         course_name = course_element.text
#         # print(f"Starting to process course #{i+1}: {course_name}")  # Debugging output

#         try:
#             # Open course details in new tab
#             # action = webdriver.ActionChains(driver)
#             # action.move_to_element(course_element)
#             # action.key_down(Keys.COMMAND if 'darwin' ==
#             #                 sys.platform else Keys.CONTROL)
#             # action.click()
#             # action.key_up(Keys.COMMAND if 'darwin' ==
#             #             sys.platform else Keys.CONTROL)
#             # action.perform()
#             # # print(f"Opened details for {course_name} in new tab.")  # Debugging output
#             # time.sleep(2)  # Wait for website
#             # Open a new tab using JavaScript and navigate to the course details
#             driver.execute_script(f"window.open('{course_element.get_attribute('href')}', '_blank');")
#             # Switch to new tab and scrape
#             # driver.switch_to.window(driver.window_handles[1])
#             new_windows = driver.window_handles
#             if len(new_windows) > 1:
#                 driver.switch_to.window(new_windows[1])
#             else:
#                 print(f"Failed to open a new tab for {course_name}. Skipping.")
#                 continue
#         except Exception as e:
#             print(f"Exception while trying to open a new tab for {course_name}: {e}")
#             continue

#         # print(f"Switched to new tab for {course_name}.")  # Debugging output

#         # Wait for the details to load
#         wait.until(EC.presence_of_element_located(
#             (By.CSS_SELECTOR, 'div.container')))
#         # print(f"Details loaded for {course_name}.")  # Debugging output

#         # Scrape prerequisites
#         try:
#             prereqs_section = driver.find_element(
#                 By.CSS_SELECTOR, 'div.prereqs-and-other-restrictions p span').text
#             processed_prereqs = process_prerequisites(prereqs_section)
#             prerequisites.append({
#                 'Course Name': course_name,
#                 # regex matching before: 'Course Numbers': ', '.join(processed_prereqs['course_numbers']),
#                 # 'Additional Requirements': ', '.join(processed_prereqs['additional_requirements'])
#                 'Course Numbers': processed_prereqs,  # changed this line
#                 'Additional Requirements': processed_prereqs  # and this line
#             })
#             print(
#                 f"Found prerequisites for {course_name}: {processed_prereqs}")
#         except NoSuchElementException:
#             print(f"No prerequisites found for {course_name}.")

#         # Close new tab and switch back to main tab
#         driver.close()
#         # print(f"Closed tab for {course_name}.")  # Debugging output
#         driver.switch_to.window(main_window)
#         # print(f"Switched back to main tab.")  # Debugging output
#         time.sleep(1.5)  # Wait for website

#         # Wait for course list to reload
#         wait.until(EC.presence_of_all_elements_located(
#             (By.CSS_SELECTOR, 'td.class-info')))
# except (NoSuchElementException, WebDriverException) as e:
#     print(f"An error occurred: {e}. Exiting gracefully.")
#     driver.quit()

# # Close driver
# driver.quit()

# # Convert list to DataFrame
# df_prerequisites = pd.DataFrame(prerequisites)

# # Export to CSV for readability
# df_prerequisites.to_csv("course_prerequisites.csv", index=False)

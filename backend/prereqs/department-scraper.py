import sys
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, WebDriverException
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import Select
from concurrent.futures import ThreadPoolExecutor, as_completed


def scrape_department(department):
    # Initialize WebDriver
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    local_service = Service(ChromeDriverManager().install())
    local_service.start()
    local_driver = webdriver.Remote(local_service.service_url, options=options)
    local_driver.set_page_load_timeout(100)

    # Navigate and initialize
    local_driver.get(
        f'https://registrar.princeton.edu/course-offerings?term=1242&subject={department}'
    )
    WebDriverWait(local_driver, 10).until(
        EC.presence_of_element_located((By.ID, 'classes-search-button'))
    ).click()

    # Change department using dropdown
    select = Select(local_driver.find_element(By.ID, 'cs-subject-1'))
    select.select_by_value(department)

    # Wait for the course list to load
    wait = WebDriverWait(local_driver, 30)
    wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'td.class-info')))

    # Initialize local list for prerequisites
    local_prerequisites = []

    # Main window handle
    main_window = local_driver.current_window_handle

    # Loop through courses
    try:
        course_elements = local_driver.find_elements(By.CSS_SELECTOR, 'td.class-info a')
        for i in range(len(course_elements)):
            # Refresh the list of course elements to prevent stale elements
            course_elements = local_driver.find_elements(
                By.CSS_SELECTOR, 'td.class-info a'
            )
            if len(course_elements) == 0:
                time.sleep(1.5)
                continue

            course_element = course_elements[i]
            course_name = course_element.text

            # Open course details in new tab
            action = webdriver.ActionChains(local_driver)
            action.move_to_element(course_element)
            action.key_down(Keys.COMMAND if 'darwin' == sys.platform else Keys.CONTROL)
            action.click()
            action.key_up(Keys.COMMAND if 'darwin' == sys.platform else Keys.CONTROL)
            action.perform()
            time.sleep(1.5)

            # Switch to new tab and scrape
            if len(local_driver.window_handles) > 1:
                local_driver.switch_to.window(local_driver.window_handles[1])
            else:
                continue

            # Wait for the details to load
            wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'div.container'))
            )

            # Scrape prerequisites
            try:
                prereqs_section = local_driver.find_element(
                    By.CSS_SELECTOR, 'div.prereqs-and-other-restrictions p span'
                ).text
                local_prerequisites.append(
                    {
                        'Course Name': course_name,
                        'Course Numbers': prereqs_section,  # placeholder, replace with actual processing
                        # placeholder, replace with actual processing
                        'Additional Requirements': prereqs_section,
                    }
                )
            except NoSuchElementException:
                pass

            # Close new tab and switch back to main tab
            local_driver.close()
            local_driver.switch_to.window(main_window)
            time.sleep(1.5)

            # Wait for course list to reload
            wait.until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'td.class-info'))
            )
    except (NoSuchElementException, WebDriverException) as e:
        print(f'[{department}] An error occurred: {e}. Exiting gracefully.')
        local_driver.quit()

    # Close driver
    local_driver.quit()

    return local_prerequisites  # Return the scraped data


departments_to_scrape = [
    'AAS',
    'AFS',
    'AMS',
    'ANT',
    'AOS',
    'APC',
    'ARA',
    'ARC',
    'ART',
    'ASA',
    'ASL',
    'AST',
    'ATL',
    'BCS',
    'BNG',
    'CBE',
    'CDH',
    'CEE',
    'CGS',
    'CHI',
    'CHM',
    'CHV',
    'CLA',
    'COM',
    'COS',
    'CWR',
    'CZE',
    'DAN',
    'EAS',
    'ECE',
    'ECO',
    'ECS',
    'EEB',
    'EGR',
    'ENE',
    'ENG',
    'ENT',
    'ENV',
    'EPS',
    'FIN',
    'FRE',
    'FRS',
    'GEO',
    'GER',
    'GEZ',
    'GHP',
    'GSS',
    'HEB',
    'HIN',
    'HIS',
    'HLS',
    'HOS',
    'HUM',
    'ISC',
    'ITA',
    'JDS',
    'JPN',
    'JRN',
    'KOR',
    'LAO',
    'LAS',
    'LAT',
    'LCA',
    'LIN',
    'MAE',
    'MAT',
    'MED',
    'MOD',
    'MOG',
    'MOL',
    'MPP',
    'MSE',
    'MTD',
    'MUS',
    'NES',
    'NEU',
    'ORF',
    'PAW',
    'PER',
    'PHI',
    'PHY',
    'PLS',
    'POL',
    'POP',
    'POR',
    'PSY',
    'QCB',
    'REL',
    'RES',
    'RUS',
    'SAN',
    'SLA',
    'SML',
    'SOC',
    'SPA',
    'SPI',
    'STC',
    'SWA',
    'THR',
    'TPP',
    'TRA',
    'TUR',
    'TWI',
    'UKR',
    'URB',
    'URD',
    'VIS',
    'WRI',
]

# Initialize global prerequisites DataFrame
prerequisites = []

# Run the scraper function in parallel for each department
with ThreadPoolExecutor(max_workers=5) as executor:
    future_to_department = {
        executor.submit(scrape_department, dept): dept for dept in departments_to_scrape
    }

    for future in as_completed(future_to_department):
        dept = future_to_department[future]
        try:
            data = future.result()
            # if data:
            #     df_prerequisites = df_prerequisites.append(
            #         pd.DataFrame(data), ignore_index=True
            #     )
        except Exception as exc:
            print(f'{dept} generated an exception: {exc}')

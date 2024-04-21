from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()

driver.get("https://www.getmidas.com/canli-borsa/")

accept_cookies = WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.XPATH,"/html/body/section/div/div/div/div/div[2]/button[1]")))
accept_cookies.click()
print("1")

view_all_button = WebDriverWait(driver,10).until(EC.visibility_of_element_located((By.XPATH,"/html/body/div[1]/div/div/div/div[6]/div/button")))
view_all_button.click()

hisseler = []
for i in range(1,555):
    hisse = driver.find_element(By.XPATH,f"/html/body/div[1]/div/div/div/div[6]/table/tbody/tr[{i}]/td[1]/a").text
    fiyat = driver.find_element(By.XPATH,f"/html/body/div[1]/div/div/div/div[6]/table/tbody/tr[{i}]/td[2]").text
    fark = driver.find_element(By.XPATH,f"/html/body/div[1]/div/div/div/div[6]/table/tbody/tr[{i}]/td[5]").text

    print(f"{hisse} : {fiyat} Artış: {fark}")

driver.quit()

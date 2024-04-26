from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import json
import matplotlib.pyplot as plt

driver = webdriver.Chrome()

driver.get("https://www.getmidas.com/canli-borsa/")

accept_cookies = WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.XPATH,"/html/body/section/div/div/div/div/div[2]/button[1]")))
accept_cookies.click()

view_all_button = WebDriverWait(driver,10).until(EC.visibility_of_element_located((By.XPATH,"/html/body/div[1]/div/div/div/div[6]/div/button")))
view_all_button.click()

hisseler = []

# Tüm hisse fiyatlarını ve farklarını çek
rows = driver.find_elements(By.XPATH, "/html/body/div[1]/div/div/div/div[6]/table/tbody/tr")
for row in rows:
    hisse = row.find_element(By.XPATH, "./td[1]/a").text
    fiyat = row.find_element(By.XPATH, "./td[2]").text
    fark = row.find_element(By.XPATH, "./td[5]").text

    hisseler.append({"Hisse": hisse, "Fiyat": fiyat, "Fark": fark})


# JSON dosyasına hisseleri kaydet
with open("data/hisseler.json", "w") as json_file:
    json.dump(hisseler, json_file)

driver.quit()

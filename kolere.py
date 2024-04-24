import pandas as pd
import numpy as np
import yfinance as yf
from itertools import combinations
import json

# Hisse isimlerini ve sembollerini yükle
with open("hisseler.json", "r") as json_file:
    hisseler = json.load(json_file)

hisse_isimler = [hisse["Hisse"] + ".IS" for hisse in hisseler]

# Borsa İstanbul'daki hisse senetlerinin verilerini yükle
start_date = '2023-01-01'
end_date = '2024-01-01'
hisse_verileri = yf.download(hisse_isimler, start=start_date, end=end_date)['Adj Close']

# Korelasyon ve ters korelasyonları hesaplamak için kombinasyonları oluştur
kombinasyonlar = list(combinations(hisse_isimler, 2))

# Korelasyon ve ters korelasyonları depolamak için sözlük oluştur
korelasyonlar = {}
ters_korelasyonlar = {}

# Her bir kombinasyon için korelasyonları hesapla
for kombinasyon in kombinasyonlar:
    hisse1, hisse2 = kombinasyon
    korelasyon = hisse_verileri[hisse1].corr(hisse_verileri[hisse2])
    ters_korelasyon = -korelasyon
    
    korelasyonlar[kombinasyon] = korelasyon
    ters_korelasyonlar[kombinasyon] = ters_korelasyon

# Korelasyon ve ters korelasyonları sırala
sirali_korelasyonlar = sorted(korelasyonlar.items(), key=lambda x: x[1], reverse=True)
sirali_ters_korelasyonlar = sorted(ters_korelasyonlar.items(), key=lambda x: x[1], reverse=True)

print("En Yüksek Korelasyonlar:")
for kombinasyon, korelasyon in sirali_korelasyonlar[:5]:
    print(f"{kombinasyon}: {korelasyon}")

print("\nEn Yüksek Ters Korelasyonlar:")
for kombinasyon, ters_korelasyon in sirali_ters_korelasyonlar[:5]:
    print(f"{kombinasyon}: {ters_korelasyon}")

# Annabel Droste
# Script om data om te zetten naar JSON format

import json
import csv

input_file = csv.DictReader(open("population.csv"))
info = []
for row in input_file:
    info.append(row)

with open("density.json", "w") as o:
    json.dump(info,o, encoding="cp1252")


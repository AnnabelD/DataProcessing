# Annabel Droste
# Script om data om te zetten naar JSON format

import json
import csv

input_file = csv.DictReader(open("tabel.csv"))
info = []
for row in input_file:
    info.append(row)
print info
##json.dumps(info)

##with open('eggs.csv', 'rU') as csvfile:
##with open("tabel.csv", "rU") as f:
##	info = f.readlines()
##
##print info
##with open("output.json", "w") as o:
##    print json.dump(info, o)
##
### put the data in a nested list ['country', 'data']
##new_info = []
##for i in info:
##    new = i.replace("\n", "")
##    new_info.append(new)
##
##print new_info
##print json.dumps(new_info)


##lst = []
##for j in new_info:
##    new = j.split(";")
##    lst.append(new)
##
##new_lst = []
##
##for k, v in lst:
##    new_lst.append('{"country": "%s", "data": "%s"}' % (k, v))
##print new_lst
##
##
### create the json file
with open("output.json", "w") as o:
    json.dump(info,o)
##    o.write("{ \"points\": ")
##    o.write(str(new_lst))
##    o.write("}")
##    o.close()

# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
import csv
import json

csvfile = open('movies_metadata.csv', 'r')
jsonfile = open('movies_metadata.json', 'w')

fieldnames = ("adult","belongs_to_collection","budget","genres","homepage","id","imdb_id","original_language","original_title","overview","popularity","poster_path","production_companies","production_countries","release_date","revenue","runtime","spoken_languages","status","tagline","title","video","vote_average","vote_count")
reader = csv.DictReader( csvfile, fieldnames)
out = json.dumps( [ row for row in reader ] )
jsonfile.write(out)
jsonfile.close()
csvfile.close()
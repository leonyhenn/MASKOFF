# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
import requests
import json
import time

times = []
for i in range(100):
    start = time.time()
    result = requests.post("http://localhost:5000/users/read_access",headers={"Content-Type":"application/json","access-token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI5ODg0NzhlNS1iZThmLTRjNjMtODk1ZS1mNzA5OGNhYjA2NzkiLCJleHAiOjE4Nzc1MDU3NDQuMTUxMzc4Mn0.xGj1t1C9guUPIJt70H_gEr6ZUHZK3UCUN3zNo4duN-4"},data=json.dumps({
        "coordinates": [
            -79.4226816149635,
            43.648941923157004
        ],
        "visibleBounds": [
            [
                -79.38891114220098,
                43.687931567680295
            ],
            [
                -79.4563272445227,
                43.609836555621115
            ]
        ],
        "phone_number": "+16479862310",
        "password": "000ooo",
        "language": "Chi",
        "start": 1,
        "db_type": "ROASTS",
        "db_id": "36b92af1-b422-455c-a198-cafda942d7c2",
        "operation": "like"
    }))
    elapse = time.time() - start
    print(elapse)
    times.append(elapse)
    print(result.status_code)

print(sum(times) / float(len(times)))
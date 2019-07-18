#!/bin/bash
cd 'components'
for f in *; do 
  echo "/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */" > tmpfile
  cat $f >> tmpfile
  mv tmpfile $f
done
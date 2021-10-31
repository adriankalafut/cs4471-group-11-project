#!/bin/bash
cd packages
python -m venv virtual-env
cd virtual-env
source Scripts/activate
cd ../../
pip install -r requirements.txt

read -p "Enter Lambda-ID: " id
cp -R ${id}/. packages/virtual-env/Lib/site-packages
zip a -tzip -r builds/${id}.zip packages/virtual-env/Lib/site-packages 
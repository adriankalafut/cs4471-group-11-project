#!/bin/bash
cd packages
python -m venv virtual-env
cd virtual-env
source bin/activate
cd ../../
pip install -r requirements.txt

read -p "Enter Lambda-ID: " id
cp -R ${id}/. packages/virtual-env/lib/*/site-packages
zip -r builds/${id}.zip packages/virtual-env/lib/*/site-packages 
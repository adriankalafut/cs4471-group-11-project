cd packages
python -m venv virtual-env
cd virtual-env
source Scripts/activate
cd ../../
pip install -r requirements.txt

read -p "Enter Lambda-ID: " id
cp -R ${id}/. packages/virtual-env/Lib/site-packages
mkdir builds
zip -r builds/${id}.zip packages/virtual-env/Lib/site-packages 
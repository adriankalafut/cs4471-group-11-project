cd packages
python -m venv virtual-env
cd virtual-env
Scripts/activate.ps1
cd ../../
pip install -r requirements.txt

$id =Read-Host -Prompt "Enter Lambda-ID: "
cp -R $id/. packages/virtual-env/Lib/site-packages
Compress-Archive -Force -Path packages/virtual-env/Lib/site-packages/* -DestinationPath builds/$id.zip
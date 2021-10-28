Within cs4471-group-11-project\aws_lambda_functions\packages

pip install -r requirements.txt --target ./package
..\packages\virtual-env\Scripts\activate
cd ..\..\..\
python -m venv virtual-env
cd .\virtual-env
pip install -r requirements.txt
cd Lib\site-packages

Copy all files and place in cs4471-group-11-project\aws_lambda_functions\feeder
Zip up
Push to aws
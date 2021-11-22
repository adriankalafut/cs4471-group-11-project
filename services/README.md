Create and activate virtual env for each service with
Please check your terminal defaults to python 3 (python --version)

```
(Only need to create once) - python -m venv virtual-env

From service folder
Windows - virtual-env/Scripts/activate.ps1
Unix - source virtual-env/bin/activate

Install Deps with - pip install -r requirements.txt
``` 


Steps To Promote & Expose A Service on AWS

```
Assure port is exposed in Dockerfile
Build and push to ECR -

docker build -t NAME_GOES_HERE . 
docker tag NAME_GOES_HERE 112450915150.dkr.ecr.ca-central-1.amazonaws.com/NAME_GOES_HERE
aws ecr get-login-password | docker login --username AWS --password-stdin 112450915150.dkr.ecr.ca-central-1.amazonaws.com
docker push 112450915150.dkr.ecr.ca-central-1.amazonaws.com/NAME_GOES_HERE


Define new Task in ECS 
Update/Push Service to Cluster in ECS (Assure that you enable DNS lookup)
Note: if you are updating an existing service, you will likely have to scale the number of tasks to 0, then back to 1 for the chance to take effect.

Define Route In API Gateway
Within "Parameter Mapping" of the route, map the corresponding route name which exists in flask
```

Search and Browse Push Example
```
docker build -t search_and_browse_service .
docker tag search_and_browse_service 112450915150.dkr.ecr.ca-central-1.amazonaws.com/search_and_browse_service
aws ecr get-login-password | docker login --username AWS --password-stdin 112450915150.dkr.ecr.ca-central-1.amazonaws.com
docker push 112450915150.dkr.ecr.ca-central-1.amazonaws.com/search_and_browse_service
```

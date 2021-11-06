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
Build and push to ECR
Define new Task in ECS
Update/Push Service to Cluster in ECS (Assure that you enable DNS lookup)
Note: if you are updating an existing service, you will likely have to scale the number of tasks to 0, then back to 1 for the chance to take effect.

Define Route In API Gateway
Within "Parameter Mapping" of the route, map the corresponding route name which exists in flask
```

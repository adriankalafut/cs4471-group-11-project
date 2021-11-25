FROM python:3.9

WORKDIR /

COPY requirements.txt .
RUN apt-get -y update && apt-get install -y gcc
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000 

CMD ["python", "service_main.py"]
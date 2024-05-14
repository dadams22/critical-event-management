ARG PYTHON_VERSION=3.10-slim-bullseye

FROM python:${PYTHON_VERSION}

RUN apt-get update && apt-get install -y git

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN mkdir -p /code
WORKDIR /code

# Install dependencies first to cache them
ADD setup.py /code
RUN pip install -e .

# Install the rest of the code
ADD . /code
RUN pip install -e .

RUN python manage.py collectstatic --noinput && mv ../static static

EXPOSE 8000

CMD ["gunicorn", "--bind", ":8000", "--workers", "2", "cembackend.wsgi"]

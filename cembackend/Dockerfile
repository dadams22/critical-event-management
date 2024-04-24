ARG PYTHON_VERSION=3.10-slim-bullseye

FROM python:${PYTHON_VERSION}

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN mkdir -p /code


ADD . /code
WORKDIR /code
RUN pip install -e .

RUN python manage.py collectstatic --noinput && mv ../static static

EXPOSE 8000

CMD ["gunicorn", "--bind", ":8000", "--workers", "2", "cembackend.wsgi"]

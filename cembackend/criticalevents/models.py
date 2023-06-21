from django.db import models


class Person(models.Model):
    """ Represents a person who may be impacted by an incident """
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    phone = models.CharField(max_length=50)

    def __str__(self) -> str:
        return f'{self.first_name} {self.last_name}'
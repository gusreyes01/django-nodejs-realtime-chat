from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Mensaje(models.Model):
	envia = models.ForeignKey(User, related_name="enviaUsuarioCmt")
	recibe = models.ForeignKey(User, related_name="recibeUsuarioCmt")
	mensaje = models.CharField(max_length=255)
	leido = models.BooleanField(null=False)
	fecha = models.DateTimeField(auto_now_add=True, blank=True)
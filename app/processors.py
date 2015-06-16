import functools
import collections
import json as simplejson

from django.shortcuts import *
from django.contrib.auth.models import User, Group
from django.core.serializers.json import DjangoJSONEncoder

from app.models import Mensaje


# Json de todos los usuarios
def get_all_users(request):
    users = User.objects.all().exclude(id=request.user.id)
    users_vl = User.objects.values_list('first_name','id')
    users_json = simplejson.dumps(list(users_vl), cls=DjangoJSONEncoder)
    return locals()

# Toma los mensajes mas recientes
def get_chat_messages(request):
    user_messages = {}
    user_messages = Mensaje.objects.filter(recibe_id=request.user.id) | Mensaje.objects.filter(envia_id=request.user.id)
    user_messages = user_messages.order_by('fecha')
    messages_by_user = collections.defaultdict(list)
    for message in user_messages:
      #Identificamos el chat
      if message.envia_id != request.user.id:   # Mismo Usuario
        messages_by_user[message.envia.id].append([message.envia.first_name+" "+message.envia.last_name,message.mensaje,message.fecha.strftime('%d/%m/%Y'),message.leido, False])
      else:  
        messages_by_user[message.recibe.id].append([message.envia.first_name+" "+message.envia.last_name,message.mensaje,message.fecha.strftime('%d/%m/%Y'),message.leido, True])

    messages_by_user.default_factory = None
    #user_messages = messages.objects.filter(reduce(lambda x, y: x | y, [Q(envia=x1) for x1 in users_v2]))
    return locals()



import functools
import collections
import json as simplejson

from django.shortcuts import *
from django.contrib.auth.models import User, Group
from django.core.serializers.json import DjangoJSONEncoder

#from websock.models import Comments


# Json de todos los usuarios
def get_all_users(request):
    users = User.objects.all().exclude(id=request.user.id)
    users_vl = User.objects.values_list('first_name','id')
    users_json = simplejson.dumps(list(users_vl), cls=DjangoJSONEncoder)
    return locals()

# Toma los mensajes mas recientes
"""
def get_chat_messages(request):
    user_comments = {}
    user_comments = Comments.objects.filter(recibe_id=request.user.id) | Comments.objects.filter(envia_id=request.user.id)
    user_comments = user_comments.order_by('date')
    comments_by_user = collections.defaultdict(list)
    for comment in user_comments:
      #Identificamos el chat
      if comment.envia_id != request.user.id:   # Mismo Usuario
        comments_by_user[comment.envia.id].append([comment.envia.first_name+" "+comment.envia.last_name,comment.text,comment.date.strftime('%d/%m/%Y'),comment.leido, False])
      else:  
        comments_by_user[comment.recibe.id].append([comment.envia.first_name+" "+comment.envia.last_name,comment.text,comment.date.strftime('%d/%m/%Y'),comment.leido, True])

    comments_by_user.default_factory = None
    #user_comments = Comments.objects.filter(reduce(lambda x, y: x | y, [Q(envia=x1) for x1 in users_v2]))
    return locals()
"""



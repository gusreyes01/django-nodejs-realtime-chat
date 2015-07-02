import json as simplejson
import redis
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.sessions.models import Session
from django.template import RequestContext
from app.models import Mensaje
from django.http import HttpResponse, HttpResponseServerError

@login_required
def index(request):
    return render_to_response('index.html', context_instance=RequestContext(request))

@login_required
def chat(request):
    return render_to_response('chat.html', context_instance=RequestContext(request))


#Instanciar redis y enviar mensaje a nodejs
def socketio_emit(data):
    r = redis.StrictRedis(host='127.0.0.1', port=6379, db=0)
    r.publish('chat', data) 

#Enviar notificacion de chat a usuarios
@csrf_exempt
def node_api(request):
    try:
    	msg = {}

        #Toma Usuario desde sessionid
        session = Session.objects.get(session_key=request.POST.get('sessionid'))
        user_id = session.get_decoded().get('_auth_user_id')
        message = request.POST.get('comment')
        user = User.objects.get(id=user_id)
        user_to = User.objects.get(id=request.POST.get('UserToId'))
 
        
        msg['send_user_id'] = user.id
        msg['send_user_first_name'] = user.first_name
        msg['send_user_last_name'] = user.last_name
        msg['rec_user_id'] = user_to.id
        msg['message'] = message
        data = simplejson.dumps(msg)

        #Crear mensaje
        Mensaje.objects.create(envia=user,recibe=user_to,mensaje=message,leido=0)

        #LLama a emit
        socketio_emit(data)
        
        return HttpResponse("Everything worked :)")
    except Exception, e:
        return HttpResponseServerError(str(e))

def chat_leido(request,user_leido):
    mensajes = Mensaje.objects.filter(recibe_id=request.user,envia_id=user_leido,leido=False).order_by('-date')
    mensajes.update(leido=True)
    return HttpResponse('')

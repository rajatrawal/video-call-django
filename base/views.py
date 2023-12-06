
from django.shortcuts import render
from django.http import JsonResponse
from agora_token_builder import RtcTokenBuilder
from django.views.decorators.csrf import csrf_exempt
import time
import json
from .models import RoomMember
# Create your views here.
import random


def lobby(request):
    return render(request, 'base/lobby.html')


def room(request):
    return render(request, 'base/room.html')


def getToken(request):
    appId = 'efd7d3d435314591ac6738f65ad2d308'
    appCertificate = '0b8b98014b0942369266bb794561ca34'
    channelName = request.GET.get('channel')
    uid = random.randint(1, 230)
    expirationTimeInSecond = 3600*24
    currentTimeStamp = time.time()
    privilegeExpiredTs = currentTimeStamp+expirationTimeInSecond
    role = 1
    token = RtcTokenBuilder.buildTokenWithUid(
        appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
    return JsonResponse({'token': token, 'uid': uid})


@csrf_exempt
def createMember(request):
    data = json.loads(request.body)
    member, created = RoomMember.objects.get_or_create(
        name=data['name'],
        uid=data['UID'],
        room_name=data['room_name']
    )

    return JsonResponse({'name': data['name']}, safe=False)


def getMember(request):
    uid = request.GET.get('uid')
    room_name = request.GET.get('room_name')
    member = RoomMember.objects.get(uid=uid,
                                    room_name=room_name
                                    )
    name = member.name

    return JsonResponse({'name': member.name}, safe=False)


@csrf_exempt
def deleteMember(request):
    data = json.loads(request.body)
    member = RoomMember.objects.get(
        name=data['name'],
        uid=data['UID'],
        room_name=data['room_name']
    )
    member.delete()
    return JsonResponse('Member deleted', safe=False)
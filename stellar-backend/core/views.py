from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Topic, UserProgress, ChatSession, Message
from .serializers import TopicSerializer, ProgressSerializer, MessageSerializer, ChatSessionSerializer
from ai_service.service import get_ai_response

def dashboard_view(request):
    return render(request, 'index.html')

def chat_view(request):
    return render(request, 'index.html')

class TopicListView(APIView):
    def get(self, request):
        topics = list(Topic.objects.all())
        serializer = TopicSerializer(topics, many=True)
        
        data = []
        for i, topic in enumerate(topics):
            t_dict = dict(serializer.data[i])
            progress = UserProgress.objects.filter(topic=topic).first()
            t_dict['progress_score'] = progress.score if progress else 0
            data.append(t_dict)
            
        return Response(data)

class ChatView(APIView):
    def post(self, request):
        message_text = request.data.get('message')
        session_id = request.data.get('session_id')

        if not message_text:
            return Response({'error': 'No message'}, status=400)

        if session_id:
            session = ChatSession.objects.filter(id=session_id).first()
        else:
            session = ChatSession.objects.create()
        
        Message.objects.create(session=session, role='user', content=message_text)
        
        history = list(Message.objects.filter(session=session).values('role', 'content'))
        
        ai_text = get_ai_response(message_text, history)
        
        Message.objects.create(session=session, role='ai', content=ai_text)
        
        serializer = ChatSessionSerializer(session)
        return Response(serializer.data)

class InitDataView(APIView):
    def get(self, request):
        if Topic.objects.count() == 0:
            math = Topic.objects.create(name="Алгебра", subject="Math")
            geom = Topic.objects.create(name="Геометрия", subject="Math")
            Topic.objects.create(name="Уравнения", subject="Math", parent_topic=math)
            Topic.objects.create(name="Треугольники", subject="Math", parent_topic=geom)
            return Response({'status': 'initialized'})
        return Response({'status': 'already exists'})

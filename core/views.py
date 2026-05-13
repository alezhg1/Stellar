from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import render, redirect
from django.contrib.auth import get_user_model, login
from django.contrib.auth.models import AnonymousUser
from .models import Topic, UserProgress, ChatMessage
from .serializers import (
    TopicSerializer, 
    ChatMessageSerializer, 
    ProgressSummarySerializer
)
from ai_service.service import get_socratic_response

User = get_user_model()


def get_or_create_demo_user(request):
    """Get or create demo user for the session"""
    if not request.user.is_authenticated:
        user, created = User.objects.get_or_create(
            username='demo_user',
            defaults={'email': 'demo@stellar.local', 'is_active': True}
        )
        # Auto-login for demo
        login(request, user)
        return user
    return request.user


# Page Views
def landing_page(request):
    """Landing page view"""
    return render(request, 'core/landing.html')


def dashboard_page(request):
    """Main dashboard with chat and mastery map"""
    user = get_or_create_demo_user(request)
    return render(request, 'core/dashboard.html')


def onboarding_page(request):
    """Onboarding page for subject selection"""
    if request.method == 'POST':
        subject = request.POST.get('subject', 'math')
        user = get_or_create_demo_user(request)
        
        # Initialize progress for selected subject topics
        topics = Topic.objects.filter(subject=subject)
        for topic in topics:
            UserProgress.objects.get_or_create(
                user=user,
                topic=topic,
                defaults={'score': 0}
            )
        
        return redirect('dashboard')
    
    return render(request, 'core/onboarding.html')


# API Views
class TopicListView(APIView):
    """GET list of topics by subject"""
    
    def get(self, request):
        subject = request.query_params.get('subject', None)
        if subject:
            topics = Topic.objects.filter(subject=subject)
        else:
            topics = Topic.objects.all()
        
        serializer = TopicSerializer(topics, many=True)
        return Response(serializer.data)


class ChatView(APIView):
    """POST message to chat, returns AI response"""
    
    def post(self, request):
        content = request.data.get('message', '')
        
        if not content:
            return Response(
                {'error': 'Message is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = get_or_create_demo_user(request)
        
        # Save user message
        user_message = ChatMessage.objects.create(
            user=user,
            role='user',
            content=content
        )
        
        # Get conversation history
        history = list(
            ChatMessage.objects.filter(user=user)
            .order_by('timestamp')
            .values('role', 'content')
        )
        
        # Get AI response
        ai_response_text = get_socratic_response(history, content)
        
        # Save AI response
        ai_message = ChatMessage.objects.create(
            user=user,
            role='ai',
            content=ai_response_text
        )
        
        return Response({
            'user_message': ChatMessageSerializer(user_message).data,
            'ai_message': ChatMessageSerializer(ai_message).data
        })


class ChatHistoryView(APIView):
    """GET chat history"""
    
    def get(self, request):
        user = get_or_create_demo_user(request)
        messages = ChatMessage.objects.filter(user=user).order_by('timestamp')
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)


class ClearChatView(APIView):
    """POST clear chat history"""
    
    def post(self, request):
        user = get_or_create_demo_user(request)
        ChatMessage.objects.filter(user=user).delete()
        return Response({'success': True})


class ProgressView(APIView):
    """GET progress summary and prediction"""
    
    def get(self, request):
        user = get_or_create_demo_user(request)
        
        # Get all progress records
        progress_records = UserProgress.objects.filter(user=user)
        
        if not progress_records.exists():
            # Initialize with default topics if none exist
            self._initialize_progress(user)
            progress_records = UserProgress.objects.filter(user=user)
        
        # Calculate predicted score (average of all topic scores)
        total_score = sum(p.score for p in progress_records)
        total_topics = progress_records.count()
        predicted_score = total_score / total_topics if total_topics > 0 else 0
        
        # Count mastered topics (score >= 70)
        mastered_topics = progress_records.filter(score__gte=70).count()
        
        # Prepare progress by topic
        progress_by_topic = [
            {
                'topic_id': p.topic.id,
                'topic_name': p.topic.name,
                'subject': p.topic.subject,
                'score': p.score,
                'is_mastered': p.score >= 70
            }
            for p in progress_records
        ]
        
        return Response({
            'predicted_score': round(predicted_score, 1),
            'total_topics': total_topics,
            'mastered_topics': mastered_topics,
            'progress_by_topic': progress_by_topic
        })
    
    def _initialize_progress(self, user):
        """Initialize progress for all topics"""
        topics = Topic.objects.all()
        for topic in topics:
            UserProgress.objects.get_or_create(
                user=user,
                topic=topic,
                defaults={'score': 0}
            )


class UpdateProgressView(APIView):
    """POST update progress for a topic"""
    
    def post(self, request):
        user = get_or_create_demo_user(request)
        topic_id = request.data.get('topic_id')
        score = request.data.get('score', 0)
        
        try:
            topic = Topic.objects.get(id=topic_id)
            progress, created = UserProgress.objects.update_or_create(
                user=user,
                topic=topic,
                defaults={'score': min(100, max(0, int(score)))}
            )
            
            return Response({
                'success': True,
                'score': progress.score
            })
        except Topic.DoesNotExist:
            return Response(
                {'error': 'Topic not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

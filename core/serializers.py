from rest_framework import serializers
from .models import Topic, UserProgress, ChatMessage
from django.contrib.auth.models import User


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'name', 'subject', 'parent']


class UserProgressSerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    topic_subject = serializers.CharField(source='topic.subject', read_only=True)
    
    class Meta:
        model = UserProgress
        fields = ['id', 'topic', 'topic_name', 'topic_subject', 'score', 'updated_at']


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'timestamp']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class ProgressSummarySerializer(serializers.Serializer):
    predicted_score = serializers.FloatField()
    total_topics = serializers.IntegerField()
    mastered_topics = serializers.IntegerField()
    progress_by_topic = serializers.ListField()

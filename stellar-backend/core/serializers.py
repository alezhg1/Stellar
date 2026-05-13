from rest_framework import serializers
from .models import Topic, UserProgress, Message, ChatSession

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = '__all__'

class ProgressSerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    class Meta:
        model = UserProgress
        fields = ['id', 'topic', 'topic_name', 'score', 'last_updated']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'role', 'content', 'timestamp']

class ChatSessionSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    class Meta:
        model = ChatSession
        fields = ['id', 'created_at', 'messages']

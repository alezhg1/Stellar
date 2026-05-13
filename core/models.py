from django.db import models
from django.contrib.auth.models import User


class Topic(models.Model):
    """Topic model for subject areas"""
    name = models.CharField(max_length=200)
    subject = models.CharField(max_length=100, choices=[
        ('math', 'Mathematics'),
        ('physics', 'Physics'),
        ('russian', 'Russian Language'),
        ('informatics', 'Informatics'),
    ])
    parent = models.ForeignKey(
        'self', 
        null=True, 
        blank=True, 
        on_delete=models.CASCADE,
        related_name='children'
    )
    
    class Meta:
        verbose_name_plural = 'Topics'
        ordering = ['subject', 'name']
    
    def __str__(self):
        return f"{self.subject}: {self.name}"


class UserProgress(models.Model):
    """User progress tracking per topic"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='user_progress')
    score = models.IntegerField(default=0, help_text="Score 0-100")
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'topic']
    
    def __str__(self):
        return f"{self.user.username} - {self.topic.name}: {self.score}"


class ChatMessage(models.Model):
    """Chat messages between user and AI"""
    ROLE_CHOICES = [
        ('user', 'User'),
        ('ai', 'AI'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."

from django.urls import path
from .views import TopicListView, ChatView, InitDataView, dashboard_view, chat_view

urlpatterns = [
    path('topics/', TopicListView.as_view()),
    path('chat/', ChatView.as_view()),
    path('init/', InitDataView.as_view()),
    path('dashboard/', dashboard_view, name='dashboard'),
    path('chat-session/', chat_view, name='chat'),
]

from django.urls import path
from .views import TopicListView, ChatView, InitDataView

urlpatterns = [
    path('topics/', TopicListView.as_view()),
    path('chat/', ChatView.as_view()),
    path('init/', InitDataView.as_view()),
]

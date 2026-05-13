from django.urls import path
from . import views

urlpatterns = [
    # Pages
    path('', views.landing_page, name='landing'),
    path('dashboard/', views.dashboard_page, name='dashboard'),
    path('onboarding/', views.onboarding_page, name='onboarding'),
    
    # API endpoints
    path('api/topics/', views.TopicListView.as_view(), name='api-topics'),
    path('api/chat/', views.ChatView.as_view(), name='api-chat'),
    path('api/chat/history/', views.ChatHistoryView.as_view(), name='api-chat-history'),
    path('api/progress/', views.ProgressView.as_view(), name='api-progress'),
    path('api/progress/update/', views.UpdateProgressView.as_view(), name='api-progress-update'),
]

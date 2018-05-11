from django.urls import path

from . import views

# urlpatterns = [
#     path('api/', views.GameView.as_view()),
# ]

urlpatterns = [
    path('api/', views.SetupView.as_view()),
    path('api/<int:gs_id>/', views.GameView.as_view(), name="game_view")
]

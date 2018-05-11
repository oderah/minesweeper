from django.urls import path

from . import views

urlpatterns = [
    path('', views.index ),
    path('game/<int:gs_id>/', views.index2)
]

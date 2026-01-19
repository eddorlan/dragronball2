from django.urls import path
from . import views

urlpatterns = [
    path('', views.characters_view, name='characters'),
]
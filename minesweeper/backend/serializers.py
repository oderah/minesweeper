from rest_framework import serializers

from backend.models import Cell, GameSession

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameSession
        fields = '__all__'

class CellSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cell
        fields = '__all__'

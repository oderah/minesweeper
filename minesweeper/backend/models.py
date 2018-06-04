from django.db import models

# Create your models here.
class GameSession(models.Model):
    DIFFICULTY = (
        ('BEG', 'Beginner'),
        ('INT', 'Intermediate'),
        ('PRO', 'Professional')
    )

    difficulty = models.CharField(max_length=12, choices=DIFFICULTY, default='BEG')
    flagsLeft = models.IntegerField()
    elapsedTime = models.IntegerField()
    countOpen = models.IntegerField(default=0)
    isOver = models.BooleanField(default=False)
    bigOpen = models.BooleanField(default=False)

    def __str__(self):
        return 'Session (flagsLeft=' + str(self.flagsLeft) + ', elapsedTime=' + str(self.elapsedTime) + ')'

class Cell(models.Model):
    x = models.IntegerField()
    y = models.IntegerField()
    isBomb = models.BooleanField(default=False)
    isOpen = models.BooleanField(default=False)
    isFlagged = models.BooleanField(default=False)
    gameSession = models.ForeignKey(GameSession, on_delete=models.CASCADE)

    def clean(self):
        if self.isOpen and self.isFlagged:
            raise ValidationError('Cell cannot be flagged while open')

    def __str__(self):
        return 'Cell (' + str(self.x) + ',' + str(self.y) + ',' + str(self.isBomb) + ')'

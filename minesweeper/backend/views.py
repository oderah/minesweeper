from django.shortcuts import render

from backend.models import Cell, GameSession

from backend.serializers import GameSerializer

from rest_framework import generics

from django.http import HttpResponse, JsonResponse

import random

import math

all_bombs = [] # list of all bomb coordinates

# Create your views here.

# setup view
class SetupView(generics.ListCreateAPIView):
    queryset = GameSession.objects.all()
    serializer_class = GameSerializer

    # this function randomly generates a number of unique bomb coordinates
    def get_bombs(self, difficulty, numCells):
        global all_bombs

        allBombs = []

        # determine number of bombs based on difficulty
        numBombs = 20 if difficulty == "Beginner" else 90 if difficulty == "Intermediate" else 250

        # generate bomb coordinates
        bombs = []
        for i in range(0, numBombs):

            bomb = (random.randrange(0, numCells), random.randrange(0, numCells))

            while bomb in all_bombs:
                bomb = (random.randrange(0, numCells), random.randrange(0, numCells))

            bombs.append(bomb)

        all_bombs = bombs


    # this function creates a new game session and returns its id
    def create_newGame(self, difficulty):
        print("CREATING NEW GAME ...")
        # determine number of flags based on difficulty
        flags = 15 if difficulty == "Beginner" else 60 if difficulty == "Intermediate" else 100

        # create new game session
        gs = GameSession(difficulty=difficulty, flagsLeft=flags, elapsedTime=0)
        gs.save()

        gs_id = gs.id

        # determine number of cells based on difficulty
        numCells = 15 if difficulty == "Beginner" else 30 if difficulty == "Intermediate" else 50

        # generate bombs
        self.get_bombs(difficulty, numCells)

        # create cells for game session
        for i in range(0, numCells):
            for j in range(0, numCells):
                c = gs.cell_set.create(x=i, y=j)
                if (i,j) in all_bombs:
                    c.isBomb = True
                    c.save()

        return gs.id

    # post method
    def post(self, request, format=None):
        # if request is create new game
        if request.data["msg"] == "new":
            gs_id = self.create_newGame(request.data["diff"])
            response = {"gs_id":gs_id, "bigOpen":False}
            return JsonResponse(response, safe=False)


# game view
class GameView(generics.ListCreateAPIView):

    # this function counts neighbouring bombs to cell (x,y)
    def count_close_bombs(self, x, y, **kwargs):

        # coordinates to check
        to_check = [
            (x-1, y-1), (x-1, y), (x-1, y+1),
            (x, y-1), (x, y+1),
            (x+1, y-1), (x+1, y), (x+1, y+1)
        ]
        gs = GameSession.objects.get(id=self.kwargs.get("gs_id"))

        if gs:
            boardWidth = math.sqrt(gs.cell_set.all().count()) # width of the board

            close_bombs = 0

            # check all neighbours of cell (x,y)
            for c in to_check:
                if c[0] in range(0, int(boardWidth)) and c[1] in range(0, int(boardWidth)):

                    cell = gs.cell_set.get(x=c[0], y=c[1])
                    if cell.isBomb: close_bombs += 1

            return close_bombs

    # this function checks if a game has been won
    def isVictory(self, **kwargs):
        global all_bombs

        gs = GameSession.objects.get(id=self.kwargs.get("gs_id"))

        if gs:
            count_to_win = gs.cell_set.all().count() - len(all_bombs)

            # if no other non bomb cells to open
            if gs.countOpen == count_to_win:
                gs.isOver = True
                gs.save()
                return True

            else: return False


    # this function opens a cell.
    def open_cell(self, x, y, **kwargs):
        global all_bombs

        gs = GameSession.objects.get(id=self.kwargs.get("gs_id"))

        if gs:
            cell = gs.cell_set.get(x=x, y=y)

            # cannot open flagged cells
            if cell.isFlagged:
                return {"msg":3}

            # reveal content if already opened
            if cell.isOpen:
                if cell.isBomb: return {"msg":4,"label":"*"}
                return {"msg":1, "label":self.count_close_bombs(x, y)}

            # else open the cell
            else:
                cell.isOpen = True
                cell.save()

                # set game as over if cell is bomb
                if cell.isBomb:
                    gs.isOver = True
                    gs.save()
                    return {"msg":2, "closeBombs":"*", "allBombs": all_bombs}

                # if cell is not bomb, return count of close bombs
                numBombs = self.count_close_bombs(x, y)

                # increment count of open cells
                gs.countOpen += 1
                gs.save()

                return {"msg":0, "closeBombs":numBombs, "isVictory":self.isVictory()}

    # post method
    def post(self, request, fromat=None, **kwargs):
        global all_bombs

        gs = GameSession.objects.get(id=self.kwargs.get("gs_id"))

        if gs:
            # request to open cell
            if request.data["msg"] == "old":
                msg = self.open_cell(request.data["x"], request.data["y"])
                return JsonResponse(msg, safe=False)

            # request to get flagsLeft and elapsedTime
            elif request.data["msg"] == "get":
                if request.data["component"] == "FlagsLeft":
                    return JsonResponse({"text":gs.flagsLeft})
                else:
                    return JsonResponse({"text":gs.elapsedTime})

            # request to update elapsedTime
            elif request.data["msg"] == "timeUpdate":
                e_time = request.data["elapsedTime"]

                gs.elapsedTime = e_time
                gs.save()
                return JsonResponse({"msg":"done"})

            # request to end game
            elif request.data["msg"] == "endGame":
                gs.isOver = True
                gs.save()
                return JsonResponse({"msg":"done"})

            # request to check if game is over
            elif request.data["msg"] == "isOver?":
                return JsonResponse({"msg":gs.isOver, "bigOpen":gs.bigOpen})

            # request to check if a cell is open
            elif request.data["msg"] == "isOpen?":
                cell = gs.cell_set.get(x=request.data["x"], y=request.data["y"])

                msg = {}

                if cell.isOpen:
                    # call to open_cell to reveal content of cell
                    msg = self.open_cell(request.data["x"], request.data["y"])

                # return response, content of cell and if cell is flagged
                return JsonResponse({"msg":cell.isOpen, "msg2":msg, "isFlagged":cell.isFlagged})

            # request to update bigOpen
            elif request.data["msg"] == "bigOpen":
                print("===========>", request.data)
                gs.bigOpen = request.data["toggle"]
                gs.save()

                return JsonResponse({"msg":"done"})

            # request to flag or unflag cell
            else:
                cell = gs.cell_set.get(x=request.data["x"], y=request.data["y"])

                if not cell.isOpen:
                    # flag cell if not flagged
                    if cell.isFlagged:
                        cell.isFlagged = False
                        gs.flagsLeft += 1

                    # unflag cell if it is flagged
                    else:
                        if gs.flagsLeft > 0:
                            cell.isFlagged = True
                            gs.flagsLeft -= 1
                        else: return JsonResponse({"msg":"failed"})

                    cell.save()
                    gs.save()

                    return JsonResponse({"msg":"done", "flagsLeft":gs.flagsLeft})

                # cannot flag or unflag open cells
                else:
                    return JsonResponse({"msg":"failed"})


        else:
            return JsonResponse({"msg":"noGame"})

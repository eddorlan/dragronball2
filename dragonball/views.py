from django.shortcuts import render

def characters_view(request):
    return render(request, 'characters.html')

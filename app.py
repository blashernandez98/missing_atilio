from flask import Flask, render_template, request
from json import load
from random import randint

app = Flask(__name__)

@app.route('/')
def index():
    with open("./static/partidos.json") as f:
        partidos = load(f)
    ran = randint(0, 1490)
    return render_template('juego.html', match=partidos[ran])


if __name__ == '__main__':
    app.run(debug=True)
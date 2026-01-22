from fastapi import FastAPI
from pydantic import BaseModel

from study.summarize import summarize_text
from study.flashcard import generate_flashcards
from study.quiz import generate_quiz

from generic.genapp import create_app

app = FastAPI()

class StudyRequest(BaseModel):
    text: str
class AppRequest(BaseModel):
    text: str

@app.post("/study/summarize")
def summarize(req: StudyRequest):
    return {"summary": summarize_text(req.text)}

@app.post("/study/flashcards")
def flashcards(req: StudyRequest):
    return {"flashcards": generate_flashcards(req.text)}

@app.post("/study/quiz")
def quiz(req: StudyRequest):
    return {"quiz": generate_quiz(req.text)}

@app.post("/generic/genapp")
def build_app(req: AppRequest):
    app_data = create_app(req.text)
    return {
        "html": app_data["html"],
        "script": app_data["script"]
    }
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def generate_answer(question: str, context: str, history: str):
    prompt = f"""
You are an AI research assistant.

Answer the user's question using the provided documents and conversation history.

Conversation history:
{history}

Retrieved context:
{context}

Current user question:
{question}

Use the conversation history to understand references and follow-up questions.

Use the retrieved context as the primary source of factual information.

If the answer cannot be found in the provided documents, say:
"I couldn't find this information in the provided documents."

Answer clearly and concisely.
"""
    
    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt
    )

    return response.text

def generate_chat_title(question: str):
    prompt = f"""
Generate a short title for a chat based on the user's first question.

The title should:
- be 3 to 6 words
- describe the main topic of the question
- be concise
- not use quotation marks

User question:
{question}

Return only the title.
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt
    )

    return response.text.strip()
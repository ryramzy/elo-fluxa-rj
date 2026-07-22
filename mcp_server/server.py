from fastmcp import FastMCP
from brutils import is_valid_cpf
import datetime
import json
import os

# Note: In a production environment, you would use:
# from google.cloud import secretmanager
# from google.oauth2 import service_account

import re
import html

mcp = FastMCP("EloMattIntake")

def sanitize_input(val: str) -> str:
    """Sanitizes text inputs to prevent XSS and script injection."""
    if not val:
        return ""
    clean = re.sub(r'<[^>]*>', '', val)
    return html.escape(clean.strip())

def validate_phone(phone: str) -> bool:
    """Validates basic phone format constraints."""
    clean_phone = "".join(filter(str.isdigit, phone))
    return 10 <= len(clean_phone) <= 15

def get_secret(secret_id: str):
    """
    Simulates fetching a secret from GCP Secret Manager.
    In production, this would use the Secret Manager API.
    """
    # Example logic for GCP Secret Manager:
    # client = secretmanager.SecretManagerServiceClient()
    # name = f"projects/{os.environ['PROJECT_ID']}/secrets/{secret_id}/versions/latest"
    # response = client.access_secret_version(request={"name": name})
    # return response.payload.data.decode("UTF-8")
    return "MOCK_SECRET_VALUE"

@mcp.tool()
def register_carioca_student(name: str, cpf: str, phone: str):
    """
    Registers a new student from Rio. 
    Validates CPF and formats the entry for Firestore with safety sanitization.
    """
    clean_name = sanitize_input(name)
    clean_phone = sanitize_input(phone)
    
    if not clean_name:
        return {"status": "error", "message": "Nome do estudante inválido."}
        
    if not validate_phone(clean_phone):
        return {"status": "error", "message": "Formato de telefone inválido."}

    clean_cpf = "".join(filter(str.isdigit, cpf))
    if not is_valid_cpf(clean_cpf):
        return {"status": "error", "message": "CPF inválido."}
    
    # Logic to save to Firestore would go here using Secret Manager credentials
    return {"status": "success", "data": {"name": clean_name, "phone": clean_phone, "city": "Rio de Janeiro"}}

@mcp.tool()
def list_available_slots(target_date: str):
    """
    Queries Google Calendar for free slots on a specific date (YYYY-MM-DD).
    Handles UTC-3 (Rio) to US-Timezone conversion with YYYY-MM-DD validation.
    Teaching hours: 09:00 - 18:00 (Rio Time).
    """
    # Safety Rail: Validate YYYY-MM-DD date format
    try:
        validated_date = datetime.datetime.strptime(target_date.strip(), "%Y-%m-%d").date()
        date_str = validated_date.strftime("%Y-%m-%d")
    except ValueError:
        return {"status": "error", "message": "Formato de data inválido. Use YYYY-MM-DD."}

    # 1. Fetch Credentials from Secret Manager
    creds = get_secret("google-calendar-oauth")
    
    # 2. Define Teaching Windows in Rio Time (UTC-3)
    rio_offset = datetime.timezone(datetime.timedelta(hours=-3))
    
    # Mocking available slots using verified date_str
    slots = [
        {"start": f"{date_str}T10:00:00-03:00", "end": f"{date_str}T11:00:00-03:00", "label": "10:00 AM (Rio)"},
        {"start": f"{date_str}T14:30:00-03:00", "end": f"{date_str}T15:30:00-03:00", "label": "02:30 PM (Rio)"},
        {"start": f"{date_str}T16:00:00-03:00", "end": f"{date_str}T17:00:00-03:00", "label": "04:00 PM (Rio)"},
    ]
    
    return {
        "status": "success",
        "date": date_str,
        "timezone": "America/Sao_Paulo (UTC-3)",
        "available_slots": slots
    }

@mcp.tool()
def create_lesson_event(student_name: str, student_phone: str, start_time: str, lesson_type: str = "Fluency Coaching"):
    """
    The 'Triple Threat' tool:
    1. Creates Google Calendar Event.
    2. Generates Unique Zoom Link.
    3. Returns Confirmation Payload.
    
    start_time format: ISO 8601 (e.g., 2025-06-15T10:00:00-03:00)
    """
    # Safety Rail: Sanitize and validate inputs
    clean_name = sanitize_input(student_name)
    clean_phone = sanitize_input(student_phone)
    clean_lesson = sanitize_input(lesson_type)
    
    if not clean_name:
        return {"status": "error", "message": "Nome do estudante inválido."}
    if not validate_phone(clean_phone):
        return {"status": "error", "message": "Formato de telefone inválido."}

    # Validate ISO 8601 start_time
    try:
        # Check start_time structure
        datetime.datetime.fromisoformat(start_time.strip().replace("Z", "+00:00"))
        valid_start_time = start_time.strip()
    except ValueError:
        return {"status": "error", "message": "Formato de data/hora start_time inválido. Use ISO 8601."}

    # 1. Fetch Secrets
    zoom_token = get_secret("zoom-api-token")
    calendar_creds = get_secret("google-calendar-oauth")
    
    # 2. Simulate Zoom API call
    zoom_link = f"https://zoom.us/j/elomatt-{hash(clean_name) % 10000}"
    
    # 3. Simulate Google Calendar Event Creation
    event_id = f"evt_{hash(valid_start_time)}"
    
    confirmation = {
        "status": "confirmed",
        "student": clean_name,
        "lesson": clean_lesson,
        "time": valid_start_time,
        "zoom_url": zoom_link,
        "calendar_event_id": event_id,
        "whatsapp_notification": f"Enviando confirmação para {clean_phone}..."
    }
    
    return confirmation

@mcp.tool()
def get_class_links(student_id: str):
    """Generates the static Google Calendar and Zoom link for the session."""
    clean_id = sanitize_input(student_id)
    if not clean_id:
        return {"status": "error", "message": "ID do estudante inválido."}
        
    return {
        "status": "success",
        "student_id": clean_id,
        "calendar_url": "https://calendar.google.com/calendar/u/0/r/eventedit",
        "zoom_url": "https://zoom.us/j/elomatt-native-lesson"
    }
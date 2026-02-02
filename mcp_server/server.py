from fastmcp import FastMCP
from brutils import is_valid_cpf
import datetime
import json
import os

# Note: In a production environment, you would use:
# from google.cloud import secretmanager
# from google.oauth2 import service_account

mcp = FastMCP("EloMattIntake")

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
    Validates CPF and formats the entry for Firestore.
    """
    clean_cpf = "".join(filter(str.isdigit, cpf))
    if not is_valid_cpf(clean_cpf):
        return {"status": "error", "message": "CPF inválido."}
    
    # Logic to save to Firestore would go here using Secret Manager credentials
    return {"status": "success", "data": {"name": name, "city": "Rio de Janeiro"}}

@mcp.tool()
def list_available_slots(target_date: str):
    """
    Queries Google Calendar for free slots on a specific date (YYYY-MM-DD).
    Handles UTC-3 (Rio) to US-Timezone conversion.
    Teaching hours: 09:00 - 18:00 (Rio Time).
    """
    # 1. Fetch Credentials from Secret Manager
    creds = get_secret("google-calendar-oauth")
    
    # 2. Define Teaching Windows in Rio Time (UTC-3)
    # This logic would normally query the 'freebusy' endpoint of Google Calendar API
    rio_offset = datetime.timezone(datetime.timedelta(hours=-3))
    
    # Mocking available slots
    slots = [
        {"start": f"{target_date}T10:00:00-03:00", "end": f"{target_date}T11:00:00-03:00", "label": "10:00 AM (Rio)"},
        {"start": f"{target_date}T14:30:00-03:00", "end": f"{target_date}T15:30:00-03:00", "label": "02:30 PM (Rio)"},
        {"start": f"{target_date}T16:00:00-03:00", "end": f"{target_date}T17:00:00-03:00", "label": "04:00 PM (Rio)"},
    ]
    
    return {
        "date": target_date,
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
    # 1. Fetch Secrets
    zoom_token = get_secret("zoom-api-token")
    calendar_creds = get_secret("google-calendar-oauth")
    
    # 2. Simulate Zoom API call
    zoom_link = f"https://zoom.us/j/elomatt-{hash(student_name) % 10000}"
    
    # 3. Simulate Google Calendar Event Creation
    event_id = f"evt_{hash(start_time)}"
    
    confirmation = {
        "status": "confirmed",
        "student": student_name,
        "lesson": lesson_type,
        "time": start_time,
        "zoom_url": zoom_link,
        "calendar_event_id": event_id,
        "whatsapp_notification": f"Enviando confirmação para {student_phone}..."
    }
    
    return confirmation

@mcp.tool()
def get_class_links(student_id: str):
    """Generates the static Google Calendar and Zoom link for the session."""
    return {
        "calendar_url": "https://calendar.google.com/calendar/u/0/r/eventedit",
        "zoom_url": "https://zoom.us/j/elomatt-native-lesson"
    }
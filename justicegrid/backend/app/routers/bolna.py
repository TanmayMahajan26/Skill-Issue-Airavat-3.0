from fastapi import APIRouter, Request, HTTPException
import httpx
import os
import json
from pydantic import BaseModel

router = APIRouter()

BOLNA_API_KEY = "bn-e900bcdc6a614267b23c3734761f2238"
BOLNA_AGENT_ID = "3b9accbc-995e-4076-badf-c76d3ec8cd1b"

# In-memory store for webhook events for demo purposes
webhook_logs = []

class CallRequest(BaseModel):
    recipient_phone_number: str

@router.post("/trigger_call")
async def trigger_call(req: CallRequest):
    """Triggers an outbound call using Bolna AI API."""
    url = "https://api.bolna.ai/call"
    
    headers = {
        "Authorization": f"Bearer {BOLNA_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "agent_id": BOLNA_AGENT_ID,
        "recipient_phone_number": req.recipient_phone_number
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                # Log execution id locally
                webhook_logs.append({
                    "event": "call_initiated",
                    "execution_id": data.get("execution_id"),
                    "recipient": req.recipient_phone_number,
                    "timestamp": "now"
                })
                return {"success": True, "data": data}
            else:
                return {"success": False, "error": response.text, "status": response.status_code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def bolna_webhook(request: Request):
    """Receives events from Bolna AI (status updates, transcripts, execution reports)."""
    try:
        data = await request.json()
        
        # In Bolna, webhook payload contains status and execution details
        # For this demo, let's store the entire payload in memory
        
        webhook_logs.insert(0, data) # Insert at beginning so newest is first
        
        # Keep only the last 50 events to avoid memory bloat
        if len(webhook_logs) > 50:
            webhook_logs.pop()
            
        return {"status": "received"}
    except Exception as e:
        print(f"Error processing Bolna webhook: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")

@router.get("/logs")
def get_webhook_logs():
    """Retrieve the recent webhook logs for frontend display."""
    return {"logs": webhook_logs}

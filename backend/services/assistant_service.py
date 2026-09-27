"""Role-scoped context for the voice/text assistant with enhanced Gemini integration."""

from __future__ import annotations

from sqlalchemy.orm import Session

from backend.models.user import UserRecord
from backend.services import me_service
from backend.services.ml_service import ml_service
from backend.services.sensor_service import latest_reading


PRODUCT_KNOWLEDGE = """
HoneyChain product (facts, not this user's private numbers):
- Smart-hive telemetry plus harvest-to-jar traceability. Ledger is a local SHA-256 hash-chain, not a public blockchain.
- Demo roles: beekeeper, cluster/KVIC officer, lab inspector, admin. Consumers verify honey with no login.
- Beekeeper flow: watch hive → log harvest → officer drafts a batch (pending lab) → lab records pass/fail → officer oracle-commits → package + QR → consumer verify.
- Oracle: declared batch weight must stay within 10% of sensor-logged harvest kilograms.
- Lab desk queue is draft batches with lab_test_result pending. Commit is blocked until a recorded pass.
- Consumer Verify recomputes the ledger live and logs a scan. CloneWatch flags too-many scans, implausible travel, or oracle-failed batches.
- Market Linkage shows live demand separately from one-time example/seed listings.
- Insights: colony health RandomForest and yield models trained on MSPB D1/D2. Public model card shows honest held-out health accuracy 40%.
- UI languages: English, Hindi, Bengali, Tamil, Kannada, Telugu, Marathi. IDs and hashes stay untranslated.
- Guided tour reads each step aloud in the selected language. Ask HoneyChain answers in the language of the question.
- Voice assistant: Can answer questions via text or voice input, responds in user's language, provides step-by-step guidance.
- The assistant can help with: hive monitoring, harvest logging, batch management, lab testing, QR verification, market demand, and troubleshooting.
""".strip()


ROLE_SPECIFIC_HELP = {
    "beekeeper": """
As a beekeeper, you can:
- Monitor your hives' live sensor data (weight, temperature, humidity)
- View AI-powered colony health predictions and yield forecasts
- Log harvests and track their status through the ledger
- Take photos of hives/combs and get preliminary AI observations
- Check market demand to time your sales
- Generate QR codes for packaged honey
Ask me about any hive readings, harvest procedures, or how to use any feature!
""",
    "officer": """
As a KVIC Field Officer, you can:
- View all hives and harvests in your cluster/region
- Draft batches from approved harvests (pending lab inspection)
- Run oracle checks (10% weight tolerance) before committing batches
- Review lab test results and commit passing batches to the ledger
- Manage beekeepers in your cluster
- Monitor CloneWatch alerts for suspicious scanning patterns
Ask me about batch creation, oracle rules, or managing your cluster!
""",
    "lab": """
As a Lab Inspector, you can:
- View your pending test queue (draft batches awaiting inspection)
- Record moisture percentage and purity test results
- Mark batches as pass/fail based on quality standards
- Review test history and batch details
- See which batches are blocking ledger commits
Ask me about test procedures, quality thresholds, or your pending queue!
""",
    "admin": """
As a KVIC Admin, you can:
- View system-wide analytics and dashboards
- Manage users (beekeepers, officers, lab inspectors)
- Monitor ledger integrity across all regions
- Review CloneWatch alerts and market activity
- Access admin tools and user management
- View aggregate statistics and reports
Ask me about system administration, user management, or system-wide analytics!
""",
}


def user_context(session: Session, user: UserRecord) -> str:
    """Build comprehensive context for the user including role-specific guidance."""
    hives = me_service.hives_for_user(session, user)
    harvests = me_service.harvests_for_user(session, user)
    
    lines = [
        f"Signed-in user: {user.display_name} ({user.username})",
        f"Role: {user.role}",
        f"Region: {user.region or 'not set'}",
        f"Cluster: {user.cluster or 'not set'}",
        f"Preferred language: {user.language or 'en'}",
        "",
    ]
    
    # Add role-specific help
    if user.role in ROLE_SPECIFIC_HELP:
        lines.append("=== YOUR ROLE CAPABILITIES ===")
        lines.append(ROLE_SPECIFIC_HELP[user.role])
        lines.append("")
    
    lines.append(f"Hives visible to this user ({len(hives)}):")
    if not hives:
        lines.append("- none assigned yet")
    else:
        for hive in hives:
            reading = latest_reading(session, hive.hive_id)
            if reading is None:
                lines.append(f"- {hive.hive_id} ({hive.name}): awaiting sensor data")
                continue
            try:
                insights = ml_service.insights_for_hive(session, hive.hive_id, attach_ai=False)
                status = insights.health.status
                forecast = insights.forecast.predicted_weight_kg
                confidence = insights.health.confidence * 100
            except Exception:
                status = "not yet available"
                forecast = None
                confidence = 0
            extra = f", forecast {forecast:.2f} kg" if forecast is not None else ""
            conf_str = f" (confidence: {confidence:.0f}%)" if confidence > 0 else ""
            lines.append(
                f"- {hive.hive_id} ({hive.name}): live weight {reading.weight_kg:.2f} kg, "
                f"temp {reading.inside_temperature_c:.1f} °C, humidity {reading.humidity_pct:.1f}%, "
                f"colony health: {status}{conf_str}{extra}"
            )
    
    lines.append("")
    pending = [row for row in harvests if row.get("status") == "pending"]
    committed = [row for row in harvests if row.get("status") == "committed"]
    lines.append(f"Harvests visible: {len(harvests)} total, {len(committed)} committed to ledger, {len(pending)} pending.")
    
    if harvests:
        lines.append("Recent harvests:")
        for row in harvests[:5]:  # Show top 5
            lines.append(
                f"- {row['harvest_id']}: hive {row['hive_id']}, {row['raw_weight_kg']} kg, status: {row['status']}"
            )
    
    lines.append("")
    lines.append("IMPORTANT RULES:")
    lines.append("- Only mention hives, harvests, or people that are listed above in this context.")
    lines.append("- Do not invent or hallucinate numbers, names, or IDs.")
    lines.append("- If data is not available, say so clearly.")
    lines.append("- Provide actionable, step-by-step guidance when asked how to do something.")
    lines.append("- Be concise but complete - explain the 'why' along with the 'how'.")
    lines.append("")
    lines.append("=== PRODUCT KNOWLEDGE ===")
    lines.append(PRODUCT_KNOWLEDGE)
    return "\n".join(lines)

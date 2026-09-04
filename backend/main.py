import os
import re
import shutil
import uuid
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from supabase import create_client, Client

from docling.document_converter import (
    DocumentConverter,
    InputFormat,
)
from docling.datamodel.pipeline_options import (
    PdfPipelineOptions,
)
from docling.document_converter import (
    PdfFormatOption,
)


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")

if not SUPABASE_URL:
    raise RuntimeError("SUPABASE_URL is missing from .env")

if not SUPABASE_SECRET_KEY:
    raise RuntimeError("SUPABASE_SECRET_KEY is missing from .env")


# ============================================================
# SUPABASE
# ============================================================

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_SECRET_KEY,
)

BUCKET_NAME = "land-documents"


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="MyBhoomi AI Backend",
    description="AI-powered legacy land record digitization backend",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:8082",
        "http://127.0.0.1:8082",
        "http://localhost:19006",
        "http://127.0.0.1:19006",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# DIRECTORIES
# ============================================================

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


# ============================================================
# DOCLING CONFIGURATION
# ============================================================

pipeline_options = PdfPipelineOptions()

pipeline_options.do_ocr = True
pipeline_options.do_table_structure = True

converter = DocumentConverter(
    format_options={
        InputFormat.PDF: PdfFormatOption(
            pipeline_options=pipeline_options
        )
    }
)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def root():
    return {
        "status": "running",
        "service": "MyBhoomi AI Backend",
        "database": "Supabase",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "MyBhoomi AI Backend",
        "database": "Supabase",
    }


# ============================================================
# SUPABASE CONNECTION TEST
# ============================================================

@app.get("/supabase-test")
def supabase_test():

    try:
        response = (
            supabase
            .table("land_records")
            .select("id")
            .limit(1)
            .execute()
        )

        return {
            "status": "connected",
            "table": "land_records",
            "rows_found": len(response.data or []),
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Supabase connection failed: {str(e)}",
        )


# ============================================================
# LAND FIELD EXTRACTION
# ============================================================

def extract_land_fields(text: str):

    fields = {
        "owner_name": None,
        "survey_number": None,
        "khata_number": None,
        "area": None,
        "unit": None,
        "village": None,
        "tehsil": None,
        "district": None,
        "state": None,
        "land_type": None,
        "record_number": None,
        "assessment_number": None,
        "document_date": None,
    }

    # --------------------------------------------------------
    # Convert markdown table into simple key/value pairs
    # --------------------------------------------------------

    lines = text.splitlines()

    for line in lines:

        line = line.strip()

        if not line.startswith("|"):
            continue

        parts = [
            part.strip()
            for part in line.strip("|").split("|")
        ]

        if len(parts) < 2:
            continue

        key = parts[0].lower()
        value = parts[1].strip()

        if not value:
            continue

        # ----------------------------------------------------
        # Owner
        # ----------------------------------------------------

        if "owner" in key:

            fields["owner_name"] = value

        # ----------------------------------------------------
        # Survey number
        # ----------------------------------------------------

        elif "survey" in key:

            fields["survey_number"] = value

        # ----------------------------------------------------
        # Khata
        # ----------------------------------------------------

        elif "khata" in key:

            fields["khata_number"] = value

        # ----------------------------------------------------
        # Village
        # ----------------------------------------------------

        elif "village" in key:

            fields["village"] = value

        # ----------------------------------------------------
        # Taluk / Tehsil
        # ----------------------------------------------------

        elif "taluk" in key or "tehsil" in key:

            fields["tehsil"] = value

        # ----------------------------------------------------
        # District
        # ----------------------------------------------------

        elif "district" in key:

            fields["district"] = value

        # ----------------------------------------------------
        # State
        # ----------------------------------------------------

        elif "state" in key:

            fields["state"] = value

        # ----------------------------------------------------
        # Land type
        # ----------------------------------------------------

        elif "land type" in key or "classification" in key:

            fields["land_type"] = value

        # ----------------------------------------------------
        # Record / Patta
        # ----------------------------------------------------

        elif "record" in key or "patta" in key:

            fields["record_number"] = value

        # ----------------------------------------------------
        # Assessment
        # ----------------------------------------------------

        elif "assessment" in key:

            fields["assessment_number"] = value

        # ----------------------------------------------------
        # Date
        # ----------------------------------------------------

        elif "date" in key:

            fields["document_date"] = value

        # ----------------------------------------------------
        # Extent / Area
        # ----------------------------------------------------

        elif "extent" in key or "area" in key:

            match = re.search(
                r"([\d.]+)\s*(acres?|hectares?|ha|sq\.?\s*ft|sq\.?\s*m|cents?)?",
                value,
                re.IGNORECASE,
            )

            if match:

                fields["area"] = match.group(1)

                if match.group(2):

                    fields["unit"] = (
                        match.group(2)
                        .lower()
                        .replace(".", "")
                    )

    return fields


# ============================================================
# CONFIDENCE
# ============================================================

def calculate_confidence(fields):

    confidence = {}

    for field, value in fields.items():

        if value is not None and str(value).strip():

            confidence[field] = 95

        else:

            confidence[field] = 0

    return confidence


# ============================================================
# VALIDATION
# ============================================================

def validate_land_record(fields):

    issues = []

    # --------------------------------------------------------
    # Owner
    # --------------------------------------------------------

    if not fields.get("owner_name"):

        issues.append({
            "field": "owner_name",
            "severity": "error",
            "message": "Owner name was not detected.",
        })

    # --------------------------------------------------------
    # Survey
    # --------------------------------------------------------

    if not fields.get("survey_number"):

        issues.append({
            "field": "survey_number",
            "severity": "error",
            "message": "Survey number was not detected.",
        })

    # --------------------------------------------------------
    # Khata
    # --------------------------------------------------------

    if not fields.get("khata_number"):

        issues.append({
            "field": "khata_number",
            "severity": "warning",
            "message": "Khata number was not detected.",
        })

    # --------------------------------------------------------
    # Area
    # --------------------------------------------------------

    area = fields.get("area")

    if not area:

        issues.append({
            "field": "area",
            "severity": "error",
            "message": "Land area was not detected.",
        })

    else:

        try:

            area_value = float(area)

            if area_value <= 0:

                issues.append({
                    "field": "area",
                    "severity": "error",
                    "message": "Land area must be greater than zero.",
                })

        except ValueError:

            issues.append({
                "field": "area",
                "severity": "error",
                "message": "Land area is not a valid number.",
            })

    # --------------------------------------------------------
    # Village
    # --------------------------------------------------------

    if not fields.get("village"):

        issues.append({
            "field": "village",
            "severity": "error",
            "message": "Village was not detected.",
        })

    # --------------------------------------------------------
    # District
    # --------------------------------------------------------

    if not fields.get("district"):

        issues.append({
            "field": "district",
            "severity": "error",
            "message": "District was not detected.",
        })

    # --------------------------------------------------------
    # Overall status
    # --------------------------------------------------------

    has_error = any(
        issue["severity"] == "error"
        for issue in issues
    )

    has_warning = any(
        issue["severity"] == "warning"
        for issue in issues
    )

    if has_error:

        status = "needs_review"

    elif has_warning:

        status = "review_recommended"

    else:

        status = "validated"

    return {
        "overall_status": status,
        "issues": issues,
    }


# ============================================================
# PROCESS DOCUMENT
# ============================================================

@app.post("/process-document")
async def process_document(
    file: UploadFile = File(...)
):

    # --------------------------------------------------------
    # Validate filename
    # --------------------------------------------------------

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No filename provided.",
        )

    original_filename = Path(file.filename).name

    extension = Path(original_filename).suffix.lower()

    allowed_extensions = {
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png",
    }

    if extension not in allowed_extensions:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type. "
                "Allowed: PDF, JPG, JPEG, PNG."
            ),
        )

    # --------------------------------------------------------
    # Create document ID
    # --------------------------------------------------------

    document_id = str(uuid.uuid4())

    # --------------------------------------------------------
    # Temporary local path
    # --------------------------------------------------------

    local_path = (
        UPLOAD_DIR
        / f"{document_id}{extension}"
    )

    # --------------------------------------------------------
    # Save uploaded file temporarily
    # --------------------------------------------------------

    try:

        with open(local_path, "wb") as buffer:

            shutil.copyfileobj(
                file.file,
                buffer,
            )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to save uploaded file: {str(e)}",
        )

    # --------------------------------------------------------
    # Upload original document to Supabase Storage
    # --------------------------------------------------------

    storage_path = (
        f"documents/{document_id}/{original_filename}"
    )

    try:

        with open(local_path, "rb") as document_file:

            file_bytes = document_file.read()

        supabase.storage.from_(BUCKET_NAME).upload(
            storage_path,
            file_bytes,
            {
                "content-type": (
                    file.content_type
                    or "application/octet-stream"
                ),
                "upsert": "false",
            },
        )

    except Exception as e:

        if local_path.exists():
            local_path.unlink()

        raise HTTPException(
            status_code=500,
            detail=f"Supabase Storage upload failed: {str(e)}",
        )

    # --------------------------------------------------------
    # Docling processing
    # --------------------------------------------------------

    try:

        result = converter.convert(
            str(local_path)
        )

        text = result.document.export_to_markdown()

    except Exception as e:

        if local_path.exists():
            local_path.unlink()

        raise HTTPException(
            status_code=500,
            detail=f"Document processing failed: {str(e)}",
        )

    # --------------------------------------------------------
    # Extract fields
    # --------------------------------------------------------

    extracted_data = extract_land_fields(text)

    # --------------------------------------------------------
    # Calculate confidence
    # --------------------------------------------------------

    confidence = calculate_confidence(
        extracted_data
    )

    # --------------------------------------------------------
    # Validate
    # --------------------------------------------------------

    validation = validate_land_record(
        extracted_data
    )

    validation_status = (
        validation["overall_status"]
    )

    # --------------------------------------------------------
    # Prepare database record
    # --------------------------------------------------------

    database_record = {

        "document_name": original_filename,

        "storage_path": storage_path,

        "owner_name": extracted_data["owner_name"],

        "survey_number": extracted_data["survey_number"],

        "khata_number": extracted_data["khata_number"],

        "area": (
            float(extracted_data["area"])
            if extracted_data["area"]
            else None
        ),

        "unit": extracted_data["unit"],

        "village": extracted_data["village"],

        "tehsil": extracted_data["tehsil"],

        "district": extracted_data["district"],

        "state": extracted_data["state"],

        "land_type": extracted_data["land_type"],

        "record_number": extracted_data["record_number"],

        "assessment_number": extracted_data[
            "assessment_number"
        ],

        "document_date": extracted_data[
            "document_date"
        ],

        "confidence": confidence,

        "validation": validation,

        "validation_status": validation_status,

        "raw_text": text,

        "reviewed": False,
    }

    # --------------------------------------------------------
    # Insert into Supabase PostgreSQL
    # --------------------------------------------------------

    try:

        db_response = (
            supabase
            .table("land_records")
            .insert(database_record)
            .execute()
        )

    except Exception as e:

        if local_path.exists():
            local_path.unlink()

        raise HTTPException(
            status_code=500,
            detail=f"Supabase database insert failed: {str(e)}",
        )

    # --------------------------------------------------------
    # Get inserted record
    # --------------------------------------------------------

    inserted_record = None

    if db_response.data:

        inserted_record = db_response.data[0]

    # --------------------------------------------------------
    # Delete temporary local file
    # --------------------------------------------------------

    if local_path.exists():

        local_path.unlink()

    # --------------------------------------------------------
    # Return result to Expo
    # --------------------------------------------------------

    return {

        "status": "success",

        "message": (
            "Document processed and saved "
            "to Supabase successfully."
        ),

        "record_id": (
            inserted_record.get("id")
            if inserted_record
            else None
        ),

        "filename": original_filename,

        "storage_path": storage_path,

        "document": {
            "text_length": len(text),
        },

        "extracted_data": extracted_data,

        "confidence": confidence,

        "validation": validation,

        "raw_text": text,
    }
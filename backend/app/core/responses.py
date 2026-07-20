from uuid import uuid4


def success_response(data: object, meta: dict[str, object] | None = None) -> dict[str, object]:
    response_meta = {"request_id": f"api-{uuid4().hex[:12]}"}
    if meta:
        response_meta.update(meta)
    return {"success": True, "data": data, "error": None, "meta": response_meta}


def error_response(code: str, message: str, details: list[dict[str, str]] | None = None) -> dict[str, object]:
    return {
        "success": False,
        "data": None,
        "error": {"code": code, "message": message, "details": details or []},
        "meta": {"request_id": f"api-{uuid4().hex[:12]}"},
    }

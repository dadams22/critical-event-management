from typing import Dict, Tuple, Literal

from fastapi import FastAPI
from fastapi.testclient import TestClient

HTTPMethod = Literal[
    "GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH", "TRACE", "CONNECT"
]


EXCEPTED_ENDPOINTS: Dict[str, Tuple[HTTPMethod, ...]] = {
    "/ping": ("GET",),
    "/organization": ("POST",),
    "/token": ("POST",),
    "/auth": ("POST",),
    # FastAPI default documentation endpoints
    "/openapi.json": ("GET",),
    "/docs": ("GET",),
    "/docs/oauth2-redirect": ("GET",),
    "/redoc": ("GET",),
}


def test_all_endpoints_require_auth(unauthenticated_client: TestClient, app: FastAPI):
    for route in app.routes:
        for method in route.methods:
            if (
                route.path in EXCEPTED_ENDPOINTS
                and method in EXCEPTED_ENDPOINTS[route.path]
                or method in ("HEAD", "OPTIONS")
            ):
                continue

            response = unauthenticated_client.request(method, route.path)
            assert (
                response.status_code == 401
            ), f"Endpoint {method} {route.path} should require auth"
            assert response.json() == {"detail": "Not authenticated"}

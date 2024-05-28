from human.data.models.base import Organization
from shared.image import generate_upload_image_base64


def test_create_site(client, organization: Organization, mocked_presigned_url: str):
    response = client.post(
        "/site",
        json={
            "organization_id": str(organization.id),
            "name": "test",
            "address": "1234 test st",
            "longitude": 0.0,
            "latitude": 2.0,
            "bounds": [[0, 0]],
            "buildings": [
                {
                    "organization_id": str(organization.id),
                    "name": "test building",
                    "floors": [
                        {
                            "name": "Test floor",
                            "floor_plan_bounds": [[0, 0]],
                            "floor_plan": generate_upload_image_base64(),
                        }
                    ],
                }
            ],
        },
    )
    assert response.status_code == 200, response.text

    response_data = response.json()
    print(response_data)
    assert response_data["name"] == "test"
    assert len(response_data["buildings"]) == 1
    assert len(response_data["buildings"][0]["floors"]) == 1
    assert (
        response_data["buildings"][0]["floors"][0]["floor_plan"] == mocked_presigned_url
    )


def test_create_site_no_buildings(
    client, organization: Organization, mocked_presigned_url: str
):
    response = client.post(
        "/site",
        json={
            "organization_id": str(organization.id),
            "name": "test",
            "address": "1234 test st",
            "longitude": 0.0,
            "latitude": 2.0,
            "bounds": [[0, 0]],
        },
    )
    assert response.status_code == 200, response.text

    response_data = response.json()
    print(response_data)
    assert response_data["name"] == "test"
    assert len(response_data["buildings"]) == 0


def test_get_sites(client, organization: Organization):
    response = client.get(f"/site")
    assert response.status_code == 200, response.text

    sites = response.json()
    assert isinstance(sites, list)
    # Further assertions can be added based on the expected structure of PSiteResponse objects

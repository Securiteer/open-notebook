from unittest.mock import AsyncMock, patch

import pytest
from fastapi import Depends
from fastapi.testclient import TestClient

from api.auth import security


@pytest.fixture
def client():
    """Create test client after environment variables have been cleared by conftest."""
    from api.auth import check_api_password
    from api.main import app

    app.dependency_overrides[check_api_password] = lambda: True

    app.dependency_overrides[security] = lambda: True
    from api.auth import check_api_password
    app.dependency_overrides[check_api_password] = lambda: True
    return TestClient(app)


class TestModelCreation:
    """Test suite for Model Creation endpoint."""

    @pytest.mark.asyncio
    @patch("open_notebook.database.repository.repo_query", new_callable=AsyncMock)
    @patch("api.routers.models.Model.get_all", new_callable=AsyncMock)
    @patch("api.routers.models.Model.save", new_callable=AsyncMock)
    async def test_create_duplicate_model_same_case(self, mock_save, mock_get_all, mock_repo_query, client):
        mock_repo_query.return_value = [{"id": "model:existing", "name": "MyModel"}]
        """Test creating a model with the same name and case fails."""
        mock_existing = AsyncMock()
        mock_existing.name = "MyModel"
        mock_existing.provider = "openai"
        mock_existing.model_type = "language"
        mock_get_all.return_value = [mock_existing]

        response = client.post(
            "/api/models",
            json={
                "name": "MyModel",
                "provider": "openai",
                "type": "language",
                "internal_id": "gpt-4",
            },
        )
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]

    @pytest.mark.asyncio
    @patch("open_notebook.database.repository.repo_query", new_callable=AsyncMock)
    @patch("api.routers.models.Model.get_all", new_callable=AsyncMock)
    @patch("api.routers.models.Model.save", new_callable=AsyncMock)
    async def test_create_duplicate_model_different_case(self, mock_save, mock_get_all, mock_repo_query, client):
        mock_repo_query.return_value = [{"id": "model:existing", "name": "MyModel"}]
        """Test creating a model with the same name but different case fails."""
        mock_existing = AsyncMock()
        mock_existing.name = "mymodel"
        mock_existing.provider = "openai"
        mock_existing.model_type = "language"
        mock_get_all.return_value = [mock_existing]

        response = client.post(
            "/api/models",
            json={
                "name": "MyModel",  # Different case
                "provider": "openai",
                "type": "language",
                "internal_id": "gpt-4",
            },
        )
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]

    @pytest.mark.asyncio
    @patch("open_notebook.database.repository.repo_query", new_callable=AsyncMock)
    @patch("api.routers.models.Model.get_all", new_callable=AsyncMock)
    @patch("api.routers.models.Model.save", new_callable=AsyncMock)
    async def test_create_same_model_name_different_provider(
        self, mock_save, mock_get_all, mock_repo_query, client
    ):
        mock_repo_query.return_value = [{"id": "model:existing", "name": "MyModel"}]
        """Test creating models with same name but different providers fails."""
        mock_existing = AsyncMock()
        mock_existing.name = "MyModel"
        mock_existing.provider = "anthropic"
        mock_existing.model_type = "language"
        mock_get_all.return_value = [mock_existing]

        response = client.post(
            "/api/models",
            json={
                "name": "MyModel",
                "provider": "openai",  # Different provider
                "type": "language",
                "internal_id": "gpt-4",
            },
        )
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]

    @pytest.mark.asyncio
    @patch("open_notebook.database.repository.repo_query", new_callable=AsyncMock)
    @patch("api.routers.models.Model.get_all", new_callable=AsyncMock)
    @patch("api.routers.models.Model.save", new_callable=AsyncMock)
    async def test_create_same_model_name_different_type(self, mock_save, mock_get_all, mock_repo_query, client):
        mock_repo_query.return_value = [{"id": "model:existing", "name": "MyModel"}]
        """Test creating models with same name but different types fails."""
        mock_existing = AsyncMock()
        mock_existing.name = "MyModel"
        mock_existing.provider = "openai"
        mock_existing.model_type = "language"
        mock_get_all.return_value = [mock_existing]

        response = client.post(
            "/api/models",
            json={
                "name": "MyModel",
                "provider": "openai",
                "type": "embedding",  # Different type
                "internal_id": "text-embedding-3-small",
            },
        )
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]


class TestModelsProviderAvailability:
    """Test suite for Models Provider Availability endpoint."""

    @patch("api.routers.models.os.environ.get")
    @patch("api.routers.models.AIFactory.get_available_providers")
    def test_generic_env_var_enables_all_modes(self, mock_esperanto, mock_env, client):
        """Test that the generic OPENAI_COMPATIBLE_BASE_URL enables openai-compatible for all modalities."""

        # Mock environment: only generic var is set
        def env_side_effect(key):
            if key == "OPENAI_COMPATIBLE_BASE_URL":
                return "http://localhost:1234/v1"
            return None

        mock_env.side_effect = env_side_effect

        # Mock Esperanto response (it returns openai-compatible for everything)
        mock_esperanto.return_value = {
            "language": ["openai-compatible"],
            "embedding": ["openai-compatible"],
            "speech_to_text": ["openai-compatible"],
            "text_to_speech": ["openai-compatible"],
        }

        response = client.get("/api/models/providers", headers={"Authorization": "Bearer bypass"})
        assert response.status_code == 200

        providers = response.json()
        # Verify it's present in all lists
        assert "language" in providers.get("supported_types", {}).get("openai-compatible", [])
        assert "embedding" in providers.get("supported_types", {}).get("openai-compatible", [])
        assert "speech_to_text" in providers.get("supported_types", {}).get("openai-compatible", [])
        assert "text_to_speech" in providers.get("supported_types", {}).get("openai-compatible", [])

    @patch("api.routers.models.os.environ.get")
    @patch("api.routers.models.AIFactory.get_available_providers")
    def test_mode_specific_env_vars_llm_embedding(self, mock_esperanto, mock_env, client):
        """Test that mode-specific env vars only enable their specific modality."""

        # Mock environment: LLM and EMBEDDING specific vars are set
        def env_side_effect(key):
            if key == "OPENAI_COMPATIBLE_BASE_URL_LLM":
                return "http://localhost:1234/v1"
            if key == "OPENAI_COMPATIBLE_BASE_URL_EMBEDDING":
                return "http://localhost:5678/v1"
            return None

        mock_env.side_effect = env_side_effect

        # Mock Esperanto response
        mock_esperanto.return_value = {
            "language": ["openai-compatible"],
            "embedding": ["openai-compatible"],
            "speech_to_text": ["openai-compatible"],
            "text_to_speech": ["openai-compatible"],
        }

        response = client.get("/api/models/providers", headers={"Authorization": "Bearer bypass"})
        assert response.status_code == 200

        providers = response.json()
        # Should be present for enabled modes
        assert "language" in providers.get("supported_types", {}).get("openai-compatible", [])
        assert "embedding" in providers.get("supported_types", {}).get("openai-compatible", [])
        # Should be missing for disabled modes
        assert "speech_to_text" not in providers.get("supported_types", {}).get("openai-compatible", [])
        assert "text_to_speech" not in providers.get("supported_types", {}).get("openai-compatible", [])

    @patch("api.routers.models.os.environ.get")
    @patch("api.routers.models.AIFactory.get_available_providers")
    def test_no_env_vars_set(self, mock_esperanto, mock_env, client):
        """Test that openai-compatible is not available when no env vars are set."""

        # Mock environment: no openai-compatible vars are set
        def env_side_effect(key):
            return None

        mock_env.side_effect = env_side_effect

        # Mock Esperanto response
        mock_esperanto.return_value = {
            "language": ["openai-compatible"],
            "embedding": ["openai-compatible"],
        }

        response = client.get("/api/models/providers", headers={"Authorization": "Bearer bypass"})
        assert response.status_code == 200

        providers = response.json()
        # Should be missing everywhere
        assert "language" not in providers.get("supported_types", {}).get("openai-compatible", [])
        assert "embedding" not in providers.get("supported_types", {}).get("openai-compatible", [])
        assert "speech_to_text" not in providers.get("supported_types", {}).get("openai-compatible", [])
        assert "text_to_speech" not in providers.get("supported_types", {}).get("openai-compatible", [])

    @patch("api.routers.models.os.environ.get")
    @patch("api.routers.models.AIFactory.get_available_providers")
    def test_mixed_config_generic_and_mode_specific(
        self, mock_esperanto, mock_env, client
    ):
        """Test mixed config: generic + mode-specific (generic should enable all)."""

        # Mock environment: both generic and mode-specific vars are set
        def env_side_effect(key):
            if key == "OPENAI_COMPATIBLE_BASE_URL":
                return "http://localhost:1234/v1"
            if key == "OPENAI_COMPATIBLE_BASE_URL_LLM":
                return "http://localhost:5678/v1"
            return None

        mock_env.side_effect = env_side_effect

        # Mock Esperanto response
        mock_esperanto.return_value = {
            "language": ["openai-compatible"],
            "embedding": ["openai-compatible"],
            "speech_to_text": ["openai-compatible"],
            "text_to_speech": ["openai-compatible"],
        }

        response = client.get("/api/models/providers", headers={"Authorization": "Bearer bypass"})
        assert response.status_code == 200

        providers = response.json()
        # Generic var enables all
        assert "language" in providers.get("supported_types", {}).get("openai-compatible", [])
        assert "embedding" in providers.get("supported_types", {}).get("openai-compatible", [])
        assert "speech_to_text" in providers.get("supported_types", {}).get("openai-compatible", [])
        assert "text_to_speech" in providers.get("supported_types", {}).get("openai-compatible", [])

    @patch("api.routers.models.os.environ.get")
    @patch("api.routers.models.AIFactory.get_available_providers")
    def test_individual_mode_llm_only(self, mock_esperanto, mock_env, client):
        """Test individual mode-specific var (LLM only)."""

        # Mock environment: only LLM specific var is set
        def env_side_effect(key):
            if key == "OPENAI_COMPATIBLE_BASE_URL_LLM":
                return "http://localhost:1234/v1"
            return None

        mock_env.side_effect = env_side_effect

        # Mock Esperanto response
        mock_esperanto.return_value = {
            "language": ["openai-compatible"],
            "embedding": ["openai-compatible"],
            "speech_to_text": ["openai-compatible"],
            "text_to_speech": ["openai-compatible"],
        }

        response = client.get("/api/models/providers", headers={"Authorization": "Bearer bypass"})
        assert response.status_code == 200
        providers = response.json()

        assert "language" in providers.get("supported_types", {}).get("openai-compatible", [])
        assert "embedding" not in providers.get("supported_types", {}).get("openai-compatible", [])
        assert "speech_to_text" not in providers.get("supported_types", {}).get("openai-compatible", [])
        assert "text_to_speech" not in providers.get("supported_types", {}).get("openai-compatible", [])

    @patch("api.routers.models.os.environ.get")
    @patch("api.routers.models.AIFactory.get_available_providers")
    def test_individual_mode_embedding_only(self, mock_esperanto, mock_env, client):
        """Test individual mode-specific var (EMBEDDING only)."""

        # Mock environment: only EMBEDDING specific var is set
        def env_side_effect(key):
            if key == "OPENAI_COMPATIBLE_BASE_URL_EMBEDDING":
                return "http://localhost:8080/v1"
            return None

        mock_env.side_effect = env_side_effect

        # Mock Esperanto response
        mock_esperanto.return_value = {
            "language": ["openai-compatible"],
            "embedding": ["openai-compatible"],
            "speech_to_text": ["openai-compatible"],
            "text_to_speech": ["openai-compatible"],
        }

        response = client.get("/api/models/providers", headers={"Authorization": "Bearer bypass"})
        assert response.status_code == 200
        providers = response.json()

        assert "language" not in providers.get("supported_types", {}).get("openai-compatible", [])
        assert "embedding" in providers.get("supported_types", {}).get("openai-compatible", [])
        assert "speech_to_text" not in providers.get("supported_types", {}).get("openai-compatible", [])
        assert "text_to_speech" not in providers.get("supported_types", {}).get("openai-compatible", [])

    @patch("api.routers.models.os.environ.get")
    @patch("api.routers.models.AIFactory.get_available_providers")
    def test_individual_mode_stt_only(self, mock_esperanto, mock_env, client):
        """Test individual mode-specific var (STT only)."""

        # Mock environment: only STT specific var is set
        def env_side_effect(key):
            if key == "OPENAI_COMPATIBLE_BASE_URL_STT":
                return "http://localhost:9000/v1"
            return None

        mock_env.side_effect = env_side_effect

        # Mock Esperanto response
        mock_esperanto.return_value = {
            "language": ["openai-compatible"],
            "embedding": ["openai-compatible"],
            "speech_to_text": ["openai-compatible"],
            "text_to_speech": ["openai-compatible"],
        }

        response = client.get("/api/models/providers", headers={"Authorization": "Bearer bypass"})
        assert response.status_code == 200
        providers = response.json()

        assert "language" not in providers.get("supported_types", {}).get("openai-compatible", [])
        assert "embedding" not in providers.get("supported_types", {}).get("openai-compatible", [])
        assert "speech_to_text" in providers.get("supported_types", {}).get("openai-compatible", [])
        assert "text_to_speech" not in providers.get("supported_types", {}).get("openai-compatible", [])

    @patch("api.routers.models.os.environ.get")
    @patch("api.routers.models.AIFactory.get_available_providers")
    def test_individual_mode_tts_only(self, mock_esperanto, mock_env, client):
        """Test individual mode-specific var (TTS only)."""

        # Mock environment: only TTS specific var is set
        def env_side_effect(key):
            if key == "OPENAI_COMPATIBLE_BASE_URL_TTS":
                return "http://localhost:9000/v1"
            return None

        mock_env.side_effect = env_side_effect

        # Mock Esperanto response
        mock_esperanto.return_value = {
            "language": ["openai-compatible"],
            "embedding": ["openai-compatible"],
            "speech_to_text": ["openai-compatible"],
            "text_to_speech": ["openai-compatible"],
        }

        response = client.get("/api/models/providers", headers={"Authorization": "Bearer bypass"})
        assert response.status_code == 200
        providers = response.json()

        assert "language" not in providers.get("supported_types", {}).get("openai-compatible", [])
        assert "embedding" not in providers.get("supported_types", {}).get("openai-compatible", [])
        assert "speech_to_text" not in providers.get("supported_types", {}).get("openai-compatible", [])
        assert "text_to_speech" in providers.get("supported_types", {}).get("openai-compatible", [])


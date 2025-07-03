from unittest import TestCase
from unittest.mock import patch, Mock, MagicMock
from user.utils import download_and_assign_image
from django.core.files.base import ContentFile


class DownloadImageTest(TestCase):
    @patch("user.utils.requests.get")
    def test_download_and_assign_image_success(self, mock_get):
        # Arrange
        mock_instance = MagicMock()
        mock_image_field = MagicMock()
        mock_instance.image = mock_image_field

        image_url = "http://example.com/test.jpg"
        mock_response = Mock()
        mock_response.ok = True
        mock_response.content = b"binary image content"
        mock_get.return_value = mock_response

        # Act
        download_and_assign_image(mock_instance, image_url)

        # Assert
        mock_image_field.save.assert_called_once()
        args, kwargs = mock_image_field.save.call_args
        assert args[0] == "test.jpg"  # file name
        assert isinstance(args[1], ContentFile)
        assert args[1].read() == b"binary image content"

    @patch("user.utils.requests.get")
    def test_download_and_assign_image_fail(self, mock_get):
        # Arrange
        mock_instance = MagicMock()
        mock_image_field = MagicMock()
        mock_instance.image = mock_image_field

        image_url = "http://example.com/test.jpg"
        mock_response = Mock()
        mock_response.ok = False
        mock_response.content = b"binary image content"
        mock_get.return_value = mock_response

        # Act
        download_and_assign_image(mock_instance, image_url)

        # Assert
        mock_image_field.save.assert_not_called()

    def test_download_and_assign_image_with_empty_url(self):
        mock_instance = MagicMock()
        download_and_assign_image(mock_instance, "")
        mock_instance.image.save.assert_not_called()

    @patch("user.utils.requests.get")
    def test_download_and_assign_image_request_fails(self, mock_get):
        mock_instance = MagicMock()
        mock_instance.image = MagicMock()
        mock_get.side_effect = Exception("Connection error")
        download_and_assign_image(mock_instance, "http://badurl.com/image.jpg")
        mock_instance.image.save.assert_not_called()

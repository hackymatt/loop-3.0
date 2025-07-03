from django.utils import translation


class LanguageMiddleware:
    """
    Middleware to set the language for each request.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Get the language code from the 'Accept-Language' header or use the default
        language = request.LANGUAGE_CODE  # LocaleMiddleware usually sets this

        # Activate the chosen language for the request
        translation.activate(language)

        # Continue processing the request
        response = self.get_response(request)

        return response

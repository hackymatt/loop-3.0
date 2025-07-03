def get_website_url(request):
    # This will use request.get_host() to dynamically get the URL based on the current request
    domain = (
        request.get_host()
    )  # This will get the domain name (e.g., localhost or loop.edu.pl)
    protocol = (
        "https" if request.is_secure() else "http"
    )  # Check if the request is secure (HTTPS)
    return f"{protocol}://{domain}"

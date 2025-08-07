import stripe
import json
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from global_config import CONFIG

stripe.api_key = CONFIG["stripe_secret_key"]


@csrf_exempt
def create_payment_intent(request):
    try:
        data = json.loads(request.body)

        amount = data.get("amount")
        currency = data.get("currency")

        payment_intent = stripe.PaymentIntent.create(
            amount=amount, currency=currency, payment_method_types=["card", "blik"]
        )

        return JsonResponse({"client_secret": payment_intent.client_secret})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

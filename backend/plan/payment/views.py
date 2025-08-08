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
            amount=amount,
            currency=currency,
        )

        return JsonResponse({"client_secret": payment_intent.client_secret})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=sig_header,
            secret=CONFIG["stripe_webhook_secret"],
        )
    except ValueError as e:
        # Invalid payload
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return HttpResponse(status=400)

    # 📌 Obsługa różnych typów eventów Stripe
    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        # np. aktywuj subskrypcję użytkownika
        print("💰 PaymentIntent was successful!", payment_intent["id"])

    elif event["type"] == "invoice.payment_failed":
        invoice = event["data"]["object"]
        # np. wyślij maila do użytkownika że płatność nie powiodła się
        print("❌ Payment for invoice failed", invoice["id"])

    elif event["type"] == "customer.subscription.created":
        subscription = event["data"]["object"]
        print("📦 Subscription created", subscription["id"])

    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        print("🧹 Subscription canceled", subscription["id"])

    # Możesz dodać więcej eventów jeśli potrzebujesz

    return HttpResponse(status=200)

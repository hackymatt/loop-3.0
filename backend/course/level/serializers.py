from rest_framework import serializers
from .models import Level, LevelTranslation


class LevelSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True)  # Used for input
    language = serializers.CharField(write_only=True)  # Used for input
    translated_name = serializers.SerializerMethodField()  # Used for output

    class Meta:
        model = Level
        fields = ["slug", "name", "language", "translated_name"]

    def get_translated_name(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.get_translation(lang).name

    def create(self, validated_data):
        slug = validated_data["slug"]
        language = validated_data["language"]
        name = validated_data["name"]

        # Get or create Level
        level, _ = Level.objects.get_or_create(slug=slug)

        # Create or update translation
        translation, created = LevelTranslation.objects.update_or_create(
            level=level, language=language, defaults={"name": name}
        )

        return level

    def update(self, instance, validated_data):
        language = validated_data["language"]
        name = validated_data["name"]

        # Update or create translation
        translation, created = LevelTranslation.objects.update_or_create(
            level=instance, language=language, defaults={"name": name}
        )

        return instance

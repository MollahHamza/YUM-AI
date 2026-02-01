from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile, UserSettings


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'restaurant_name', 'phone', 'role', 'avatar_initials',
            'theme', 'currency', 'language', 'notifications_enabled',
            'low_stock_threshold', 'ai_model', 'gemini_api_key',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = [
            'restaurant_address', 'restaurant_phone', 'restaurant_email',
            'business_hours', 'tax_rate', 'default_tip_percentage',
            'receipt_footer', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    app_settings = UserSettingsSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile', 'app_settings']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    restaurant_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name', 'restaurant_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "A user with this email already exists."})

        return attrs

    def create(self, validated_data):
        restaurant_name = validated_data.pop('restaurant_name', '')
        validated_data.pop('password2')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )

        # Update profile with restaurant name
        if restaurant_name and hasattr(user, 'profile'):
            user.profile.restaurant_name = restaurant_name
            user.profile.save()

        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])


class UpdateProfileSerializer(serializers.Serializer):
    # User fields
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False)

    # Profile fields
    restaurant_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    theme = serializers.CharField(required=False)
    currency = serializers.CharField(required=False)
    language = serializers.CharField(required=False)
    notifications_enabled = serializers.BooleanField(required=False)
    low_stock_threshold = serializers.IntegerField(required=False)
    ai_model = serializers.CharField(required=False)
    gemini_api_key = serializers.CharField(required=False, allow_blank=True)


class UpdateSettingsSerializer(serializers.Serializer):
    restaurant_address = serializers.CharField(required=False, allow_blank=True)
    restaurant_phone = serializers.CharField(required=False, allow_blank=True)
    restaurant_email = serializers.EmailField(required=False, allow_blank=True)
    business_hours = serializers.CharField(required=False, allow_blank=True)
    tax_rate = serializers.DecimalField(required=False, max_digits=5, decimal_places=2)
    default_tip_percentage = serializers.DecimalField(required=False, max_digits=5, decimal_places=2)
    receipt_footer = serializers.CharField(required=False, allow_blank=True)

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    ChangePasswordSerializer, UpdateProfileSerializer, UpdateSettingsSerializer,
    UserProfileSerializer, UserSettingsSerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user."""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'message': 'User registered successfully',
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login and get authentication token."""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        # Try to authenticate with username
        user = authenticate(username=username, password=password)

        # If that fails, try email
        if user is None:
            try:
                user_by_email = User.objects.get(email=username)
                user = authenticate(username=user_by_email.username, password=password)
            except User.DoesNotExist:
                pass

        if user is not None:
            if user.is_active:
                token, _ = Token.objects.get_or_create(user=user)
                return Response({
                    'message': 'Login successful',
                    'token': token.key,
                    'user': UserSerializer(user).data
                })
            return Response({'error': 'Account is disabled'}, status=status.HTTP_403_FORBIDDEN)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout and invalidate token."""
    try:
        request.user.auth_token.delete()
    except Exception:
        pass
    return Response({'message': 'Logout successful'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """Get current user profile."""
    return Response(UserSerializer(request.user).data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update user profile."""
    serializer = UpdateProfileSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        data = serializer.validated_data

        # Update User fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data:
            # Check if email is already taken
            if User.objects.filter(email=data['email']).exclude(pk=user.pk).exists():
                return Response({'error': 'Email already in use'}, status=status.HTTP_400_BAD_REQUEST)
            user.email = data['email']
        user.save()

        # Update Profile fields
        profile = user.profile
        profile_fields = [
            'restaurant_name', 'phone', 'theme', 'currency', 'language',
            'notifications_enabled', 'low_stock_threshold', 'ai_model', 'gemini_api_key'
        ]
        for field in profile_fields:
            if field in data:
                setattr(profile, field, data[field])

        # Update avatar initials if name changed
        if 'first_name' in data or 'last_name' in data:
            if user.first_name and user.last_name:
                profile.avatar_initials = f"{user.first_name[0]}{user.last_name[0]}".upper()
            else:
                profile.avatar_initials = user.username[:2].upper()

        profile.save()

        return Response({
            'message': 'Profile updated successfully',
            'user': UserSerializer(user).data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_settings(request):
    """Update application settings."""
    serializer = UpdateSettingsSerializer(data=request.data)
    if serializer.is_valid():
        settings = request.user.app_settings
        data = serializer.validated_data

        for field in data:
            setattr(settings, field, data[field])
        settings.save()

        return Response({
            'message': 'Settings updated successfully',
            'settings': UserSettingsSerializer(settings).data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password."""
    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save()

        # Regenerate token
        Token.objects.filter(user=user).delete()
        token = Token.objects.create(user=user)

        return Response({
            'message': 'Password changed successfully',
            'token': token.key
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def check_username(request):
    """Check if username is available."""
    username = request.GET.get('username', '')
    if not username:
        return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)

    exists = User.objects.filter(username=username).exists()
    return Response({'available': not exists})


@api_view(['GET'])
@permission_classes([AllowAny])
def check_email(request):
    """Check if email is available."""
    email = request.GET.get('email', '')
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

    exists = User.objects.filter(email=email).exists()
    return Response({'available': not exists})

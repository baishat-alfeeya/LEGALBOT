"""
LEGALBOT API Serializers
"""
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile, ChatHistory, SavedLawyer, Notification, Booking


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['provider', 'avatar', 'preferred_language', 'theme']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'profile']
        read_only_fields = ['id', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['name', 'email', 'password']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def create(self, validated_data):
        name = validated_data.pop('name')
        email = validated_data['email']
        # Use email as username
        user = User.objects.create_user(
            username=email,
            email=email,
            password=validated_data['password'],
            first_name=name.split(' ')[0],
            last_name=' '.join(name.split(' ')[1:]) if len(name.split(' ')) > 1 else '',
        )
        UserProfile.objects.create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class ChatHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatHistory
        fields = ['id', 'query', 'response', 'category', 'risk', 'timestamp']
        read_only_fields = ['id', 'timestamp']


class SavedLawyerSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedLawyer
        fields = ['id', 'lawyer_id', 'lawyer_name', 'specialization', 'city', 'fee_min', 'fee_max', 'rating', 'saved_at']
        read_only_fields = ['id', 'saved_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'type', 'title', 'message', 'read', 'link', 'timestamp']
        read_only_fields = ['id', 'timestamp']


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['id', 'booking_id', 'lawyer_name', 'specialization', 'city', 'address', 'date', 'time', 'mode', 'meeting_link', 'created_at']
        read_only_fields = ['id', 'created_at']


class UpdateProfileSerializer(serializers.Serializer):
    name = serializers.CharField(required=False)
    preferred_language = serializers.CharField(required=False, max_length=5)
    theme = serializers.CharField(required=False, max_length=10)

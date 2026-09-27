"""
LEGALBOT API Views
"""
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile, ChatHistory, SavedLawyer, Notification, Booking
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    ChatHistorySerializer, SavedLawyerSerializer,
    NotificationSerializer, BookingSerializer, UpdateProfileSerializer
)


def get_tokens_for_user(user):
    """Generate JWT tokens for a user"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# ── Auth Views ─────────────────────────────────────────────────────────────────

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            # Create welcome notification
            Notification.objects.create(
                user=user,
                type='system',
                title='Welcome to LEGALBOT!',
                message=f'Hi {user.first_name}! Your account is ready. Start by asking a legal question or finding a lawyer.',
                link='/chat',
            )
            return Response({
                'user': UserSerializer(user).data,
                'tokens': tokens,
                'message': 'Account created successfully.',
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '')
        password = request.data.get('password', '')

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate using email as username
        user = authenticate(request, username=email, password=password)
        if not user:
            # Try finding user by email
            try:
                u = User.objects.get(email=email)
                user = authenticate(request, username=u.username, password=password)
            except User.DoesNotExist:
                pass

        if not user:
            return Response({'error': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        tokens = get_tokens_for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': tokens,
            'message': 'Login successful.',
        })


class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        return Response({'message': 'Logged out successfully.'})


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UpdateProfileSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            user = request.user
            if 'name' in data:
                parts = data['name'].split(' ', 1)
                user.first_name = parts[0]
                user.last_name = parts[1] if len(parts) > 1 else ''
                user.save()
            profile, _ = UserProfile.objects.get_or_create(user=user)
            if 'preferred_language' in data:
                profile.preferred_language = data['preferred_language']
            if 'theme' in data:
                profile.theme = data['theme']
            profile.save()
            return Response(UserSerializer(user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── Chat History Views ─────────────────────────────────────────────────────────

class ChatHistoryListView(generics.ListCreateAPIView):
    serializer_class = ChatHistorySerializer

    def get_queryset(self):
        qs = ChatHistory.objects.filter(user=self.request.user)
        search = self.request.query_params.get('search', '')
        category = self.request.query_params.get('category', '')
        if search:
            qs = qs.filter(query__icontains=search)
        if category:
            qs = qs.filter(category__icontains=category)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ChatHistoryDetailView(generics.DestroyAPIView):
    serializer_class = ChatHistorySerializer

    def get_queryset(self):
        return ChatHistory.objects.filter(user=self.request.user)


@api_view(['DELETE'])
def clear_chat_history(request):
    ChatHistory.objects.filter(user=request.user).delete()
    return Response({'message': 'Chat history cleared.'})


# ── Saved Lawyers Views ────────────────────────────────────────────────────────

class SavedLawyerListView(generics.ListCreateAPIView):
    serializer_class = SavedLawyerSerializer

    def get_queryset(self):
        return SavedLawyer.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        # Prevent duplicates
        lawyer_id = request.data.get('lawyer_id')
        if SavedLawyer.objects.filter(user=request.user, lawyer_id=lawyer_id).exists():
            return Response({'message': 'Lawyer already saved.'}, status=status.HTTP_200_OK)
        return super().create(request, *args, **kwargs)


class SavedLawyerDetailView(generics.DestroyAPIView):
    serializer_class = SavedLawyerSerializer

    def get_queryset(self):
        return SavedLawyer.objects.filter(user=self.request.user)


@api_view(['DELETE'])
def unsave_lawyer_by_id(request, lawyer_id):
    SavedLawyer.objects.filter(user=request.user, lawyer_id=lawyer_id).delete()
    return Response({'message': 'Lawyer removed from saved list.'})


# ── Notification Views ─────────────────────────────────────────────────────────

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


@api_view(['PATCH'])
def mark_notification_read(request, pk):
    try:
        notif = Notification.objects.get(pk=pk, user=request.user)
        notif.read = True
        notif.save()
        return Response(NotificationSerializer(notif).data)
    except Notification.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PATCH'])
def mark_all_notifications_read(request):
    Notification.objects.filter(user=request.user, read=False).update(read=True)
    return Response({'message': 'All notifications marked as read.'})


@api_view(['DELETE'])
def clear_notifications(request):
    Notification.objects.filter(user=request.user).delete()
    return Response({'message': 'Notifications cleared.'})


# ── Booking Views ──────────────────────────────────────────────────────────────

class BookingListView(generics.ListCreateAPIView):
    serializer_class = BookingSerializer

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        booking = serializer.save(user=self.request.user)
        # Auto-create booking notification
        Notification.objects.create(
            user=self.request.user,
            type='booking',
            title='Demo Booking Confirmed',
            message=f'Your demo consultation with {booking.lawyer_name} is scheduled for {booking.date} at {booking.time}.',
            link='/bookings',
        )


class BookingDetailView(generics.DestroyAPIView):
    serializer_class = BookingSerializer

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)


# ── Dashboard Summary ──────────────────────────────────────────────────────────

@api_view(['GET'])
def dashboard_summary(request):
    user = request.user
    return Response({
        'chat_count': ChatHistory.objects.filter(user=user).count(),
        'saved_lawyers_count': SavedLawyer.objects.filter(user=user).count(),
        'bookings_count': Booking.objects.filter(user=user).count(),
        'unread_notifications': Notification.objects.filter(user=user, read=False).count(),
        'recent_chats': ChatHistorySerializer(
            ChatHistory.objects.filter(user=user)[:5], many=True
        ).data,
        'recent_bookings': BookingSerializer(
            Booking.objects.filter(user=user)[:3], many=True
        ).data,
        'recent_notifications': NotificationSerializer(
            Notification.objects.filter(user=user)[:5], many=True
        ).data,
    })

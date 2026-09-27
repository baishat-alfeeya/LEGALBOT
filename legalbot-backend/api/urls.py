"""LEGALBOT API URL Patterns"""
from django.urls import path
from . import views

urlpatterns = [
    # ── Auth ──────────────────────────────────────────────────────────────────
    path('auth/register/',  views.RegisterView.as_view(),  name='register'),
    path('auth/login/',     views.LoginView.as_view(),     name='login'),
    path('auth/logout/',    views.LogoutView.as_view(),    name='logout'),
    path('auth/me/',        views.MeView.as_view(),        name='me'),

    # ── Chat History ──────────────────────────────────────────────────────────
    path('chat-history/',           views.ChatHistoryListView.as_view(),   name='chat-history-list'),
    path('chat-history/<int:pk>/',  views.ChatHistoryDetailView.as_view(), name='chat-history-detail'),
    path('chat-history/clear/',     views.clear_chat_history,              name='chat-history-clear'),

    # ── Saved Lawyers ─────────────────────────────────────────────────────────
    path('saved-lawyers/',                          views.SavedLawyerListView.as_view(),   name='saved-lawyers-list'),
    path('saved-lawyers/<int:pk>/',                 views.SavedLawyerDetailView.as_view(), name='saved-lawyers-detail'),
    path('saved-lawyers/unsave/<int:lawyer_id>/',   views.unsave_lawyer_by_id,             name='unsave-lawyer'),

    # ── Notifications ─────────────────────────────────────────────────────────
    path('notifications/',                      views.NotificationListView.as_view(),  name='notifications-list'),
    path('notifications/<int:pk>/read/',        views.mark_notification_read,          name='notification-read'),
    path('notifications/mark-all-read/',        views.mark_all_notifications_read,     name='notifications-mark-all'),
    path('notifications/clear/',                views.clear_notifications,             name='notifications-clear'),

    # ── Bookings ──────────────────────────────────────────────────────────────
    path('bookings/',           views.BookingListView.as_view(),   name='bookings-list'),
    path('bookings/<int:pk>/',  views.BookingDetailView.as_view(), name='bookings-detail'),

    # ── Dashboard ─────────────────────────────────────────────────────────────
    path('dashboard/', views.dashboard_summary, name='dashboard'),
]

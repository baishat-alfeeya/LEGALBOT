"""
LEGALBOT API Models
"""
from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """Extended user profile"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    provider = models.CharField(max_length=20, default='email')  # email | google
    avatar = models.URLField(blank=True, null=True)
    preferred_language = models.CharField(max_length=5, default='en')
    theme = models.CharField(max_length=10, default='dark')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} Profile"


class ChatHistory(models.Model):
    """User chat history"""
    RISK_CHOICES = [('low', 'Low'), ('medium', 'Medium'), ('high', 'High')]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_history')
    query = models.TextField()
    response = models.TextField()
    category = models.CharField(max_length=100, default='General')
    risk = models.CharField(max_length=10, choices=RISK_CHOICES, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username}: {self.query[:50]}"


class SavedLawyer(models.Model):
    """Lawyers saved by users"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_lawyers')
    lawyer_id = models.IntegerField()
    lawyer_name = models.CharField(max_length=200)
    specialization = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    fee_min = models.IntegerField(default=0)
    fee_max = models.IntegerField(default=0)
    rating = models.FloatField(default=0)
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-saved_at']
        unique_together = ['user', 'lawyer_id']

    def __str__(self):
        return f"{self.user.username} saved {self.lawyer_name}"


class Notification(models.Model):
    """User notifications"""
    TYPE_CHOICES = [
        ('booking', 'Booking'),
        ('reminder', 'Reminder'),
        ('legal', 'Legal Update'),
        ('system', 'System'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='system')
    title = models.CharField(max_length=200)
    message = models.TextField()
    read = models.BooleanField(default=False)
    link = models.CharField(max_length=200, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username}: {self.title}"


class Booking(models.Model):
    """Demo lawyer bookings"""
    MODE_CHOICES = [('Online', 'Online'), ('Offline', 'Offline')]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    booking_id = models.CharField(max_length=50, unique=True)
    lawyer_name = models.CharField(max_length=200)
    specialization = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    address = models.TextField()
    date = models.CharField(max_length=100)
    time = models.CharField(max_length=50)
    mode = models.CharField(max_length=10, choices=MODE_CHOICES)
    meeting_link = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username}: {self.lawyer_name} on {self.date}"

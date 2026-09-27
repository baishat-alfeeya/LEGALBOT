# LEGALBOT Django Backend

REST API backend for LEGALBOT using Django + DRF + JWT.

## Setup

```bash
cd legalbot-backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
cp .env.example .env

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Server runs at: http://localhost:8000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register/ | Create account |
| POST | /api/auth/login/ | Login, get JWT tokens |
| POST | /api/auth/logout/ | Logout |
| GET/PATCH | /api/auth/me/ | Get/update profile |
| GET/POST | /api/chat-history/ | List/add chat history |
| DELETE | /api/chat-history/{id}/ | Delete one item |
| DELETE | /api/chat-history/clear/ | Clear all history |
| GET/POST | /api/saved-lawyers/ | List/save lawyers |
| DELETE | /api/saved-lawyers/unsave/{lawyer_id}/ | Unsave lawyer |
| GET | /api/notifications/ | List notifications |
| PATCH | /api/notifications/{id}/read/ | Mark one read |
| PATCH | /api/notifications/mark-all-read/ | Mark all read |
| DELETE | /api/notifications/clear/ | Clear all |
| GET/POST | /api/bookings/ | List/create bookings |
| GET | /api/dashboard/ | Dashboard summary |
| POST | /api/token/refresh/ | Refresh JWT token |

## Authentication

All endpoints (except register/login) require:
```
Authorization: Bearer <access_token>
```

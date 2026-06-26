# Internal Booking System

## Purpose

The internal booking system lets visitors request a real AI Readiness Review time without pretending live availability exists.

It is used when:

- The visitor needs human fit review first.
- Payment should happen after review.
- Google Calendar appointment slots are not connected yet.
- A custom request needs manual confirmation.

## Public page

- Page: `booking.html`
- Pretty route after deploy: `/ai-readiness-pass/booking`
- Form name: `ai-readiness-booking`

## What the form collects

- Name
- Email
- Phone
- Service/path
- Meeting length
- Meeting preference
- Timezone
- Preferred time 1
- Preferred time 2
- Preferred time 3
- Urgency
- Budget range
- Notes/message
- Lead source and UTM fields

## Lead tracker behavior

The booking form uses the same first-party lead tracker as the main lead form.

When private host settings are configured, it creates a GitHub Issue with:

- `[Booking]` title prefix
- Contact details
- Selected service/path
- Booking details
- Source fields
- Follow-up checklist

If the tracker is not configured, the email fallback route still submits the request.

## Google Calendar integration

For live scheduling, create a Google Calendar appointment schedule and add the public booking URL in:

`assets/site-config.js`

```js
bookingUrl: 'https://calendar.google.com/calendar/appointments/...'
```

When `bookingUrl` is present, booking buttons open the Google Calendar scheduler.

## Truth standard

- Do not show fake available times.
- Do not say a meeting is confirmed until a real calendar invite or scheduler confirmation exists.
- Do not accept payment-only bookings if human fit review is required first.
- Do not promise Google Meet until the calendar event or scheduler confirms it.

## Confirmation workflow

1. New booking request arrives.
2. Review service/path, message, urgency, and preferred times.
3. Check calendar availability.
4. Send official Google Calendar invite or booking link.
5. Send verified payment link if the offer requires payment.
6. Update the lead issue or tracker status.

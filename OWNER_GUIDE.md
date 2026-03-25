# Owner Guide

This guide is for the owner of Mosay Homestay. It explains, in simple terms, how the website works and what needs to be managed regularly.

## 1. Website Purpose

The website is used to:

- show information about Mosay Homestay
- show the gallery and location
- let guests check available dates
- let guests send a booking inquiry
- continue the conversation on WhatsApp

The website does not automatically confirm a booking by itself. Every booking still needs owner review.

## 2. How The Booking Flow Works

1. A guest visits the website.
2. The guest chooses check-in and check-out dates.
3. The guest fills in basic details.
4. The system saves the request as an `inquiry`.
5. The guest is then sent to WhatsApp with a prepared message.
6. The owner checks the request in the admin panel.
7. The owner decides whether to confirm, block, or cancel it.

## 3. Admin Panel

Admin URL:

```text
https://mosayhomestay.com/#/admin
```

Use your admin email and password to log in.

This admin panel is the main place for the owner to manage bookings.

## 4. What The Owner Needs To Do

### Every day or whenever a new request comes in

1. Open the admin panel.
2. Check for new `inquiry` requests.
3. Review the guest name, phone number, dates, and notes.
4. Confirm the booking if the dates are available.
5. Cancel the booking if the dates are not available.

### If you want to manually close dates

Use the admin panel to create or edit a booking and mark the status as `blocked`.

This is useful for:

- owner use
- maintenance
- offline booking
- keeping certain dates unavailable

## 5. Booking Status Meaning

- `inquiry`: guest asked for the dates, but not yet approved
- `confirmed`: booking is accepted and the dates are locked
- `blocked`: dates are closed and cannot be chosen by guests
- `cancelled`: booking is not active and the dates become available again

## 6. What The Owner Can Manage Without A Developer

The owner can manage these directly from the admin panel:

- review new inquiries
- confirm bookings
- cancel bookings
- block dates
- add manual bookings
- update booking details

## 7. What Still Needs A Developer

The owner should ask a developer if they want to change:

- website design
- wording or text on the website
- phone number or WhatsApp link
- gallery photos
- address or map link
- domain or DNS settings
- GitHub or deployment settings
- Supabase setup

## 8. Important Notes

- A guest sending a request does not mean the booking is final.
- Only `confirmed` and `blocked` dates will close the calendar.
- If the owner forgets to update the booking status, the calendar may show the wrong availability.
- Keep admin login details private.

## 9. If Something Goes Wrong

Please contact the developer if:

- the website does not load
- the admin panel cannot be opened
- login is not working
- dates are not updating correctly
- WhatsApp button is not working
- images or content need to be changed

## 10. Simple Summary

The website helps guests check dates and send booking inquiries.

The owner's main job is simple:

1. check new inquiries
2. confirm or cancel them
3. block dates when needed

If the owner keeps the admin panel updated, the website calendar will stay accurate.

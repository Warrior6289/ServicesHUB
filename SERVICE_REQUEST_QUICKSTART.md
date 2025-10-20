# Service Request System - Quick Start Guide

## 🚀 Getting Started

### 1. Start the Development Server
```bash
cd services-hub
npm run dev
```

### 2. Key Routes to Test

#### For Buyers:
- **Browse Services:** http://localhost:5173/services
  - Hover over any category card to see "Request Service" button
  - Click to create a new service request

- **Create Request:** http://localhost:5173/request-service
  - Choose Instant or Scheduled
  - Select category, enter description, set price
  - Pick location on map or use "Use Current Location"
  - For Instant: Set broadcast radius (5-50km)
  - For Scheduled: Pick date and time slot
  - Submit to create request

- **User Dashboard:** http://localhost:5173/user-dashboard
  - Tab 1: "Purchased Services" (existing)
  - Tab 2: "My Requests" (NEW!)
    - Filter by: All, Active, Completed, Cancelled
    - Boost price on pending instant requests
    - Cancel requests
    - Click "View Details" to see full request

- **Request Details:** http://localhost:5173/requests/req_1
  - Full request information
  - Status timeline with progress
  - Price history
  - Boost price or cancel actions

#### For Sellers:
- **Seller Dashboard:** http://localhost:5173/seller-dashboard
  - **NEW!** Incoming Instant Requests section at top
  - Real-time polling (checks every 20 seconds)
  - New request notifications with badge
  - Sort by: Newest First, Highest Price, Nearest
  - Distance calculation from your location
  - Countdown timers on each request
  - Accept requests with one click
  - Show/Hide incoming requests toggle

## 🎯 Testing the Flow

### Complete Buyer-to-Seller Flow:

1. **Go to Services Page**
   - Navigate to `/services`
   - Hover over "Plumbing" category
   - Click "Request Service" button

2. **Create Instant Request**
   - Category pre-selected as "Plumber"
   - Choose "Instant Service"
   - Enter description: "Emergency leak in kitchen sink"
   - Set price: $100
   - Click "Use Current Location" or select on map
   - Set broadcast radius: 25km
   - Click "Request Instant Service"

3. **View in User Dashboard**
   - Go to `/user-dashboard`
   - Click "My Requests" tab
   - See your new request with "Pending" status
   - Note the countdown timer (expires in 1 hour)

4. **Seller Sees Request**
   - Open `/seller-dashboard` in another browser tab/window
   - See the request appear in "Incoming Instant Requests"
   - Note the "New!" badge if it just appeared
   - See distance calculation
   - Watch the countdown timer

5. **Accept Request (Seller)**
   - Click "Accept Request" button
   - Request moves to accepted state

6. **Check Details (Buyer)**
   - Go to request details page
   - See status updated to "Accepted"
   - View timeline progress
   - See provider information

### Test Price Boosting:

1. Create an instant request
2. In "My Requests" tab, click "Boost Price"
3. Enter new price (must be higher than current)
4. Try quick increase buttons (+10%, +25%, +50%)
5. Confirm boost
6. Status changes to "Price Boosted" with orange badge
7. Price history shows both amounts
8. Sellers see the boosted price with pulse animation

## 📍 Location Features

### Using Current Location:
1. Click "Use Current Location" button
2. Browser will ask for permission
3. Your location will be plotted on map
4. Address auto-filled with coordinates

### Manual Map Selection:
1. Click "Select Location on Map"
2. Map expands
3. Click anywhere on map to select location
4. Marker appears at selected point
5. Update address field as needed

### Manual Address Entry:
1. Type address in input field
2. Optionally, show map to verify
3. Click on map to adjust if needed

## 🔔 Seller Notifications

### Browser Notifications:
- First time visiting seller dashboard, browser asks for notification permission
- Accept to receive desktop notifications for new requests
- New requests trigger both:
  - On-screen badge with count
  - Desktop notification (if granted)

### Polling Behavior:
- Checks for new requests every 20 seconds
- Also checks when window regains focus
- Loading indicator shows during fetch
- New requests slide in with animation

## 🎨 Visual Indicators

### Status Badge Colors:
- 🟡 **Pending** - Yellow (waiting for acceptance)
- 🟠 **Price Boosted** - Orange with pulse (buyer increased price)
- 🔵 **Accepted** - Blue (seller accepted)
- 🟣 **In Progress** - Purple (service being performed)
- 🟢 **Completed** - Green (service done)
- 🔴 **Cancelled** - Red (cancelled by buyer)
- ⚫ **Expired** - Gray (instant request expired)
- 🔷 **Converted** - Cyan (auto-converted to scheduled)

### Countdown Timers:
- **Green** (15+ minutes remaining)
- **Yellow** (5-15 minutes remaining)
- **Red** (<5 minutes remaining)
- Updates every second

## 📊 Mock Data Available

The system includes realistic mock data:
- 10 sample service requests
- Various categories: Plumber, Electrician, Welder, etc.
- Different statuses to test each state
- Price boost examples
- Multiple locations in New York area

Access mock data in code:
```typescript
import { mockServiceRequests, getMockInstantRequests } from './mocks/serviceRequests';
```

## 🔧 Configuration

### Polling Interval (Seller Dashboard):
```typescript
// In SellerDashboardPage.tsx
intervalMs: 20000, // Change to adjust polling frequency (ms)
```

### Broadcast Radius:
```typescript
// In ServiceRequestForm.tsx
broadcastRadius: 10, // Default radius in km
// Slider: 5-50km range
```

### Request Expiration:
```typescript
// Currently hardcoded to 1 hour for instant requests
expiresAt: new Date(Date.now() + 60 * 60 * 1000)
```

## 🐛 Troubleshooting

### Map Not Showing:
- Check browser console for Leaflet errors
- Ensure `leaflet.css` is imported in `main.tsx`
- Check that marker icons are loading correctly

### Geolocation Not Working:
- Ensure HTTPS or localhost (geolocation requires secure context)
- Check browser permissions
- Try different browser if issues persist

### Polling Not Working:
- Check browser console for errors
- Verify `useMockData: true` in polling hook
- Check that component is mounted (seller dashboard visible)

### No Incoming Requests:
- Polling uses mock data by default
- Check `getMockInstantRequests()` returns data
- Verify status filter (only shows pending/boosted)

## 📱 Responsive Testing

Test on different screen sizes:
- **Desktop:** Full layout with sidebars
- **Tablet:** 2-column grids become single column
- **Mobile:** All sections stack vertically, map height reduces

## 🎯 Next Steps

1. **Test all buyer flows** - Create, view, boost, cancel
2. **Test seller flows** - View, sort, accept requests
3. **Test different request types** - Instant vs Scheduled
4. **Test edge cases** - Expired requests, cancelled requests
5. **Test responsiveness** - Mobile, tablet, desktop

## 💡 Tips

- Use browser dev tools to test different screen sizes
- Open seller dashboard in one tab, buyer in another to see real-time updates
- Check console for API call simulations
- Price boost modal has quick buttons for common increases
- Map is scrollable and zoomable
- Dark mode works throughout!

---

## Need Help?

Check:
- `IMPLEMENTATION_SUMMARY.md` - Complete feature list
- `service-request-system.plan.md` - Original plan
- Browser console - For errors and debugging
- Component files - All have clear prop types and comments


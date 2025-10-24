#!/bin/bash

# Deployment verification script
echo "🔍 Verifying Services Hub deployment..."

# Check if URL is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide the deployment URL"
    echo "Usage: ./scripts/verify-deployment.sh https://your-app.vercel.app"
    exit 1
fi

DEPLOYMENT_URL="$1"
HEALTH_ENDPOINT="${DEPLOYMENT_URL}/api/health"

echo "📍 Checking deployment at: $DEPLOYMENT_URL"
echo "🏥 Testing health endpoint: $HEALTH_ENDPOINT"

# Test health endpoint
echo "⏳ Testing health check..."
if curl -f -s "$HEALTH_ENDPOINT" > /dev/null; then
    echo "✅ Health check passed!"
    
    # Get health check response
    HEALTH_RESPONSE=$(curl -s "$HEALTH_ENDPOINT")
    echo "📊 Health check response:"
    echo "$HEALTH_RESPONSE" | jq '.' 2>/dev/null || echo "$HEALTH_RESPONSE"
else
    echo "❌ Health check failed!"
    echo "🔍 Checking if the site is accessible..."
    
    # Test if the main site loads
    if curl -f -s "$DEPLOYMENT_URL" > /dev/null; then
        echo "✅ Main site is accessible, but API health check failed"
        echo "🔧 This might indicate an API configuration issue"
    else
        echo "❌ Main site is not accessible"
        echo "🔧 Check your deployment configuration"
    fi
    
    exit 1
fi

# Test other critical endpoints
echo ""
echo "🔍 Testing critical API endpoints..."

# Test auth endpoint (should return 405 for GET without auth)
echo "⏳ Testing auth endpoint..."
AUTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${DEPLOYMENT_URL}/api/auth/login")
if [ "$AUTH_RESPONSE" = "405" ] || [ "$AUTH_RESPONSE" = "400" ]; then
    echo "✅ Auth endpoint responding correctly (HTTP $AUTH_RESPONSE)"
else
    echo "⚠️  Auth endpoint returned unexpected status: $AUTH_RESPONSE"
fi

# Test service requests endpoint
echo "⏳ Testing service requests endpoint..."
SERVICE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${DEPLOYMENT_URL}/api/service-requests/user")
if [ "$SERVICE_RESPONSE" = "401" ] || [ "$SERVICE_RESPONSE" = "405" ]; then
    echo "✅ Service requests endpoint responding correctly (HTTP $SERVICE_RESPONSE)"
else
    echo "⚠️  Service requests endpoint returned unexpected status: $SERVICE_RESPONSE"
fi

echo ""
echo "🎉 Deployment verification completed!"
echo "📝 Next steps:"
echo "   1. Test user registration and login"
echo "   2. Test service request creation"
echo "   3. Test seller dashboard functionality"
echo "   4. Monitor Vercel logs for any errors"
echo "   5. Set up error monitoring (Sentry) if not already configured"

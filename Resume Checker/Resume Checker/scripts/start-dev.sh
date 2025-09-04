#!/bin/bash

# Resume Checker Development Server Starter
# Starts both frontend and backend servers concurrently

set -e

echo "🚀 Starting Resume Checker Development Environment"
echo "================================================"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "readme.md" ] || [ ! -d "client" ] || [ ! -d "server" ]; then
    print_error "Please run this script from the Resume Checker root directory"
    exit 1
fi

# Check for required environment file
if [ ! -f "server/.env" ]; then
    print_warning "No .env file found in server directory"
    echo "Creating .env from template..."
    cp server/.env.example server/.env
    print_info "Please edit server/.env with your configuration before continuing"
    echo "Press Enter when ready to continue..."
    read -r
fi

# Function to cleanup background processes on exit
cleanup() {
    print_info "Shutting down servers..."
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
    fi
    if [ ! -z "$CLIENT_PID" ]; then
        kill $CLIENT_PID 2>/dev/null || true
    fi
    exit 0
}

# Set trap to cleanup on script termination
trap cleanup EXIT INT TERM

# Create logs directory if it doesn't exist
mkdir -p logs

print_info "Installing dependencies..."

# Install server dependencies
print_info "Installing server dependencies..."
cd server
npm install --silent
if [ $? -ne 0 ]; then
    print_error "Failed to install server dependencies"
    exit 1
fi
print_success "Server dependencies installed"

# Install client dependencies
print_info "Installing client dependencies..."
cd ../client
npm install --silent
if [ $? -ne 0 ]; then
    print_error "Failed to install client dependencies"
    exit 1
fi
print_success "Client dependencies installed"

cd ..

print_info "Starting servers..."

# Start backend server
print_info "Starting backend server on port 5000..."
cd server
npm start > ../logs/server.log 2>&1 &
SERVER_PID=$!
cd ..

# Wait a moment for server to start
sleep 3

# Check if server started successfully
if ! ps -p $SERVER_PID > /dev/null; then
    print_error "Backend server failed to start. Check logs/server.log for details."
    exit 1
fi

print_success "Backend server started (PID: $SERVER_PID)"

# Start frontend server
print_info "Starting frontend server on port 3000..."
cd client
npm start > ../logs/client.log 2>&1 &
CLIENT_PID=$!
cd ..

# Wait a moment for client to start
sleep 5

# Check if client started successfully
if ! ps -p $CLIENT_PID > /dev/null; then
    print_error "Frontend server failed to start. Check logs/client.log for details."
    exit 1
fi

print_success "Frontend server started (PID: $CLIENT_PID)"

echo ""
echo -e "${GREEN}🎉 Development servers are running!${NC}"
echo ""
echo -e "${BLUE}📋 Server Information:${NC}"
echo "   • Backend:  http://localhost:5000"
echo "   • Frontend: http://localhost:3000"
echo "   • API Docs: http://localhost:5000/api"
echo ""
echo -e "${BLUE}📁 Log Files:${NC}"
echo "   • Server logs: logs/server.log"
echo "   • Client logs: logs/client.log"
echo ""
echo -e "${YELLOW}🔧 Development Commands:${NC}"
echo "   • View server logs: tail -f logs/server.log"
echo "   • View client logs: tail -f logs/client.log"
echo "   • Stop servers: Press Ctrl+C"
echo ""
echo -e "${BLUE}🌐 Open your browser to http://localhost:3000 to start testing!${NC}"
echo ""
echo "Press Ctrl+C to stop both servers..."

# Keep script running and monitor processes
while true; do
    # Check if server is still running
    if ! ps -p $SERVER_PID > /dev/null; then
        print_error "Backend server stopped unexpectedly!"
        exit 1
    fi
    
    # Check if client is still running
    if ! ps -p $CLIENT_PID > /dev/null; then
        print_error "Frontend server stopped unexpectedly!"
        exit 1
    fi
    
    sleep 5
done

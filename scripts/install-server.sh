#!/bin/bash

##############################################################################
# Server Installation Script for Office Management System
# This script sets up the application for server/production deployment
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     Office Management System - Server Installation          ║"
echo "║                                                              ║"
echo "║     Progressive Web Application (PWA)                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${YELLOW}⚠️  This script should typically be run with sudo for server installation${NC}"
  read -p "Continue without sudo? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please run with: sudo $0"
    exit 1
  fi
fi

##############################################################################
# Installation Method Selection
##############################################################################
echo -e "\n${BLUE}Select Installation Method:${NC}"
echo ""
echo "1) Docker (Recommended - Easiest setup)"
echo "2) Native (Direct installation on server)"
echo "3) Exit"
echo ""
read -p "Enter your choice [1-3]: " choice

case $choice in
  1)
    INSTALL_METHOD="docker"
    ;;
  2)
    INSTALL_METHOD="native"
    ;;
  3)
    echo "Installation cancelled."
    exit 0
    ;;
  *)
    echo -e "${RED}Invalid choice${NC}"
    exit 1
    ;;
esac

##############################################################################
# Docker Installation
##############################################################################
if [ "$INSTALL_METHOD" = "docker" ]; then
  echo -e "\n${BLUE}[Docker Installation]${NC}"
  
  # Check Docker
  if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo ""
    echo "To install Docker:"
    echo "  Ubuntu/Debian: curl -fsSL https://get.docker.com | sh"
    echo "  Or visit: https://docs.docker.com/get-docker/"
    exit 1
  fi
  echo -e "${GREEN}✅ Docker $(docker --version) found${NC}"
  
  # Check Docker Compose
  if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo ""
    echo "Docker Compose is required. It's usually included with Docker Desktop."
    echo "For Linux: https://docs.docker.com/compose/install/"
    exit 1
  fi
  echo -e "${GREEN}✅ Docker Compose found${NC}"
  
  # Create .env if not exists
  if [ ! -f ".env" ]; then
    echo -e "\n${BLUE}Creating environment configuration...${NC}"
    cp .env.example .env 2>/dev/null || cp env.example .env 2>/dev/null || true
    
    # Generate secure secrets
    echo "Generating secure secrets..."
    JWT_SECRET=$(openssl rand -hex 32)
    DB_PASSWORD=$(openssl rand -base64 24)
    
    # Update .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" .env
      sed -i '' "s/DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD}/" .env
    else
      sed -i "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" .env
      sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD}/" .env
    fi
    
    echo -e "${GREEN}✅ Environment file created with secure secrets${NC}"
  fi
  
  echo -e "\n${BLUE}Building and starting containers...${NC}"
  echo "This may take several minutes on first run..."
  
  # Build and start services
  docker-compose up -d --build
  
  echo -e "\n${GREEN}✅ Docker containers started${NC}"
  echo -e "\n${BLUE}Waiting for services to be healthy...${NC}"
  sleep 10
  
  # Check container status
  docker-compose ps
  
  echo -e "\n${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║                                                              ║${NC}"
  echo -e "${GREEN}║       ✨ Server Installation Complete! ✨                    ║${NC}"
  echo -e "${GREEN}║                                                              ║${NC}"
  echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
  
  echo -e "\n${BLUE}📝 Server Access:${NC}"
  echo "   → Application: http://localhost:3000"
  echo "   → Database: localhost:5432"
  echo ""
  echo -e "${BLUE}🔧 Management Commands:${NC}"
  echo "   View logs:        docker-compose logs -f app"
  echo "   Stop services:    docker-compose stop"
  echo "   Start services:   docker-compose start"
  echo "   Restart:          docker-compose restart"
  echo "   Remove all:       docker-compose down -v"
  echo ""
  echo -e "${BLUE}🗄️  Database Management:${NC}"
  echo "   Access DB:        docker-compose exec postgres psql -U postgres office_management"
  echo "   Backup DB:        docker-compose exec postgres pg_dump -U postgres office_management > backup.sql"
  echo "   Restore DB:       docker-compose exec -T postgres psql -U postgres office_management < backup.sql"
  
fi

##############################################################################
# Native Installation
##############################################################################
if [ "$INSTALL_METHOD" = "native" ]; then
  echo -e "\n${BLUE}[Native Installation]${NC}"
  
  # Check prerequisites
  echo -e "\n${BLUE}[1/7] Checking prerequisites...${NC}"
  
  # Check Node.js
  if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18.x or higher"
    exit 1
  fi
  
  NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher (found: $(node -v))${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ Node.js $(node -v) found${NC}"
  
  # Check PostgreSQL
  if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed${NC}"
    echo "Please install PostgreSQL 13 or higher"
    exit 1
  fi
  echo -e "${GREEN}✅ PostgreSQL found${NC}"
  
  # Check PM2
  if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 not found. Installing...${NC}"
    npm install -g pm2
  fi
  echo -e "${GREEN}✅ PM2 found${NC}"
  
  # Install dependencies
  echo -e "\n${BLUE}[2/7] Installing dependencies...${NC}"
  npm ci --production
  echo -e "${GREEN}✅ Dependencies installed${NC}"
  
  # Environment setup
  echo -e "\n${BLUE}[3/7] Configuring environment...${NC}"
  if [ ! -f ".env" ]; then
    cp .env.example .env 2>/dev/null || cp env.example .env 2>/dev/null || true
    
    # Generate secrets
    JWT_SECRET=$(openssl rand -hex 32)
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" .env
    else
      sed -i "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" .env
    fi
    
    echo -e "${GREEN}✅ Environment file created${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env and configure database settings${NC}"
  fi
  
  # Database setup
  echo -e "\n${BLUE}[4/7] Setting up database...${NC}"
  read -p "Set up database now? (Y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    npm run setup-db
  fi
  
  # Generate PWA icons
  echo -e "\n${BLUE}[5/7] Generating PWA icons...${NC}"
  if [ ! -f "public/icon-192.png" ]; then
    node scripts/generate-pwa-icons.js
  fi
  echo -e "${GREEN}✅ Icons generated${NC}"
  
  # Build application
  echo -e "\n${BLUE}[6/7] Building application...${NC}"
  npm run build
  echo -e "${GREEN}✅ Build complete${NC}"
  
  # Setup PM2
  echo -e "\n${BLUE}[7/7] Setting up PM2 process manager...${NC}"
  
  # Create PM2 ecosystem file
  cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'office-management',
    script: './server/index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M'
  }]
}
EOF
  
  # Start with PM2
  pm2 start ecosystem.config.js
  pm2 save
  
  # Setup PM2 startup
  echo -e "\n${YELLOW}To enable auto-start on system boot, run:${NC}"
  pm2 startup | grep -o "sudo.*"
  
  echo -e "\n${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║                                                              ║${NC}"
  echo -e "${GREEN}║       ✨ Server Installation Complete! ✨                    ║${NC}"
  echo -e "${GREEN}║                                                              ║${NC}"
  echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
  
  echo -e "\n${BLUE}📝 Server Access:${NC}"
  echo "   → Application: http://localhost:3000"
  echo ""
  echo -e "${BLUE}🔧 PM2 Management Commands:${NC}"
  echo "   View status:      pm2 status"
  echo "   View logs:        pm2 logs office-management"
  echo "   Restart:          pm2 restart office-management"
  echo "   Stop:             pm2 stop office-management"
  echo "   Start:            pm2 start office-management"
  echo ""
  echo -e "${BLUE}🔒 Security Recommendations:${NC}"
  echo "   1. Configure firewall (ufw/iptables)"
  echo "   2. Set up Nginx reverse proxy with SSL"
  echo "   3. Configure automatic backups"
  echo "   4. Review .env file and secure secrets"
  echo "   5. Enable PostgreSQL authentication"
  
fi

echo -e "\n${GREEN}Happy managing! 🚀${NC}"

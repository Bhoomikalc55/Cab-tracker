#!/bin/bash
# CabTrack Local Setup Script
# Run once: bash setup.sh

set -e
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚖 CabTrack Setup${NC}"
echo "────────────────────────────────────"

# 1. Install backend dependencies
echo -e "\n${YELLOW}Installing backend dependencies...${NC}"
cd backend
npm install
cd ..

# 2. Create .env if not exists
if [ ! -f backend/.env ]; then
  echo -e "\n${YELLOW}Creating .env file...${NC}"
  SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
  cat > backend/.env << EOF
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cabtrack
JWT_SECRET=${SECRET}
FRONTEND_URL=*
EOF
  echo -e "${GREEN}✅ .env created with a random JWT secret${NC}"
  echo -e "${YELLOW}⚠️  Edit backend/.env and set your DATABASE_URL if needed${NC}"
else
  echo -e "${GREEN}✅ .env already exists${NC}"
fi

echo ""
echo "────────────────────────────────────"
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Make sure PostgreSQL is running"
echo "  2. Create the database:  createdb cabtrack"
echo "  3. Start the server:     cd backend && npm run dev"
echo "  4. Open the frontend:    open frontend/index.html"
echo ""
echo "Default admin login:"
echo "  Email:    admin@company.com"
echo "  Emp ID:   ADMIN"
echo "  Password: Admin@123"

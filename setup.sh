#!/bin/bash

SERVICE_NAME="lemonbooks-api"
APP_DIR="/home/tinkerpal/lemonbooks-platform/apps/api"
NODE_BIN="/usr/bin/node"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

if [ ! -d "$APP_DIR" ]; then
  echo "Error: App directory $APP_DIR does not exist."
  exit 1
fi

if [ ! -d "$APP_DIR/build" ]; then
  echo "Error: Build directory not found. Run 'npm run build' first."
  exit 1
fi

if [ ! -f "$APP_DIR/.env" ]; then
  echo "Error: Missing $APP_DIR/.env"
  exit 1
fi

echo "Pulling latest changes..."
cd "$APP_DIR/.."
git pull origin main || echo "Git pull failed or not a git repo, continuing..."

echo "Building..."
npm install && npm run build

echo "Creating systemd service file..."
sudo tee "$SERVICE_FILE" > /dev/null <<EOF
[Unit]
Description=LemonBooks API
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
ExecStart=$NODE_BIN build/index.js
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=$SERVICE_NAME

[Install]
WantedBy=multi-user.target
EOF

echo "Reloading systemd..."
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable ${SERVICE_NAME}.service

echo "Service '$SERVICE_NAME' created and enabled."
read -p "Do you want to start the app now? (y/n): " choice

if [[ "$choice" =~ ^[Yy]$ ]]; then
  sudo systemctl start ${SERVICE_NAME}.service
  echo "Started. Check with: sudo journalctl -u ${SERVICE_NAME} -f"
else
  echo "Start manually with: sudo systemctl start ${SERVICE_NAME}.service"
fi

#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="lemonbooks-api"
DEPLOY_DIR="${DEPLOY_DIR:-/home/tinkerpal/lemonbooks-platform}"
API_DIR="$DEPLOY_DIR/apps/api"
NODE_BIN="$(command -v node)"
SYSTEM_USER="${SYSTEM_USER:-lemonbooks}"
NODE_ENV="${NODE_ENV:-production}"
PORT="${PORT:-5000}"
RESTART_SEC=5
TIMEOUT_STOP_SEC=30

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# --- Checks ---
[[ $EUID -ne 0 ]] && error "Run this script as root (sudo ./setup.sh)"

[[ -d "$DEPLOY_DIR" ]] || error "Deploy directory not found: $DEPLOY_DIR"
[[ -f "$API_DIR/.env" ]] || error "Missing $API_DIR/.env — create it from .env.example first"
[[ -d "$API_DIR/build" ]] || error "Build directory not found — run 'npm run build' first"
[[ -x "$NODE_BIN" ]] || error "Node.js not found in PATH"

info "Deploy directory: $DEPLOY_DIR"
info "Node binary: $NODE_BIN"
info "Node version: $("$NODE_BIN" --version)"

# --- Create system user if it doesn't exist ---
if ! id "$SYSTEM_USER" &>/dev/null; then
    info "Creating system user: $SYSTEM_USER"
    useradd --system --shell /usr/sbin/nologin --home-dir "$DEPLOY_DIR" "$SYSTEM_USER"
else
    info "System user $SYSTEM_USER already exists"
fi

chown -R "$SYSTEM_USER":"$SYSTEM_USER" "$DEPLOY_DIR"
chmod 600 "$API_DIR/.env"

# --- Write systemd service ---
info "Creating systemd service: $SERVICE_NAME"

cat > "/etc/systemd/system/${SERVICE_NAME}.service" << EOF
[Unit]
Description=LemonBooks API
Documentation=https://github.com/your-org/lemonbooks-platform
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=$SYSTEM_USER
Group=$SYSTEM_USER
WorkingDirectory=$API_DIR
Environment=NODE_ENV=$NODE_ENV
ExecStart=$NODE_BIN build/index.js
Restart=on-failure
RestartSec=$RESTART_SEC
StandardOutput=journal
StandardError=journal
SyslogIdentifier=$SERVICE_NAME
KillSignal=SIGTERM
TimeoutStopSec=$TIMEOUT_STOP_SEC
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$DEPLOY_DIR
PrivateTmp=true

WantedBy=multi-user.target
EOF

# --- Reload and enable ---
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"

info "Service installed and enabled."
echo ""
echo "  To start:   sudo systemctl start $SERVICE_NAME"
echo "  To stop:    sudo systemctl stop $SERVICE_NAME"
echo "  To restart: sudo systemctl restart $SERVICE_NAME"
echo "  Logs:       sudo journalctl -u $SERVICE_NAME -f"
echo "  Health:     curl http://localhost:$PORT/health"
echo ""
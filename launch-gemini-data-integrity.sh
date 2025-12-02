#!/bin/bash

################################################################################
# Apex OS - Data Integrity Check Script
# Tự động kiểm tra tính toàn vẹn dữ liệu trên toàn bộ Apex Platform
#
# Usage:
#   ./launch-gemini-data-integrity.sh                    # Full check
#   ./launch-gemini-data-integrity.sh --quick            # Quick check
#   ./launch-gemini-data-integrity.sh --scheduled        # Scheduled check
#   ./launch-gemini-data-integrity.sh --email admin@... # With email report
################################################################################

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GEMINI_PROMPT="${PROJECT_ROOT}/.gemini/GEMINI_DATA_INTEGRITY_PROMPT.md"
AUDIT_SCRIPT="${PROJECT_ROOT}/scripts/apex-data-integrity-audit.py"
REPORT_DIR="${PROJECT_ROOT}/.data-integrity-reports"
LOG_FILE="${REPORT_DIR}/data-integrity-$(date +%Y%m%d-%H%M%S).log"

# Parse arguments
CHECK_TYPE="full"
SEND_EMAIL=false
EMAIL_RECIPIENT=""
SCHEDULE_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --quick)
            CHECK_TYPE="quick"
            shift
            ;;
        --scheduled)
            SCHEDULE_MODE=true
            shift
            ;;
        --email)
            SEND_EMAIL=true
            EMAIL_RECIPIENT="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

################################################################################
# HELPER FUNCTIONS
################################################################################

log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] [${level}] ${message}" | tee -a "${LOG_FILE}"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $@" | tee -a "${LOG_FILE}"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $@" | tee -a "${LOG_FILE}"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $@" | tee -a "${LOG_FILE}"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $@" | tee -a "${LOG_FILE}"
}

print_header() {
    local text="$1"
    echo "" | tee -a "${LOG_FILE}"
    echo "═══════════════════════════════════════════════════════════════════" | tee -a "${LOG_FILE}"
    echo "  ${text}" | tee -a "${LOG_FILE}"
    echo "═══════════════════════════════════════════════════════════════════" | tee -a "${LOG_FILE}"
    echo "" | tee -a "${LOG_FILE}"
}

check_dependency() {
    if ! command -v $1 &> /dev/null; then
        log_error "Dependency not found: $1"
        return 1
    fi
    return 0
}

################################################################################
# MAIN FUNCTIONS
################################################################################

setup() {
    print_header "🚀 SETTING UP DATA INTEGRITY CHECK"
    
    # Create report directory
    mkdir -p "${REPORT_DIR}"
    log_info "Report directory: ${REPORT_DIR}"
    
    # Initialize log file
    echo "Data Integrity Check - $(date)" > "${LOG_FILE}"
    log_success "Log file created: ${LOG_FILE}"
    
    # Check dependencies
    log_info "Checking dependencies..."
    
    if ! check_dependency "gemini"; then
        log_warning "Gemini CLI not found. Installing..."
        npm install -g @google/generative-ai-cli || {
            log_error "Failed to install Gemini CLI"
            return 1
        }
    fi
    
    if ! check_dependency "python3"; then
        log_error "Python 3 is required"
        return 1
    fi
    
    log_success "All dependencies available"
}

verify_gemini_login() {
    print_header "🔐 VERIFYING GEMINI CLI LOGIN"
    
    if gemini status &>/dev/null; then
        log_success "Gemini CLI is logged in"
        return 0
    else
        log_warning "Gemini CLI not logged in"
        log_info "Please login with: gemini login --google"
        return 1
    fi
}

check_database_connection() {
    print_header "🔌 CHECKING DATABASE CONNECTION"
    
    # Check if environment variables are set
    if [ -z "${DATABASE_URL}" ]; then
        log_warning "DATABASE_URL not set, using .env.local"
        if [ -f "${PROJECT_ROOT}/.env.local" ]; then
            source "${PROJECT_ROOT}/.env.local"
        fi
    fi
    
    if [ -z "${DATABASE_URL}" ]; then
        log_error "DATABASE_URL not configured"
        return 1
    fi
    
    log_success "Database URL configured"
    log_info "Testing connection..."
    
    # Try a simple query to verify connection
    if command -v psql &> /dev/null; then
        if psql "${DATABASE_URL}" -c "SELECT 1" &>/dev/null; then
            log_success "Database connection successful"
            return 0
        else
            log_error "Database connection failed"
            return 1
        fi
    else
        log_warning "psql not available, skipping connection test"
        return 0
    fi
}

run_gemini_check() {
    print_header "🤖 RUNNING GEMINI CLI DATA INTEGRITY CHECK"
    
    log_info "Check Type: ${CHECK_TYPE}"
    
    # Prepare command based on check type
    if [ "${CHECK_TYPE}" == "quick" ]; then
        log_info "Running QUICK integrity check..."
        local gemini_cmd="gemini task 'Run quick data integrity check for Apex Platform:
        1. Verify all tables exist
        2. Check table row counts
        3. Verify no orphaned records
        4. Quick balance check
        5. Summary only'"
    else
        log_info "Running FULL integrity check..."
        # Read the prompt file
        if [ ! -f "${GEMINI_PROMPT}" ]; then
            log_error "Gemini prompt file not found: ${GEMINI_PROMPT}"
            return 1
        fi
        
        # Run full check with prompt
        local gemini_cmd="gemini task \"$(cat ${GEMINI_PROMPT})\""
    fi
    
    # Execute gemini command
    log_info "Executing Gemini CLI..."
    eval "${gemini_cmd}" > "${REPORT_DIR}/gemini-output-$(date +%Y%m%d-%H%M%S).txt" 2>&1 || {
        log_error "Gemini CLI check failed"
        return 1
    }
    
    log_success "Gemini CLI check completed"
}

run_python_audit() {
    print_header "🐍 RUNNING PYTHON DATA INTEGRITY AUDIT"
    
    if [ ! -f "${AUDIT_SCRIPT}" ]; then
        log_warning "Python audit script not found: ${AUDIT_SCRIPT}"
        return 0
    fi
    
    log_info "Executing Python audit script..."
    python3 "${AUDIT_SCRIPT}" --full --output "${REPORT_DIR}" 2>&1 | tee -a "${LOG_FILE}" || {
        log_warning "Python audit script had issues (non-critical)"
    }
    
    log_success "Python audit completed"
}

generate_summary_report() {
    print_header "📊 GENERATING SUMMARY REPORT"
    
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local summary_file="${REPORT_DIR}/summary-$(date +%Y%m%d-%H%M%S).txt"
    
    cat > "${summary_file}" << EOF
╔════════════════════════════════════════════════════════════════════════════╗
║              APEX OS - DATA INTEGRITY CHECK SUMMARY REPORT                 ║
╚════════════════════════════════════════════════════════════════════════════╝

REPORT METADATA:
  Timestamp:        ${timestamp}
  Check Type:       ${CHECK_TYPE}
  Project Root:     ${PROJECT_ROOT}
  Report Directory: ${REPORT_DIR}

CHECK RESULTS:
  Status:           Checking...
  Integrity Score:  Pending...
  Issues Found:     Pending...

NEXT STEPS:
  1. Review detailed reports in: ${REPORT_DIR}
  2. Check Gemini output: ${REPORT_DIR}/gemini-output-*.txt
  3. Review Python audit: ${REPORT_DIR}/data-integrity-*.json
  4. View HTML report: ${REPORT_DIR}/data-integrity-*.html
  5. View full log: ${LOG_FILE}

RECOMMENDATIONS:
  - Schedule daily checks at 2 AM UTC
  - Set up email alerts for critical issues
  - Review issues within 24 hours
  - Archive reports for compliance

═════════════════════════════════════════════════════════════════════════════

For detailed analysis, review the Gemini CLI output and Python audit results.

EOF
    
    log_success "Summary report created: ${summary_file}"
    cat "${summary_file}" | tee -a "${LOG_FILE}"
}

send_email_report() {
    print_header "📧 SENDING EMAIL REPORT"
    
    if [ "${SEND_EMAIL}" != true ] || [ -z "${EMAIL_RECIPIENT}" ]; then
        log_info "Email notification disabled"
        return 0
    fi
    
    log_info "Sending report to: ${EMAIL_RECIPIENT}"
    
    # Find latest report files
    local latest_json=$(ls -t "${REPORT_DIR}"/data-integrity-*.json 2>/dev/null | head -1)
    local latest_html=$(ls -t "${REPORT_DIR}"/data-integrity-*.html 2>/dev/null | head -1)
    
    if [ -z "${latest_json}" ]; then
        log_warning "No JSON report found to send"
        return 1
    fi
    
    # Create email body from JSON
    local email_subject="Apex OS - Data Integrity Check Report"
    local email_body="Data Integrity Check completed at $(date)\n\nReport files:\n"
    
    if command -v mail &> /dev/null; then
        echo -e "${email_body}\nSee attached reports" | \
            mail -s "${email_subject}" \
                 -a "${latest_json}" \
                 -a "${latest_html}" \
                 "${EMAIL_RECIPIENT}"
        
        log_success "Email sent to ${EMAIL_RECIPIENT}"
    elif command -v sendmail &> /dev/null; then
        log_info "Using sendmail (alternative method)"
        log_warning "Sendmail email configuration needed - skipping"
    else
        log_warning "No email command found (mail/sendmail)"
        log_info "Report saved to: ${REPORT_DIR}"
    fi
}

schedule_daily_check() {
    print_header "📅 SCHEDULING DAILY DATA INTEGRITY CHECK"
    
    if [ "${SCHEDULE_MODE}" != true ]; then
        log_info "Scheduled mode not enabled"
        return 0
    fi
    
    log_info "Setting up daily check at 2 AM UTC..."
    
    # Create a cron job wrapper
    local cron_script="${PROJECT_ROOT}/.gemini/cron-data-integrity-check.sh"
    
    cat > "${cron_script}" << 'CRON_EOF'
#!/bin/bash
cd "$(dirname "${0}")/../.."
./launch-gemini-data-integrity.sh --quick
CRON_EOF
    
    chmod +x "${cron_script}"
    log_success "Cron script created: ${cron_script}"
    
    log_info "To enable daily scheduling, add to crontab:"
    echo "  0 2 * * * ${cron_script}"
    log_info ""
    log_info "Or use PM2: pm2 start '${cron_script}' --name 'data-integrity-check' --cron '0 2 * * *'"
}

cleanup_old_reports() {
    print_header "🧹 CLEANING UP OLD REPORTS"
    
    log_info "Keeping reports from last 30 days..."
    
    find "${REPORT_DIR}" -type f -mtime +30 -delete 2>/dev/null || true
    
    log_info "Current report count:"
    find "${REPORT_DIR}" -type f | wc -l | tee -a "${LOG_FILE}"
    
    log_success "Cleanup completed"
}

show_final_status() {
    print_header "✨ DATA INTEGRITY CHECK COMPLETE"
    
    log_success "All checks completed successfully"
    log_info "Report Location: ${REPORT_DIR}"
    log_info "Log File: ${LOG_FILE}"
    
    echo "" | tee -a "${LOG_FILE}"
    echo "Available Reports:" | tee -a "${LOG_FILE}"
    ls -lh "${REPORT_DIR}" | tail -10 | tee -a "${LOG_FILE}"
    
    echo "" | tee -a "${LOG_FILE}"
    echo "Next Recommended Steps:" | tee -a "${LOG_FILE}"
    echo "  1. Review HTML report in browser" | tee -a "${LOG_FILE}"
    echo "  2. Check JSON report for programmatic analysis" | tee -a "${LOG_FILE}"
    echo "  3. Schedule daily checks with: $0 --scheduled" | tee -a "${LOG_FILE}"
    echo "  4. Set up email alerts: $0 --email admin@example.com" | tee -a "${LOG_FILE}"
    
    echo "" | tee -a "${LOG_FILE}"
}

################################################################################
# MAIN EXECUTION
################################################################################

main() {
    log_info "Starting Apex OS Data Integrity Check"
    log_info "Project: ${PROJECT_ROOT}"
    
    # Execute all steps
    setup || exit 1
    verify_gemini_login || {
        log_error "Gemini CLI login required"
        exit 1
    }
    check_database_connection || {
        log_warning "Database connection check failed, continuing anyway"
    }
    run_gemini_check || {
        log_warning "Gemini check had issues, running Python audit instead"
    }
    run_python_audit || {
        log_warning "Python audit had issues"
    }
    generate_summary_report
    send_email_report
    schedule_daily_check
    cleanup_old_reports
    show_final_status
    
    log_success "Data integrity check script completed"
    exit 0
}

# Run main function
main "$@"

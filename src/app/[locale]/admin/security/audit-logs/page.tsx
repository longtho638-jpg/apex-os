import AuditLogViewer from '@/components/admin/AuditLogViewer';

export default function AuditLogsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
                <p className="text-zinc-400">
                    View and export detailed logs of all administrative actions.
                </p>
            </div>

            <AuditLogViewer />
        </div>
    );
}

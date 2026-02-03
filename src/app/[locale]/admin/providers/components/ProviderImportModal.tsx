'use client';

import { logger } from '@/lib/logger';
import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { X, Upload, FileText, AlertCircle, CheckCircle2, Loader2, Download } from 'lucide-react';
import { providerApiSchema, type ProviderApiPayload } from '@/lib/schemas/provider';

interface ProviderImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    token: string;
}

interface ImportRow {
    data: any;
    isValid: boolean;
    errors: string[];
}

export default function ProviderImportModal({ isOpen, onClose, onSuccess, token }: ProviderImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [parsedRows, setParsedRows] = useState<ImportRow[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const reset = () => {
        setFile(null);
        setParsedRows([]);
        setImportResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseFile(selectedFile);
        }
    };

    const parseFile = (file: File) => {
        setIsParsing(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const rows = results.data.map((row: any) => {
                    // Transform CSV fields to match schema if needed (e.g. JSON strings to objects)
                    const transformed = { ...row };

                    // Try to parse JSON fields if they are strings
                    if (typeof transformed.asset_config === 'string') {
                        try { transformed.asset_config = JSON.parse(transformed.asset_config); } catch { }
                    }
                    if (typeof transformed.regulatory_info === 'string') {
                        try { transformed.regulatory_info = JSON.parse(transformed.regulatory_info); } catch { }
                    }

                    const validation = providerApiSchema.safeParse(transformed);
                    return {
                        data: transformed,
                        isValid: validation.success,
                        errors: validation.success ? [] : validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
                    };
                });
                setParsedRows(rows);
                setIsParsing(false);
            },
            error: (error) => {
                logger.error('CSV Parse Error:', error);
                setIsParsing(false);
            }
        });
    };

    const handleImport = async () => {
        const validRows = parsedRows.filter(r => r.isValid).map(r => r.data);
        if (validRows.length === 0) return;

        setIsImporting(true);
        try {
            const res = await fetch('/api/v1/admin/providers/bulk-import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ providers: validRows })
            });

            const data = await res.json();
            if (res.ok) {
                setImportResult({
                    success: data.imported_count,
                    failed: data.failed_count
                });
                setTimeout(() => {
                    onSuccess();
                    // Don't close immediately so user can see result
                }, 2000);
            } else {
                alert('Import failed: ' + data.message);
            }
        } catch (error) {
            logger.error('Import error:', error);
            alert('Import failed due to network error');
        } finally {
            setIsImporting(false);
        }
    };

    const downloadTemplate = () => {
        const headers = ['provider_code', 'provider_name', 'asset_class', 'status', 'partner_uuid', 'referral_link_template', 'asset_config', 'regulatory_info'];
        const sample = ['demo_provider', 'Demo Provider', 'crypto', 'testing', 'UUID-123', 'https://example.com?ref={partner_uuid}', '{}', '{}'];
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + sample.join(",");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "provider_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!isOpen) return null;

    const validCount = parsedRows.filter(r => r.isValid).length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-900 border border-white/10 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Upload className="w-5 h-5 text-blue-400" />
                        Bulk Import Providers
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col p-6 space-y-6">
                    {!file ? (
                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors p-12 text-center">
                            <Upload className="w-12 h-12 text-gray-500 mb-4" />
                            <p className="text-lg font-medium text-white mb-2">Drop CSV file here or click to upload</p>
                            <p className="text-sm text-gray-400 mb-6">Supported columns: provider_code, provider_name, asset_class, status...</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    Select File
                                </button>
                                <button
                                    onClick={downloadTemplate}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Template
                                </button>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".csv"
                                className="hidden"
                            />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                        <FileText className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{file.name}</p>
                                        <p className="text-xs text-gray-400">
                                            {parsedRows.length} rows found • {validCount} valid
                                        </p>
                                    </div>
                                </div>
                                <button onClick={reset} className="text-sm text-red-400 hover:text-red-300">
                                    Remove File
                                </button>
                            </div>

                            {/* Preview Table */}
                            <div className="flex-1 overflow-auto border border-white/10 rounded-lg">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-white/5 text-gray-400 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2">Status</th>
                                            <th className="px-4 py-2">Code</th>
                                            <th className="px-4 py-2">Name</th>
                                            <th className="px-4 py-2">Asset Class</th>
                                            <th className="px-4 py-2">Errors</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {parsedRows.map((row, idx) => (
                                            <tr key={idx} className={row.isValid ? 'bg-emerald-500/5' : 'bg-red-500/5'}>
                                                <td className="px-4 py-2">
                                                    {row.isValid ? (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    ) : (
                                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 text-white">{row.data.provider_code}</td>
                                                <td className="px-4 py-2 text-gray-300">{row.data.provider_name}</td>
                                                <td className="px-4 py-2 text-gray-300">{row.data.asset_class}</td>
                                                <td className="px-4 py-2 text-red-400 text-xs">
                                                    {row.errors.join(', ')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Result Message */}
                    {importResult && (
                        <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Successfully imported {importResult.success} providers. ({importResult.failed} failed)</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-gray-900/50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        disabled={isImporting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!file || validCount === 0 || isImporting || !!importResult}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isImporting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Import {validCount} Providers
                    </button>
                </div>
            </div>
        </div>
    );
}

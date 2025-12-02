'use client';

import LegalPageLayout from '@/components/marketing/LegalPageLayout';
import { ShieldCheck, Lock, Key } from 'lucide-react';

export default function SecurityPage() {
    return (
        <LegalPageLayout title="Security Policy" lastUpdated="December 1, 2025">
            <div className="grid md:grid-cols-3 gap-6 mb-8 not-prose">
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <ShieldCheck className="w-8 h-8 text-emerald-500 mb-4" />
                    <h4 className="font-bold text-white mb-2">Bank-Grade Encryption</h4>
                    <p className="text-sm text-zinc-400">All data is encrypted at rest and in transit using AES-256.</p>
                </div>
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <Lock className="w-8 h-8 text-emerald-500 mb-4" />
                    <h4 className="font-bold text-white mb-2">Cold Storage</h4>
                    <p className="text-sm text-zinc-400">95% of user funds are stored in offline, multi-sig wallets.</p>
                </div>
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <Key className="w-8 h-8 text-emerald-500 mb-4" />
                    <h4 className="font-bold text-white mb-2">YubiKey Support</h4>
                    <p className="text-sm text-zinc-400">Hardware-based authentication for maximum account security.</p>
                </div>
            </div>

            <h3>1. Infrastructure Security</h3>
            <p>
                Our infrastructure is hosted on AWS with strict VPC isolation and DDoS protection.
                We conduct regular penetration testing and security audits.
            </p>

            <h3>2. Account Protection</h3>
            <p>
                We mandate 2FA for all withdrawals and sensitive account changes.
                We also support WebAuthn for hardware key authentication.
            </p>

            <h3>3. Responsible Disclosure</h3>
            <p>
                If you discover a security vulnerability, please report it to security@apexrebate.com.
                We offer a bug bounty program for valid disclosures.
            </p>
        </LegalPageLayout>
    );
}

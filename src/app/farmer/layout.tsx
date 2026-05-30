'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Only check redirect when loading is finished
        if (!isLoading) {
            // Allow access to registration page without auth
            const isRegistrationParams = pathname?.includes('/register');

            if (!isAuthenticated && !isRegistrationParams) {
                router.push('/login?role=farmer');
            } else if (isAuthenticated && !user?.roles.includes('farmer')) {
                // Redirect to their appropriate dashboard if they have a different role
                if (user?.roles.includes('buyer')) router.push('/buyer/dashboard');
                else if (user?.roles.includes('processor')) router.push('/processor/dashboard');
                else if (user?.roles.includes('fpo')) router.push('/fpo/dashboard');
                else if (user?.roles.includes('admin')) router.push('/admin/dashboard');
                else router.push('/login?error=unauthorized');
            }
        }
    }, [user, isLoading, isAuthenticated, router, pathname]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Prevent flash of content for unauthorized users (except registration)
    const isRegistrationParams = pathname?.includes('/register');
    if ((!isAuthenticated || !user?.roles.includes('farmer')) && !isRegistrationParams) {
        return null;
    }

    return <>{children}</>;
}

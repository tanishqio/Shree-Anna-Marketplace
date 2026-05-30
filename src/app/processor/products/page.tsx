"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Package,
    Loader2,
    Plus,
    Edit,
    Trash2,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { milletTypes } from '@/lib/design-tokens';

interface Product {
    id: string;
    crop: string;
    product_type?: string;
    qty_kg: number;
    min_price_per_qtl: number;
    status: string;
    is_organic: boolean;
    created_at: string;
}

const statusColors: Record<string, string> = {
    active: 'bg-accent/10 text-accent border-accent/20',
    draft: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    sold: 'bg-green-500/10 text-green-600 border-green-500/20',
};

export default function ProcessorProductsPage() {
    const [role, setRole] = useState('processor');
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch processor's processed listings
            const response = await api.get<any>('/listings/my');
            const allListings = response.data?.listings || [];
            // Filter only processed products
            setProducts(allListings.filter((l: any) => l.is_processed));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load products');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const getMillet = (id: string) => milletTypes.find(m => m.id === id) || { id, name: id };

    const stats = {
        total: products.length,
        active: products.filter(p => p.status === 'active').length,
        totalQty: products.reduce((sum, p) => sum + p.qty_kg, 0),
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navigation currentRole={role} onRoleChange={setRole} />
                <main className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        <p className="mt-2 text-muted-foreground">Loading products...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navigation currentRole={role} onRoleChange={setRole} />

            <main className="container mx-auto px-4 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-heading font-bold">My Products</h1>
                        <p className="text-muted-foreground mt-1">Manage your processed products</p>
                    </div>
                    <Button asChild size="lg">
                        <a href="/processor/listing/create">
                            <Plus className="w-5 h-5 mr-2" />
                            Add Product
                        </a>
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Total', value: stats.total, color: 'bg-primary/10 text-primary' },
                        { label: 'Active', value: stats.active, color: 'bg-accent/10 text-accent' },
                        { label: 'Total Qty', value: `${stats.totalQty}kg`, color: 'bg-sky-500/10 text-sky-600' },
                    ].map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-card rounded-2xl border border-border p-6"
                        >
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <p className={`text-3xl font-bold ${stat.color.split(' ')[1]}`}>{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 rounded-lg">
                        {error}
                    </div>
                )}

                {products.length === 0 ? (
                    <div className="text-center py-16 bg-card rounded-2xl border border-border">
                        <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No products yet</h3>
                        <p className="text-muted-foreground mb-6">Add your first processed product</p>
                        <Button asChild size="lg">
                            <a href="/processor/listing/create">Add Product</a>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {products.map((product, idx) => {
                            const millet = getMillet(product.crop);
                            const pricePerKg = product.min_price_per_qtl / 100;

                            return (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-card rounded-xl border border-border p-6"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                                <Package className="w-7 h-7 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-semibold text-lg">{millet.name}</h3>
                                                    {product.product_type && (
                                                        <Badge variant="outline">{product.product_type}</Badge>
                                                    )}
                                                    <Badge className={`${statusColors[product.status]} border`}>
                                                        {product.status}
                                                    </Badge>
                                                    {product.is_organic && (
                                                        <Badge variant="outline" className="bg-green-50 text-green-700">Organic</Badge>
                                                    )}
                                                </div>
                                                <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                                    <p>Quantity: <span className="font-medium text-foreground">{product.qty_kg} kg</span></p>
                                                    <p>Price: <span className="font-medium text-foreground">₹{pricePerKg.toFixed(2)}/kg</span></p>
                                                    <p>Total Value: <span className="font-medium text-accent">
                                                        ₹{(product.qty_kg * pricePerKg).toLocaleString()}
                                                    </span></p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

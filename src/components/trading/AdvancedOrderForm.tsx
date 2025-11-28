'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CreateOrderSchema, BaseOrderSchema, orderRefinement } from '@/lib/validations/trade';

// Extend schema for form specific fields (if any) or just use the shared one
// We need to handle string inputs -> number conversion for the form
const FormSchema = BaseOrderSchema.extend({
    quantity: z.string().min(1, "Required").transform((val) => parseFloat(val)).pipe(z.number().positive()),
    price: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
    stop_price: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
    limit_price: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
}).refine(orderRefinement, {
    message: "Invalid price parameters for the selected order type"
});

type FormInput = z.input<typeof FormSchema>;
type FormOutput = z.output<typeof FormSchema>;

interface AdvancedOrderFormProps {
    symbol?: string;
    currentPrice?: number;
}

export default function AdvancedOrderForm({ symbol = 'BTC/USDT', currentPrice = 95000 }: AdvancedOrderFormProps) {
    const [side, setSide] = useState<'buy' | 'sell'>('buy');
    const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop_limit' | 'oco'>('limit');
    const [isLoading, setIsLoading] = useState(false);

    // Use distinct input and output types for useForm
    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormInput, any, FormOutput>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            symbol,
            side: 'buy',
            type: 'limit',
            quantity: '', // Default to empty string for controlled input
            price: undefined,
        }
    });

    // Update form side when local state changes
    const handleSideChange = (newSide: 'buy' | 'sell') => {
        setSide(newSide);
        setValue('side', newSide);
    };

    const handleTypeChange = (newType: string) => {
        const type = newType as any;
        setOrderType(type);
        setValue('type', type);
        
        // Reset irrelevant fields based on type
        if (type === 'market') {
            setValue('price', undefined);
            setValue('stop_price', undefined);
        }
    };

    const onSubmit = async (data: FormOutput) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/v1/trade/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}` // Should use a real auth hook
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to place order');
            }

            toast.success(`${side.toUpperCase()} Order Placed!`, {
                description: `ID: ${result.order_id}`
            });
            
            reset({ symbol, side, type: orderType, quantity: '', price: undefined });
            
        } catch (error: any) {
            console.error(error);
            toast.error('Order Failed', {
                description: error.message
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md border-zinc-800 bg-zinc-950/50 backdrop-blur-xl">
            <CardHeader className="pb-4">
                <CardTitle className="flex justify-between items-center text-lg font-medium">
                    <span>Place Order</span>
                    <span className="text-sm font-normal text-zinc-400">{symbol}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Side Toggle */}
                <div className="flex w-full gap-2 mb-6">
                    <Button
                        type="button"
                        variant={side === 'buy' ? 'default' : 'outline'}
                        className={`flex-1 ${side === 'buy' ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent' : 'border-zinc-700 text-zinc-400 hover:text-emerald-500'}`}
                        onClick={() => handleSideChange('buy')}
                    >
                        Buy
                    </Button>
                    <Button
                        type="button"
                        variant={side === 'sell' ? 'default' : 'outline'}
                        className={`flex-1 ${side === 'sell' ? 'bg-rose-600 hover:bg-rose-700 text-white border-transparent' : 'border-zinc-700 text-zinc-400 hover:text-rose-500'}`}
                        onClick={() => handleSideChange('sell')}
                    >
                        Sell
                    </Button>
                </div>

                {/* Order Type Tabs */}
                <Tabs defaultValue="limit" onValueChange={handleTypeChange} className="w-full mb-6">
                    <TabsList className="grid w-full grid-cols-4 bg-zinc-900/50">
                        <TabsTrigger value="market">Market</TabsTrigger>
                        <TabsTrigger value="limit">Limit</TabsTrigger>
                        <TabsTrigger value="stop_limit">Stop</TabsTrigger>
                        <TabsTrigger value="oco">OCO</TabsTrigger>
                    </TabsList>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        {/* Common: Quantity */}
                        <div className="space-y-2">
                            <Label>Quantity ({symbol.split('/')[0]})</Label>
                            <div className="relative">
                                <Input 
                                    {...register('quantity')}
                                    type="number" 
                                    step="0.0001"
                                    placeholder="0.00"
                                    className="bg-zinc-900/50 border-zinc-800 focus:ring-emerald-500/20"
                                />
                                <div className="absolute right-3 top-2.5 text-xs text-zinc-500">
                                    {symbol.split('/')[0]}
                                </div>
                            </div>
                            {errors.quantity && <span className="text-xs text-rose-500">{errors.quantity.message}</span>}
                        </div>

                        {/* Conditional: Price */}
                        {orderType !== 'market' && (
                            <div className="space-y-2">
                                <Label>
                                    {orderType === 'stop_limit' ? 'Limit Price' : 'Price'} ({symbol.split('/')[1]})
                                </Label>
                                <Input 
                                    {...register('price')}
                                    type="number" 
                                    step="0.01"
                                    placeholder={currentPrice.toString()}
                                    className="bg-zinc-900/50 border-zinc-800"
                                />
                                {errors.price && <span className="text-xs text-rose-500">{errors.price.message}</span>}
                            </div>
                        )}

                        {/* Conditional: Stop Price */}
                        {(orderType === 'stop_limit' || orderType === 'oco') && (
                            <div className="space-y-2">
                                <Label>Stop Trigger ({symbol.split('/')[1]})</Label>
                                <Input 
                                    {...register('stop_price')}
                                    type="number" 
                                    step="0.01"
                                    placeholder={(currentPrice * 0.95).toString()}
                                    className="bg-zinc-900/50 border-zinc-800"
                                />
                                {errors.stop_price && <span className="text-xs text-rose-500">{errors.stop_price.message}</span>}
                            </div>
                        )}

                        {/* Conditional: OCO Limit (Take Profit) */}
                        {orderType === 'oco' && (
                            <div className="space-y-2">
                                <Label>Limit (Take Profit) ({symbol.split('/')[1]})</Label>
                                <Input 
                                    {...register('limit_price')}
                                    type="number" 
                                    step="0.01"
                                    placeholder={(currentPrice * 1.05).toString()}
                                    className="bg-zinc-900/50 border-zinc-800"
                                />
                                <span className="text-xs text-zinc-500">Price above is Stop Loss Limit</span>
                            </div>
                        )}

                        {/* Summary / Submit */}
                        <Button 
                            type="submit" 
                            className={`w-full mt-4 ${side === 'buy' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Placing Order...' : `${side === 'buy' ? 'Buy' : 'Sell'} ${symbol.split('/')[0]}`}
                        </Button>
                    </form>
                </Tabs>
            </CardContent>
        </Card>
    );
}
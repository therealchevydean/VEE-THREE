
import React, { useState, useEffect } from 'react';
import { ebayService } from '../services/ebayService';
import { EbayItem, EbayOrder, PricingStrategy } from '../types';
import { veeAgent } from '../services/veeAgentService';

// --- Icon Components ---
const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
);
const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" /></svg>
);

interface EbayDashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

const EbayDashboard: React.FC<EbayDashboardProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
    const [inventory, setInventory] = useState<EbayItem[]>([]);
    const [orders, setOrders] = useState<EbayOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // Config State
    const [selectedSku, setSelectedSku] = useState<string | null>(null);
    const [minPrice, setMinPrice] = useState<number>(0);
    const [maxPrice, setMaxPrice] = useState<number>(0);
    const [strategy, setStrategy] = useState<PricingStrategy>('fixed_margin');

    useEffect(() => {
        if (isOpen) {
            checkAuth();
            fetchData();
        }
    }, [isOpen]);

    const checkAuth = () => {
        setIsAuthenticated(ebayService.isAuthenticated());
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            if (ebayService.isAuthenticated()) {
                const items = await ebayService.getInventory();
                setInventory(items);
                const sales = await ebayService.getOrders();
                setOrders(sales);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRunReprice = () => {
        veeAgent.enqueue('ebay_reprice', {}, new Date().toISOString());
        alert('Repricing Job Queued.');
    };

    const handleConfigureRule = (item: EbayItem) => {
        setSelectedSku(item.sku);
        setMinPrice(item.pricingRule?.minPrice || item.currentPrice * 0.8);
        setMaxPrice(item.pricingRule?.maxPrice || item.currentPrice * 1.5);
        setStrategy(item.pricingRule?.strategy || 'fixed_margin');
    };

    const handleSaveRule = async () => {
        if (selectedSku) {
            await ebayService.updatePricingRule({
                sku: selectedSku,
                minPrice,
                maxPrice,
                strategy,
            });
            setSelectedSku(null);
            fetchData();
        }
    };

    if (!isOpen) return null;

    if (!isAuthenticated) {
        return (
            <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 max-w-md text-center" onClick={e => e.stopPropagation()}>
                    <h2 className="text-xl font-bold text-gray-100 mb-2">eBay Connection Required</h2>
                    <p className="text-gray-400 mb-4">VEE needs your eBay Developer Credentials to access Inventory and Orders.</p>
                    <p className="text-sm text-gray-500 mb-6">Go to Settings (Gear Icon) to configure.</p>
                    <button onClick={onClose} className="px-4 py-2 bg-indigo-600 rounded-md text-white hover:bg-indigo-500">Close</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700/50 rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <header className="flex items-center justify-between p-4 border-b border-gray-700/50 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-100">eBay Operations Center</h2>
                        <button onClick={fetchData} className="p-2 text-gray-400 hover:text-cyan-400 transition-colors" title="Refresh Data">
                            <RefreshIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleRunReprice}
                            className="px-3 py-1.5 bg-cyan-900/50 text-cyan-300 border border-cyan-700/50 rounded-md text-sm hover:bg-cyan-800/50 transition-colors"
                        >
                            Trigger Reprice Job
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex border-b border-gray-700/50">
                    <button 
                        onClick={() => setActiveTab('inventory')}
                        className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'inventory' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        Inventory & Pricing
                    </button>
                    <button 
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'orders' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        Orders & Fulfillment
                    </button>
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 bg-gray-900/50">
                    {activeTab === 'inventory' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-gray-800 text-gray-200 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">SKU</th>
                                        <th className="px-4 py-3">Title</th>
                                        <th className="px-4 py-3">Price</th>
                                        <th className="px-4 py-3">Qty</th>
                                        <th className="px-4 py-3">Strategy</th>
                                        <th className="px-4 py-3">Min/Max</th>
                                        <th className="px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/50">
                                    {inventory.map(item => (
                                        <tr key={item.sku} className="hover:bg-gray-800/50">
                                            <td className="px-4 py-3 font-mono text-xs">{item.sku}</td>
                                            <td className="px-4 py-3 max-w-xs truncate" title={item.title}>{item.title}</td>
                                            <td className="px-4 py-3 font-medium text-white">${item.currentPrice.toFixed(2)}</td>
                                            <td className="px-4 py-3">{item.quantity}</td>
                                            <td className="px-4 py-3">
                                                {item.pricingRule ? (
                                                    <span className="px-2 py-1 rounded-full text-xs bg-cyan-900/30 text-cyan-400 border border-cyan-800">
                                                        {item.pricingRule.strategy.replace('_', ' ')}
                                                    </span>
                                                ) : <span className="text-gray-600">-</span>}
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                {item.pricingRule ? `$${item.pricingRule.minPrice} - $${item.pricingRule.maxPrice}` : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button 
                                                    onClick={() => handleConfigureRule(item)}
                                                    className="text-indigo-400 hover:text-indigo-300 font-medium"
                                                >
                                                    Configure
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="space-y-3">
                            {orders.map(order => (
                                <div key={order.orderId} className="bg-gray-800 border border-gray-700/50 rounded-lg p-4 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-xs text-gray-500">{order.orderId}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${order.status === 'Shipped' ? 'bg-green-900/30 border-green-800 text-green-400' : 'bg-yellow-900/30 border-yellow-800 text-yellow-400'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-300">
                                            {order.items.map((i, idx) => (
                                                <div key={idx}>{i.qty}x {i.title}</div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-white">${order.total.toFixed(2)}</div>
                                        <div className="text-xs text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
                
                {/* Modal for Rule Config */}
                {selectedSku && (
                    <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                        <div className="bg-gray-900 border border-gray-600 rounded-lg p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
                            <h3 className="text-lg font-bold text-white mb-4">Configure Repricing: {selectedSku}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase mb-1">Strategy</label>
                                    <select 
                                        value={strategy} 
                                        onChange={e => setStrategy(e.target.value as PricingStrategy)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                                    >
                                        <option value="fixed_margin">Fixed Margin</option>
                                        <option value="match_lowest">Match Lowest Price</option>
                                        <option value="undercut_competitor">Undercut Competitor</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 uppercase mb-1">Min Floor ($)</label>
                                        <input 
                                            type="number" 
                                            value={minPrice} 
                                            onChange={e => setMinPrice(Number(e.target.value))}
                                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 uppercase mb-1">Max Ceiling ($)</label>
                                        <input 
                                            type="number" 
                                            value={maxPrice} 
                                            onChange={e => setMaxPrice(Number(e.target.value))}
                                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" 
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex gap-2">
                                <button onClick={() => setSelectedSku(null)} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm">Cancel</button>
                                <button onClick={handleSaveRule} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-white text-sm font-semibold">Save Rule</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EbayDashboard;

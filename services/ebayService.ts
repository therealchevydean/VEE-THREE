
import { EbayItem, EbayOrder, PricingRule } from '../types';
import { getManualToken } from './authService';

/**
 * =================================================================
 * EBAY SERVICE WRAPPER (SIMULATION)
 * =================================================================
 * 
 * In the production architecture, this service wraps the eBay Sell APIs:
 * 1. Inventory API (Manage SKUs, Prices)
 * 2. Fulfillment API (Get Orders, ship)
 * 3. Account API (Policies)
 * 
 * Currently simulates these calls using localStorage as a DB.
 */

const INVENTORY_KEY = 'ebay_inventory_mock';
const ORDERS_KEY = 'ebay_orders_mock';

// --- MOCK DATA GENERATORS ---
const generateMockInventory = (): EbayItem[] => [
    { sku: 'V3-ART-001', title: 'V3 Original Canvas - "Chaos"', currentPrice: 150.00, quantity: 1, status: 'Active', views: 45, pricingRule: { sku: 'V3-ART-001', minPrice: 100, maxPrice: 300, strategy: 'fixed_margin' } },
    { sku: 'V3-BIO-CHAR', title: 'Activated Biochar - 5lb Bag', currentPrice: 24.99, quantity: 50, status: 'Active', views: 120, pricingRule: { sku: 'V3-BIO-CHAR', minPrice: 19.99, maxPrice: 35.00, strategy: 'undercut_competitor' } },
    { sku: 'V3-TSHIRT-L', title: 'V3 Logo Tee - Large', currentPrice: 29.99, quantity: 20, status: 'Active', views: 8, pricingRule: { sku: 'V3-TSHIRT-L', minPrice: 25.00, maxPrice: 40.00, strategy: 'match_lowest' } },
    { sku: 'TF-NFT-PHY', title: 'Tokin Franks Physical Print #42', currentPrice: 50.00, quantity: 0, status: 'Ended', views: 200 }
];

const generateMockOrders = (): EbayOrder[] => [
    { orderId: '20-12345-67890', buyer: 'jane_doe_collector', total: 24.99, status: 'Paid', orderDate: new Date().toISOString(), items: [{ sku: 'V3-BIO-CHAR', title: 'Activated Biochar', qty: 1 }] },
    { orderId: '19-54321-09876', buyer: 'art_flipper_99', total: 150.00, status: 'Shipped', orderDate: new Date(Date.now() - 86400000).toISOString(), items: [{ sku: 'V3-ART-001', title: 'V3 Original Canvas', qty: 1 }] }
];

// --- HELPER TO LOAD/SAVE ---
const loadInventory = (): EbayItem[] => {
    const stored = localStorage.getItem(INVENTORY_KEY);
    return stored ? JSON.parse(stored) : generateMockInventory();
}

const saveInventory = (items: EbayItem[]) => {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(items));
}

const loadOrders = (): EbayOrder[] => {
    const stored = localStorage.getItem(ORDERS_KEY);
    return stored ? JSON.parse(stored) : generateMockOrders();
}

export const ebayService = {

    /**
     * Checks if credentials exist.
     */
    isAuthenticated: (): boolean => {
        return !!getManualToken('ebay_app_id');
    },

    /**
     * Fetches current inventory (Simulates eBay Inventory API GET /inventory_item).
     */
    getInventory: async (): Promise<EbayItem[]> => {
        // PRODUCTION: await fetch('https://api.ebay.com/sell/inventory/v1/inventory_item', headers...);
        console.log('[EbayService] Fetching inventory...');
        await new Promise(resolve => setTimeout(resolve, 800)); // Latency
        return loadInventory();
    },

    /**
     * Fetches orders (Simulates eBay Fulfillment API GET /order).
     */
    getOrders: async (): Promise<EbayOrder[]> => {
        // PRODUCTION: await fetch('https://api.ebay.com/sell/fulfillment/v1/order', headers...);
        console.log('[EbayService] Fetching orders...');
        await new Promise(resolve => setTimeout(resolve, 800));
        return loadOrders();
    },

    /**
     * Updates the price of an item (Simulates eBay Inventory API).
     */
    updatePrice: async (sku: string, newPrice: number): Promise<void> => {
        // PRODUCTION: await fetch(`https://api.ebay.com/sell/inventory/v1/offer/${offerId}`, { price: newPrice }...);
        console.log(`[EbayService] Updating price for ${sku} to $${newPrice}`);
        const items = loadInventory();
        const item = items.find(i => i.sku === sku);
        if (item) {
            item.currentPrice = newPrice;
            saveInventory(items);
        }
    },

    /**
     * Updates the pricing rules for an item (Local Logic).
     */
    updatePricingRule: async (rule: PricingRule): Promise<void> => {
        const items = loadInventory();
        const item = items.find(i => i.sku === rule.sku);
        if (item) {
            item.pricingRule = rule;
            saveInventory(items);
        }
    },

    /**
     * Creates a new listing draft (Simulates eBay Inventory API PUT /inventory_item).
     */
    createDraft: async (draft: Partial<EbayItem>): Promise<string> => {
        console.log(`[EbayService] Creating draft: ${draft.title}`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const newItem: EbayItem = {
            sku: draft.sku || `SKU-${Date.now()}`,
            title: draft.title || 'Untitled Draft',
            currentPrice: draft.currentPrice || 0,
            quantity: draft.quantity || 1,
            status: 'Draft',
            views: 0
        };
        
        const items = loadInventory();
        items.unshift(newItem);
        saveInventory(items);
        
        return newItem.sku;
    }
};

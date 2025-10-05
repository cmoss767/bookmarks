import { Platform } from 'react-native';
import RNIap, {
  purchaseUpdatedListener,
  purchaseErrorListener,
  type Product,
  type Purchase,
  type Subscription,
  finishTransaction,
  getProducts,
  requestPurchase,
  getSubscriptions,
  validateReceiptIos,
  validateReceiptAndroid,
  type PurchaseError,
} from 'react-native-iap';

import { APP_CONFIG } from '../config/app';

// Product IDs for iOS App Store
const PRODUCT_IDS = {
  ios: [APP_CONFIG.SUBSCRIPTION.productId],
  android: [APP_CONFIG.SUBSCRIPTION.productId],
};

// Subscription configuration
export const SUBSCRIPTION_CONFIG = {
  productId: APP_CONFIG.SUBSCRIPTION.productId,
  price: APP_CONFIG.SUBSCRIPTION.price,
  duration: APP_CONFIG.SUBSCRIPTION.duration,
  features: [
    'Unlimited bookmarks',
    'Advanced organization',
    'Priority support',
    'Future premium features',
  ],
};

class StoreKitService {
  private purchaseUpdateSubscription: any = null;
  private purchaseErrorSubscription: any = null;
  private products: Product[] = [];
  private subscriptions: Subscription[] = [];
  private onPurchaseSuccessCallback: ((purchase: Purchase) => void) | null = null;
  private onPurchaseErrorCallback: ((error: PurchaseError) => void) | null = null;

  async initialize(): Promise<void> {
    try {
      // Initialize the service
      await RNIap.initConnection();
      
      // Set up purchase listeners
      this.setupPurchaseListeners();
      
      // Load products
      await this.loadProducts();
      
      console.log('StoreKit service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize StoreKit service:', error);
      throw error;
    }
  }

  private setupPurchaseListeners(): void {
    // Listen for successful purchases
    this.purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: Purchase) => {
        console.log('Purchase successful:', purchase);
        
        try {
          // Validate the purchase
          const isValid = await this.validatePurchase(purchase);
          
          if (isValid) {
            // Finish the transaction
            await finishTransaction({ purchase, isConsumable: false });
            
            // Notify the app that subscription is active
            this.onPurchaseSuccess(purchase);
          } else {
            console.error('Purchase validation failed');
            await finishTransaction({ purchase, isConsumable: false });
          }
        } catch (error) {
          console.error('Error processing purchase:', error);
          await finishTransaction({ purchase, isConsumable: false });
        }
      }
    );

    // Listen for purchase errors
    this.purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        console.error('Purchase error:', error);
        this.onPurchaseError(error);
      }
    );
  }

  private async loadProducts(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        this.subscriptions = await getSubscriptions({ skus: PRODUCT_IDS.ios });
        this.products = this.subscriptions;
      } else {
        this.products = await getProducts({ skus: PRODUCT_IDS.android });
      }
      
      console.log('Loaded products:', this.products);
    } catch (error) {
      console.error('Failed to load products:', error);
      throw error;
    }
  }

  private async validatePurchase(purchase: Purchase): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const receiptBody = {
          'receipt-data': purchase.transactionReceipt,
          'password': process.env.IOS_APP_STORE_SHARED_SECRET || '', // You'll need to set this
        };
        
        const result = await validateReceiptIos(receiptBody, false);
        return result && result.status === 0;
      } else {
        const result = await validateReceiptAndroid(
          {
            packageName: 'com.chrismoss.markd',
            productId: purchase.productId,
            purchaseToken: purchase.purchaseToken,
          },
          false
        );
        return result && result.isValid;
      }
    } catch (error) {
      console.error('Purchase validation error:', error);
      return false;
    }
  }

  private onPurchaseSuccess(purchase: Purchase): void {
    console.log('Purchase successful, subscription activated');
    if (this.onPurchaseSuccessCallback) {
      this.onPurchaseSuccessCallback(purchase);
    }
  }

  private onPurchaseError(error: PurchaseError): void {
    console.error('Purchase failed:', error);
    if (this.onPurchaseErrorCallback) {
      this.onPurchaseErrorCallback(error);
    }
  }

  setPurchaseCallbacks(
    onSuccess: (purchase: Purchase) => void,
    onError: (error: PurchaseError) => void
  ): void {
    this.onPurchaseSuccessCallback = onSuccess;
    this.onPurchaseErrorCallback = onError;
  }

  async getAvailableProducts(): Promise<Product[]> {
    return this.products;
  }

  async getAvailableSubscriptions(): Promise<Subscription[]> {
    return this.subscriptions;
  }

  async purchaseSubscription(productId: string): Promise<void> {
    try {
      await requestPurchase({ sku: productId });
    } catch (error) {
      console.error('Failed to initiate purchase:', error);
      throw error;
    }
  }

  async restorePurchases(): Promise<Purchase[]> {
    try {
      const purchases = await RNIap.getAvailablePurchases();
      console.log('Restored purchases:', purchases);
      return purchases;
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
      this.purchaseUpdateSubscription = null;
    }
    
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
      this.purchaseErrorSubscription = null;
    }
    
    await RNIap.endConnection();
  }
}

// Export singleton instance
export const storeKitService = new StoreKitService();

// Export types for use in other files
export type { Product, Purchase, Subscription, PurchaseError };
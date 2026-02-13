export enum ShopPlan {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export enum ShopStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export interface Shop {
  shopId: string;
  name: string;
  slug: string;
  phone: string;
  email: string;
  plan: ShopPlan;
  status: ShopStatus;
  subscriptionStart?: string;
  subscriptionEnd?: string;
}

export interface CreateShopRequest {
  name: string;
  slug: string;
  phone: string;
  email: string;
  plan: ShopPlan;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
}

export interface UpdateShopRequest {
  name?: string;
  phone?: string;
  plan?: ShopPlan;
}

export interface UpdateShopStatusRequest {
  status: ShopStatus;
}

export interface Menu {
  id: number;
  dishes: string[];
  image?: string;
}

export interface MenuApiResponse {
  success: boolean;
  data?: Menu;
  error?: string;
}

export interface MenuCardTranslations {
  menuLabel: string;
  dishesLabel: string;
  shareButtonText: string;
  linkCopied: string;
}

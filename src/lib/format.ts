const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const money = (value: number) => brl.format(value);

export const discountPercent = (price: number, oldPrice: number) =>
  oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;

export const MAX_INSTALLMENTS = 10;
export const installment = (price: number) => Math.round((price / MAX_INSTALLMENTS) * 100) / 100;

export const normalizeText = (value: string) =>
  value
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

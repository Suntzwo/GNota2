
export interface IncidentTax {
    id: string;
    name: string;
    percentage: number;
}

export interface RefTableItem {
    id: string;
    code: string;
    type: string;
    baseValue: number;
    value: number; // baseValue + incidentTaxes
}

export interface Act {
    id:string;
    date: string; // YYYY-MM-DD
    lot: string;
    actId: string; // Reference to RefTableItem id
    type: string;
    quantity: number;
    unitValue: number;
    totalValue: number;
}

export interface Expense {
    id: string;
    date: string; // YYYY-MM-DD
    type: string;
    subtype?: string;
    description: string;
    value: number;
    refMonth: number;
    refYear: number;
}

export interface AppState {
    serventia: string;
    acts: Act[];
    expenses: Expense[];
    refTable: RefTableItem[];
    lastLot: string;
    incidentTaxes: IncidentTax[];
}

export type View = 'dashboard' | 'registration' | 'reports' | 'financial' | 'tables';

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error';
}

export interface ModalInfo {
    title: string;
    message: string;
    onConfirm: () => void | boolean;
}

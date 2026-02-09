
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, View, Toast, ModalInfo } from './types';
import { useLocalStorage } from '.C:\Users\User\Desktop\GESTAONOTARIAL\hooks';
import { getInitialData } from './services/dataService';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Registration from './components/Registration';
import Reports from './components/Reports';
import Financial from './components/Financial';
import Tables from './components/Tables';
import ToastNotification from './components/ToastNotification';
import Modal from './components/Modal';


const App: React.FC = () => {
    const [appState, setAppState] = useLocalStorage<AppState>('notary_app_state', getInitialData());
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [toast, setToast] = useState<Toast | null>(null);
    const [modal, setModal] = useState<ModalInfo | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ id: Date.now(), message, type });
    };

    const showModal = (title: string, message: string, onConfirm: () => void | boolean) => {
        setModal({ title, message, onConfirm });
    };

    const closeModal = () => {
        setModal(null);
    };

    useEffect(() => {
        // Migration effect for existing users
        const migrateState = (prevState: AppState): AppState => {
            let needsUpdate = false;
            const newState = { ...prevState };

            // 1. Add incidentTaxes if it doesn't exist
            if (!newState.incidentTaxes) {
                newState.incidentTaxes = [];
                needsUpdate = true;
                console.log("Migrating state: Added incidentTaxes array.");
            }

            // 2. Add baseValue to refTable items if missing
            const tableNeedsMigration = newState.refTable.some(item => typeof item.baseValue === 'undefined');
            if (tableNeedsMigration) {
                newState.refTable = newState.refTable.map(item => ({
                    ...item,
                    baseValue: typeof item.baseValue !== 'undefined' ? item.baseValue : item.value,
                }));
                needsUpdate = true;
                console.log("Migrating state: Added baseValue to refTable items.");
            }
             // 3. Update refTable values from seed data if needed
            const newSeedTable = getInitialData().refTable;
            const aberturaDeFirmaItem = newState.refTable.find(item => item.code === "01");
            if (!aberturaDeFirmaItem || (aberturaDeFirmaItem && aberturaDeFirmaItem.baseValue !== 12.80)) {
                 console.log('Updating reference table to new values...');
                 // This is tricky. We want to update baseValues but keep existing IDs
                 const updatedTable = newSeedTable.map(seedItem => {
                    const existingItem = newState.refTable.find(oldItem => oldItem.code === seedItem.code);
                    return existingItem ? { ...seedItem, id: existingItem.id } : seedItem;
                 });

                 // Recalculate values with existing taxes
                const recalculatedTable = updatedTable.map(item => {
                    let calculatedValue = item.baseValue;
                    (newState.incidentTaxes || []).forEach(tax => {
                        calculatedValue *= (1 + tax.percentage / 100);
                    });
                    return { ...item, value: calculatedValue };
                });

                newState.refTable = recalculatedTable;
                needsUpdate = true;
                showToast('Tabela de emolumentos foi atualizada!', 'success');
            }


            if (needsUpdate) {
                setAppState(newState);
            }
            return newState;
        };
        
        // We pass the state to the migration function
        migrateState(appState);

    }, []);

    const renderView = () => {
        const commonProps = { appState, setAppState, showToast, showModal };
        switch (activeView) {
            case 'dashboard':
                return <Dashboard {...commonProps} />;
            case 'registration':
                return <Registration {...commonProps} />;
            case 'reports':
                return <Reports {...commonProps} setActiveView={setActiveView} />;
            case 'financial':
                return <Financial {...commonProps} setActiveView={setActiveView} />;
            case 'tables':
                return <Tables {...commonProps} setActiveView={setActiveView} />;
            default:
                return <Dashboard {...commonProps} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-800">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <main className="flex-1 ml-24 p-4 md:p-8">
                 <div className="bg-white p-6 rounded-xl shadow-sm w-full max-w-4xl border border-slate-200 mx-auto">
                    {toast && <ToastNotification toast={toast} onClose={() => setToast(null)} />}
                    {renderView()}
                </div>
            </main>
            {modal && <Modal {...modal} onClose={closeModal} />}
            <footer className="fixed bottom-0 left-0 w-full bg-white p-1 text-center text-xs text-slate-400 border-t border-slate-200 z-10 no-print">
                <span>3.5.0</span>
            </footer>
        </div>
    );
};

export default App;
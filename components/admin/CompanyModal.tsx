import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { PlanType, Client } from '../../types';
import { PLANS, PLAN_TYPES } from '../../lib/plans';

interface CompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: Client | null;
    isEditing?: boolean;
}

const CompanyModal: React.FC<CompanyModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isEditing = false
}) => {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        email: '',
        password: '',
        plan: 'pro' as PlanType,
        maxProfiles: 3,
        isActive: true
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name,
                    slug: initialData.slug,
                    email: initialData.email || '',
                    password: '', // Password stays empty unless changed during edit
                    plan: initialData.plan,
                    maxProfiles: initialData.maxProfiles,
                    isActive: initialData.isActive
                });
            } else {
                setFormData({
                    name: '',
                    slug: '',
                    email: '',
                    password: '',
                    plan: 'pro' as PlanType,
                    maxProfiles: 3,
                    isActive: true
                });
            }
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error("Error submitting company modal:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300">
            <div className="bg-zinc-900 border border-white/10 w-full max-w-xl rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    type="button"
                    className="absolute top-6 right-6 sm:top-8 sm:right-8 p-2 text-zinc-500 hover:text-white transition-all bg-white/5 rounded-full"
                >
                    <X size={20} />
                </button>

                <form onSubmit={handleSubmit} className="p-6 sm:p-12 space-y-6 sm:space-y-8">
                    <div className="space-y-2 sm:space-y-3">
                        <div className="inline-flex bg-blue-500/10 text-blue-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-500/20">
                            Client Provisioning
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tighter">
                            {isEditing ? 'Master Edit' : 'Nova Company'}
                        </h2>
                        <p className="text-zinc-500 text-xs sm:text-sm">Defina credenciais de rede e limites operacionais.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Nome da Organização</label>
                            <input
                                type="text"
                                required
                                placeholder="Ex: Agência Premium"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold focus:border-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">E-mail de Login</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="email@empresa.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Senha (Access Token)</label>
                                <input
                                    type="text"
                                    required={!isEditing}
                                    placeholder={isEditing ? "Preencha apenas para alterar" : "Crie uma senha forte"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm font-mono focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Nível de Serviço</label>
                                <div className="relative">
                                    <select
                                        value={formData.plan}
                                        onChange={(e) => {
                                            const newPlanId = e.target.value as PlanType;
                                            const newPlan = PLANS[newPlanId];
                                            setFormData({ ...formData, plan: newPlanId, maxProfiles: newPlan.maxProfiles });
                                        }}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold outline-none appearance-none cursor-pointer"
                                    >
                                        {PLAN_TYPES.map(planId => (
                                            <option key={planId} value={planId}>{PLANS[planId].name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500" size={16} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Limite de Perfis (Slots)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.maxProfiles}
                                    onChange={(e) => setFormData({ ...formData, maxProfiles: parseInt(e.target.value) })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-white text-black py-5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-xl disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
                        ) : (
                            isEditing ? 'Atualizar Infraestrutura' : 'Finalizar Provisionamento'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CompanyModal;

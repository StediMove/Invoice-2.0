"use client";

import { ArrowRight, Bot, Check, ChevronDown, Users, FileText } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;

            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface Customer {
    id: string;
    name: string;
    company_name?: string;
    email?: string;
    address?: string;
    city?: string;
    country?: string;
    postal_code?: string;
    preferred_currency: string;
    default_tax_rate: number;
    payment_terms: number;
}

interface Template {
    id: string;
    name: string;
    description?: string;
    template_data?: any;
}

interface AI_PromptProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    customers: Customer[];
    templates: Template[];
    selectedCustomer: Customer | null;
    selectedTemplate: Template | null;
    onCustomerChange: (customer: Customer | null) => void;
    onTemplateChange: (template: Template | null) => void;
    disabled?: boolean;
    loading?: boolean;
    placeholder?: string;
}

export function AI_Prompt({
    value,
    onChange,
    onSubmit,
    customers,
    templates,
    selectedCustomer,
    selectedTemplate,
    onCustomerChange,
    onTemplateChange,
    disabled = false,
    loading = false,
    placeholder = `Describe your invoice in any language - examples:
English: Invoice for website design services, $1500
Danish: Faktura for bilvask service, 500 DKK
German: Rechnung für Webdesign, €1,200
Spanish: Factura para servicio de consultoría, $800`
}: AI_PromptProps) {
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 72,
        maxHeight: 300,
    });

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey && value.trim()) {
            e.preventDefault();
            onChange("");
            adjustHeight(true);
            onSubmit();
        }
    };

    return (
        <div className="w-full py-4">
            <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-1.5">
                <div className="relative">
                    <div className="relative flex flex-col">
                        <div
                            className="overflow-y-auto"
                            style={{ maxHeight: "400px" }}
                        >
                            <Textarea
                                id="ai-input-15"
                                value={value}
                                placeholder={placeholder}
                                className={cn(
                                    "w-full rounded-xl rounded-b-none px-4 py-3 bg-black/5 dark:bg-white/5 border-none dark:text-white placeholder:text-black/70 dark:placeholder:text-white/70 resize-none focus-visible:ring-0 focus-visible:ring-offset-0",
                                    "min-h-[72px]"
                                )}
                                ref={textareaRef}
                                onKeyDown={handleKeyDown}
                                onChange={(e) => {
                                    onChange(e.target.value);
                                    adjustHeight();
                                }}
                                disabled={disabled}
                            />
                        </div>

                        <div className="h-14 bg-black/5 dark:bg-white/5 rounded-b-xl flex items-center">
                            <div className="absolute left-3 right-3 bottom-3 flex items-center justify-between w-[calc(100%-24px)]">
                                <div className="flex items-center gap-2">
                                    {/* Customer Selection */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="flex items-center gap-1 h-8 pl-1 pr-2 text-xs rounded-md dark:text-white hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500"
                                            >
                                                <AnimatePresence mode="wait">
                                                    <motion.div
                                                        key={selectedCustomer?.id || 'no-customer'}
                                                        initial={{
                                                            opacity: 0,
                                                            y: -5,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            y: 5,
                                                        }}
                                                        transition={{
                                                            duration: 0.15,
                                                        }}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Users className="w-3 h-3" />
                                                        {selectedCustomer 
                                                            ? (selectedCustomer.company_name || selectedCustomer.name)
                                                            : "Select Customer"
                                                        }
                                                        <ChevronDown className="w-3 h-3 opacity-50" />
                                                    </motion.div>
                                                </AnimatePresence>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            className={cn(
                                                "min-w-[12rem]",
                                                "border-black/10 dark:border-white/10",
                                                "bg-gradient-to-b from-white via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800"
                                            )}
                                        >
                                            <DropdownMenuItem
                                                onSelect={() => onCustomerChange(null)}
                                                className="flex items-center justify-between gap-2"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 opacity-50" />
                                                    <span>No Customer</span>
                                                </div>
                                                {!selectedCustomer && (
                                                    <Check className="w-4 h-4 text-blue-500" />
                                                )}
                                            </DropdownMenuItem>
                                            {customers.map((customer) => (
                                                <DropdownMenuItem
                                                    key={customer.id}
                                                    onSelect={() => onCustomerChange(customer)}
                                                    className="flex items-center justify-between gap-2"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 opacity-50" />
                                                        <div className="flex flex-col">
                                                            <span>{customer.company_name || customer.name}</span>
                                                            {customer.company_name && (
                                                                <span className="text-xs opacity-70">{customer.name}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {selectedCustomer?.id === customer.id && (
                                                        <Check className="w-4 h-4 text-blue-500" />
                                                    )}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-0.5" />

                                    {/* Template Selection */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="flex items-center gap-1 h-8 pl-1 pr-2 text-xs rounded-md dark:text-white hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500"
                                            >
                                                <AnimatePresence mode="wait">
                                                    <motion.div
                                                        key={selectedTemplate?.id || 'no-template'}
                                                        initial={{
                                                            opacity: 0,
                                                            y: -5,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            y: 5,
                                                        }}
                                                        transition={{
                                                            duration: 0.15,
                                                        }}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <FileText className="w-3 h-3" />
                                                        {selectedTemplate 
                                                            ? selectedTemplate.name
                                                            : "Select Template"
                                                        }
                                                        <ChevronDown className="w-3 h-3 opacity-50" />
                                                    </motion.div>
                                                </AnimatePresence>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            className={cn(
                                                "min-w-[12rem]",
                                                "border-black/10 dark:border-white/10",
                                                "bg-gradient-to-b from-white via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800"
                                            )}
                                        >
                                            <DropdownMenuItem
                                                onSelect={() => onTemplateChange(null)}
                                                className="flex items-center justify-between gap-2"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 opacity-50" />
                                                    <span>Default Template</span>
                                                </div>
                                                {!selectedTemplate && (
                                                    <Check className="w-4 h-4 text-blue-500" />
                                                )}
                                            </DropdownMenuItem>
                                            {templates.map((template) => (
                                                <DropdownMenuItem
                                                    key={template.id}
                                                    onSelect={() => onTemplateChange(template)}
                                                    className="flex items-center justify-between gap-2"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 opacity-50" />
                                                        <div className="flex flex-col">
                                                            <span>{template.name}</span>
                                                            {template.description && (
                                                                <span className="text-xs opacity-70">{template.description}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {selectedTemplate?.id === template.id && (
                                                        <Check className="w-4 h-4 text-blue-500" />
                                                    )}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-0.5" />
                                </div>
                                <button
                                    type="button"
                                    className={cn(
                                        "rounded-lg p-2 bg-black/5 dark:bg-white/5",
                                        "hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500"
                                    )}
                                    aria-label="Send message"
                                    disabled={!value.trim() || disabled || loading}
                                    onClick={() => {
                                        if (!value.trim()) return;
                                        onChange("");
                                        adjustHeight(true);
                                        onSubmit();
                                    }}
                                >
                                    <ArrowRight
                                        className={cn(
                                            "w-4 h-4 dark:text-white transition-opacity duration-200",
                                            value.trim() && !disabled && !loading
                                                ? "opacity-100"
                                                : "opacity-30"
                                        )}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
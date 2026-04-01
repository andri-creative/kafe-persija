"use client";

import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { CategoryOption } from "../types";

interface ProductFieldWrapperProps {
  label?: string;
  required?: boolean;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function ProductFieldWrapper({
  label,
  required,
  description,
  children,
  className = "",
}: ProductFieldWrapperProps) {
  return (
    <Field className={className}>
      {label && (
        <FieldLabel className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1 mb-1.5">
          {label}
          {required && <span className="text-red-500 font-black">*</span>}
        </FieldLabel>
      )}
      {children}
      {description && (
        <FieldDescription className="text-[10px] text-slate-400 italic mt-1">
          {description}
        </FieldDescription>
      )}
    </Field>
  );
}

interface ProductInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  description?: string;
  leftIcon?: ReactNode;
}

export function ProductInputField({ label, required, description, leftIcon, ...props }: ProductInputProps) {
  return (
    <ProductFieldWrapper label={label} required={required} description={description}>
      <div className="relative group">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            {leftIcon}
          </div>
        )}
        <Input
          {...props}
          className={`h-9 text-xs border-slate-200 focus:border-indigo-500 transition-all rounded-lg shadow-sm font-medium ${leftIcon ? "pl-9" : ""} ${props.className || ""}`}
        />
      </div>
    </ProductFieldWrapper>
  );
}

interface ProductTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  description?: string;
}

export function ProductTextareaField({ label, required, description, ...props }: ProductTextareaProps) {
  return (
    <ProductFieldWrapper label={label} required={required} description={description}>
      <Textarea
        {...props}
        className={`text-xs border-slate-200 focus:border-indigo-500 transition-all rounded-lg shadow-sm font-medium ${props.className || ""}`}
      />
    </ProductFieldWrapper>
  );
}

interface ProductSelectProps {
  label?: string;
  required?: boolean;
  value: string;
  onValueChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ProductSelectField({
  label,
  required,
  value,
  onValueChange,
  options,
  placeholder = "Pilih...",
  disabled,
  className = "",
}: ProductSelectProps) {
  return (
    <ProductFieldWrapper label={label} required={required} className={className}>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="h-9 text-xs border-slate-200 focus:border-indigo-500 transition-all rounded-lg shadow-sm font-medium bg-white">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-xl shadow-xl border-slate-100">
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs font-medium">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </ProductFieldWrapper>
  );
}

interface ProductCategoryMultiSelectProps {
  label?: string;
  required?: boolean;
  selectedCategories: string[];
  toggleCategory: (name: string) => void;
  categoriesList: CategoryOption[];
  disabled?: boolean;
}

export function ProductCategoryMultiSelect({
  label,
  required,
  selectedCategories,
  toggleCategory,
  categoriesList,
  disabled,
}: ProductCategoryMultiSelectProps) {
  return (
    <ProductFieldWrapper label={label} required={required}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className="w-full justify-between font-medium h-9 text-xs border-slate-200 hover:bg-slate-50 transition-all rounded-lg shadow-sm bg-white"
          >
            {selectedCategories.length > 0
              ? selectedCategories.join(", ")
              : "Pilih kategori"}
            <ChevronDown className="h-3.5 w-3.5 opacity-50 text-indigo-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[220px] rounded-xl shadow-xl p-1 border-slate-100">
          <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 p-2 tracking-widest">Kategori Produk</DropdownMenuLabel>
          <DropdownMenuSeparator className="mx-1" />
          <div className="max-h-[250px] overflow-y-auto">
            {categoriesList.map((category) => (
              <DropdownMenuCheckboxItem
                key={category.id}
                checked={selectedCategories.includes(category.name)}
                onCheckedChange={() => toggleCategory(category.name)}
                className="text-xs rounded-lg mx-1 font-medium"
              >
                {category.name}
              </DropdownMenuCheckboxItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </ProductFieldWrapper>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Download,
    Calendar,
    Filter,
    FileBarChart,
    Printer,
    Clock,
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Tag,
    ChevronDown,
    Search,
    RefreshCcw,
    FileText,
    Percent
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

// Import jsPDF core and autoTable plugin
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Import XLSX for Excel Export
import * as XLSX from "xlsx";

// No dummy data needed, using real API

export default function SalesReportsPage() {
    const [isMounted, setIsMounted] = useState(false);

    // Default ke TANGGAL HARI INI
    const today = new Date().toLocaleDateString("en-CA");
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMethod, setSelectedMethod] = useState("ALL");
    const [isExporting, setIsExporting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20; // Show more per page for real data
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/sales-reports?startDate=${startDate}&endDate=${endDate}`);
            if (!response.ok) throw new Error("Failed to fetch");
            const json = await response.json();
            setData(json);
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Gagal memuat data dari server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setIsMounted(true);
        fetchData();
    }, [startDate, endDate]);

    // --- LOGIC: FILTERING DATA (Search & Method) ---
    const filteredData = data
        .filter(item => {
            const matchesSearch = item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesMethod = selectedMethod === "ALL" || item.method === selectedMethod;

            return matchesSearch && matchesMethod;
        })
        .sort((a, b) => b.id.localeCompare(a.id)); // Newest first

    const totalGrossSales = filteredData.reduce((acc, curr) => acc + (curr.total + (curr.discount || 0) + (curr.promo || 0)), 0);
    const totalDiscount = filteredData.reduce((acc, curr) => acc + (curr.discount || 0), 0);
    const totalPromo = filteredData.reduce((acc, curr) => acc + (curr.promo || 0), 0);
    const orderCount = filteredData.length;
    const totalItemsSold = filteredData.reduce((acc, curr) => acc + (curr.items || 0), 0);
    const nettRevenue = totalGrossSales - totalDiscount - totalPromo;
    const finalNettProfit = nettRevenue;

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Effective Rates for KPIs
    const effectiveDiscountRate = totalGrossSales > 0 ? Math.round((totalDiscount / totalGrossSales) * 100) : 0;
    const effectivePromoRate = totalGrossSales > 0 ? Math.round((totalPromo / totalGrossSales) * 100) : 0;

    // Helper for safe currency formatting to avoid hydration mismatch
    const formatIDR = (val: number) => {
        if (!isMounted) return "...";
        return val.toLocaleString("id-ID");
    };

    // --- LOGIC: DOWNLOAD PDF (Strictly Filtered) ---
    const handleDownloadPDF = () => {
        try {
            if (!filteredData || filteredData.length === 0) {
                toast.error("Tidak ada data untuk periode ini. Silakan ganti filter tanggal.");
                return;
            }

            setIsExporting(true);
            const doc = new jsPDF();
            const now = new Date();
            const dateStr = now.toLocaleDateString("id-ID", {
                day: "2-digit", month: "long", year: "numeric",
            });
            const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

            // 1. Header (Minimalist & Clean)
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(30, 30, 30);
            doc.text("PERSIJA CAFE", 15, 20);

            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 53, 53);
            doc.text("Revenue & Sales Report", 15, 28);

            doc.setDrawColor(220, 220, 220);
            doc.line(15, 34, 195, 34);

            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.setFont("helvetica", "normal");
            doc.text(`Dicetak: ${dateStr} ${timeStr}`, 145, 28);

            // 2. Report Info
            doc.setTextColor(40, 40, 40);
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Ringkasan Laporan", 15, 50);

            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 100, 100);
            doc.text(`Periode : ${startDate} s/d ${endDate}`, 15, 57);

            // 3. KPI Table
            autoTable(doc, {
                startY: 70,
                head: [["Total Pendapatan", "Total Order", "Total Diskon", "Total Promo", "Nett Profit"]],
                body: [[
                    `Rp ${formatIDR(totalGrossSales)}`,
                    `${orderCount || 0} Orders`,
                    `Rp ${formatIDR(totalDiscount)}`,
                    `Rp ${formatIDR(totalPromo)}`,
                    `Rp ${formatIDR(finalNettProfit)}`
                ]],
                theme: "grid",
                styles: { fontSize: 10, cellPadding: 5, halign: "center", fontStyle: "bold" },
                headStyles: { fillColor: [250, 250, 250], textColor: [100, 100, 100] }
            });

            // 4. Data Table
            const finalY = (doc as any).lastAutoTable.finalY + 15;
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(40, 40, 40);
            doc.text("Rincian Transaksi", 15, finalY);

            const tableData = filteredData.map((item, idx) => [
                idx + 1,
                item.id,
                item.time,
                item.date,
                item.customer,
                item.items || 0,
                `Rp ${formatIDR(item.total + (item.discount || 0) + (item.promo || 0))}`,
                item.discount > 0 ? `${Math.round((item.discount / (item.total + item.discount + item.promo)) * 100)}% (Rp ${formatIDR(item.discount)})` : "-",
                item.promo > 0 ? `${Math.round((item.promo / (item.total + item.discount + item.promo)) * 100)}% (Rp ${formatIDR(item.promo)})` : "-",
                item.method,
                item.status
            ]);

            autoTable(doc, {
                startY: finalY + 10,
                head: [["NO", "ID TRANSAKSI", "JAM", "TANGGAL", "CUSTOMER", "QTY", "GROSS", "DISKON", "PROMO", "METODE", "STATUS"]],
                body: tableData,
                styles: { fontSize: 8, cellPadding: 3 },
                headStyles: { fillColor: [50, 50, 50], textColor: [255, 255, 255] },
                alternateRowStyles: { fillColor: [252, 252, 252] },
                columnStyles: {
                    5: { halign: "right", fontStyle: "bold" },
                    7: { halign: "center", fontStyle: "bold", textColor: [16, 185, 129] }
                },
                didDrawPage: (data) => {
                    const pageCount = (doc as any).internal.getNumberOfPages();
                    doc.setFontSize(8);
                    doc.setTextColor(180);
                    doc.text(`Persija POS V2 - Halaman ${data.pageNumber} dari ${pageCount}`, 15, 285);
                }
            });

            doc.save(`Laporan_Persija_${startDate}_${endDate}.pdf`);
            toast.success("Laporan PDF berhasil diunduh.");
        } catch (error) {
            console.error("PDF Export Error:", error);
            toast.error("Gagal membuat PDF. Cek konsol.");
        } finally {
            setIsExporting(false);
        }
    };



    // --- LOGIC: DOWNLOAD EXCEL (Strictly Filtered) ---
    const handleDownloadExcel = () => {
        try {
            if (!filteredData || filteredData.length === 0) {
                toast.error("Tidak ada data untuk ekspor Excel.");
                return;
            }

            // Prepare data for Excel
            const excelData = filteredData.map((item, idx) => ({
                "NO": idx + 1,
                "ID TRANSAKSI": item.id,
                "JAM": item.time,
                "TANGGAL": item.date,
                "CUSTOMER": item.customer,
                "QTY": item.items || 0,
                "GROSS REVENUE": item.total + (item.discount || 0) + (item.promo || 0),
                "DISKON (Rp)": item.discount || 0,
                "PROMO (Rp)": item.promo || 0,
                "NET REVENUE": item.total,
                "METODE": item.method,
                "STATUS": item.status,
                "DISETUJUI OLEH": item.appliedBy || "-"
            }));

            // Create worksheet and workbook
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");

            // Save file
            XLSX.writeFile(workbook, `Laporan_Persija_Sales_${startDate}_${endDate}.xlsx`);
            toast.success("File Excel berhasil diunduh.");
        } catch (error) {
            console.error("Excel Export Error:", error);
            toast.error("Gagal membuat Excel.");
        }
    };
    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-700 dark:bg-[#000000]/10 min-h-screen">
            {/* Header Laporan */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100 uppercase italic">
                        Laporan Pendapatan
                        {/* <span className="text-[#ff3535] text-xl">V2</span> */}
                    </h2>
                    <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="h-3 w-3" /> Real-time Revenue & Sales Analysis
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-900/70 p-1.5 rounded-xl shadow-sm">
                        <div className="flex flex-col px-2">
                            <span className="text-[8px] font-black text-zinc-400 uppercase">START DATE</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent border-none text-[10px] font-bold text-zinc-900 dark:text-zinc-100 outline-none w-[110px]"
                            />
                        </div>
                        <div className="h-6 w-px bg-zinc-100 dark:bg-zinc-800" />
                        <div className="flex flex-col px-2">
                            <span className="text-[8px] font-black text-zinc-400 uppercase">END DATE</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent border-none text-[10px] font-bold text-zinc-900 dark:text-zinc-100 outline-none w-[110px]"
                            />
                        </div>
                    </div>

                    <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                        <SelectTrigger className="w-[140px] h-10 border-none bg-white dark:bg-zinc-900/70 shadow-sm rounded-xl font-bold text-[10px] uppercase tracking-widest text-indigo-500">
                            <SelectValue placeholder="Metode" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-zinc-950 border-zinc-800 rounded-xl">
                            <SelectItem value="ALL" className="text-[10px] font-bold uppercase">Semua Metode</SelectItem>
                            <SelectItem value="CASH" className="text-[10px] font-bold uppercase">Tunai (Cash)</SelectItem>
                            <SelectItem value="NETZME" className="text-[10px] font-bold uppercase">Netzme</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                        <Button
                            onClick={handleDownloadPDF}
                            disabled={isExporting}
                            className="h-10 bg-[#ff3535] hover:bg-[#e62e2e] text-white rounded-none font-bold text-[10px] uppercase tracking-widest px-5 disabled:opacity-50 cursor-pointer"
                        >
                            {isExporting ? <RefreshCcw className="h-3.5 w-3.5 animate-spin mr-2" /> : <Download className="h-3.5 w-3.5 mr-2" />}
                            PDF Laporan
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleDownloadExcel}
                            className="h-10 bg-white dark:bg-zinc-900/70 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-none font-bold text-[10px] uppercase tracking-widest px-4 border-l border-zinc-100 dark:border-zinc-800 cursor-pointer"
                        >
                            EXCEL
                        </Button>
                    </div>
                </div>
            </div>

            <Separator className="bg-zinc-100 dark:bg-zinc-800" />

            {/* Summary Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                    { label: "Total Gross Sales", val: `Rp ${formatIDR(totalGrossSales)}`, icon: DollarSign, color: "from-blue-600 to-indigo-600", sub: "Sebelum Potongan" },
                    { label: "Volume Pesanan", val: `${orderCount} Orders`, icon: ShoppingCart, color: "from-emerald-500 to-teal-500", sub: "Total Transaksi" },
                    { label: "Total Diskon", val: `Rp ${formatIDR(totalDiscount)}`, icon: Tag, color: "from-rose-500 to-orange-500", sub: `${effectiveDiscountRate}% Terpakai` },
                    { label: "Total Promo", val: `Rp ${formatIDR(totalPromo)}`, icon: Percent, color: "from-indigo-500 to-purple-500", sub: `${effectivePromoRate}% Terpakai` },
                    { label: "Produk Terjual", val: `${totalItemsSold} Pcs`, icon: FileBarChart, color: "from-amber-500 to-yellow-500", sub: "Volume Barang" },
                ].map((kpi, idx) => (
                    <Card key={idx} className="group border-none shadow-sm rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md overflow-hidden relative">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{kpi.label}</p>
                                    <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">{kpi.val}</h3>
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">{kpi.sub}</p>
                                </div>
                                <div className={`h-11 w-11 bg-linear-to-br ${kpi.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                                    <kpi.icon className="h-5 w-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Report Table Container */}
            <Card className="border-none shadow-md rounded-2xl bg-white dark:bg-zinc-900/70 backdrop-blur-md overflow-hidden">
                <CardHeader className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-sm font-black uppercase text-zinc-900 dark:text-zinc-100 tracking-tight">Rincian Transaksi Pendapatan</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase text-zinc-400 mt-1">Data Periode: {startDate} s/d {endDate}</CardDescription>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                        <Input
                            placeholder="CARI ID / CUSTOMER..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 w-[250px] pl-9 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl text-[10px] font-black uppercase tracking-widest shadow-inner placeholder:text-zinc-400"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 gap-4">
                            <RefreshCcw className="h-8 w-8 animate-spin text-zinc-400" />
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest animate-pulse">Menarik data dari backend...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/50">
                                    <TableHead className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest h-12 text-center w-[50px]">NO</TableHead>
                                    <TableHead className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest h-12">ID Transaksi</TableHead>
                                    <TableHead className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest h-12">Waktu (Jam)</TableHead>
                                    <TableHead className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest h-12">Tanggal</TableHead>
                                    <TableHead className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest h-12">Pelanggan</TableHead>
                                    <TableHead className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest h-12">QTY</TableHead>
                                    <TableHead className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest h-12">Gross</TableHead>
                                    <TableHead className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest h-12">Diskon</TableHead>
                                    <TableHead className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest h-12">Promo</TableHead>
                                    <TableHead className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest h-12">Metode</TableHead>
                                    <TableHead className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest h-12 text-right pr-6">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.map((item, idx) => (
                                    <TableRow key={idx} className="group border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                                        <TableCell className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 text-center py-4">{(currentPage - 1) * itemsPerPage + idx + 1}</TableCell>
                                        <TableCell className="text-[10px] font-black text-zinc-900 dark:text-zinc-100 py-4 uppercase tracking-tighter">#{item.id}</TableCell>
                                        <TableCell className="py-4">
                                            <Badge className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-none font-black text-[9px] rounded-md px-2 py-0.5 uppercase">
                                                {item.time}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 py-4 uppercase">{item.date}</TableCell>
                                        <TableCell className="text-[10px] font-black text-zinc-900 dark:text-zinc-100 py-4 uppercase">{item.customer}</TableCell>
                                        <TableCell className="text-[10px] font-black text-blue-600 dark:text-blue-400 py-4 text-center">{item.items || 0} Pcs</TableCell>
                                        <TableCell className="text-[11px] font-black text-zinc-900 dark:text-zinc-100 py-4 tabular-nums">Rp {formatIDR(item.total + (item.discount || 0) + (item.promo || 0))}</TableCell>
                                        <TableCell className="text-[10px] font-black text-rose-500 py-4 uppercase italic">
                                            {item.discount > 0 ? `${Math.round((item.discount / (item.total + item.discount + item.promo)) * 100)}% (Rp ${formatIDR(item.discount)})` : "-"}
                                        </TableCell>
                                        <TableCell className="text-[10px] font-black text-indigo-500 py-4 uppercase italic">
                                            {item.promo > 0 ? `${Math.round((item.promo / (item.total + item.discount + item.promo)) * 100)}% (Rp ${formatIDR(item.promo)})` : "-"}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-2">
                                                {item.method === 'NETZME' ? <Badge className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-none font-bold text-[8px] uppercase">Netzme</Badge> : <Badge className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-none font-bold text-[8px] uppercase">Cash</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right py-4 pr-6">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{item.status}</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
                <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} records
                    </p>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    className="cursor-pointer text-[10px] uppercase font-black"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                />
                            </PaginationItem>
                            {[...Array(totalPages)].map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        isActive={currentPage === i + 1}
                                        className="cursor-pointer text-[10px] font-black"
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    className="cursor-pointer text-[10px] uppercase font-black"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </Card>

            {/* Footer Summary - Total Nett/Tax Calculation */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch justify-end mb-8 pt-4">
                <Card className="border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-3xl bg-white dark:bg-zinc-950 p-7 flex flex-col justify-between md:w-[420px] overflow-hidden relative group">
                    {/* Subtle Glow Effect for Premium Look */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full -mr-24 -mt-24 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Total Gross Sales</span>
                            <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 tabular-nums">Rp {formatIDR(totalGrossSales)}</span>
                        </div>

                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center text-rose-500 dark:text-rose-400">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Total Discount (-)</span>
                                <span className="text-sm font-black tabular-nums">Rp {formatIDR(totalDiscount)}</span>
                            </div>
                            <div className="flex justify-between items-center text-indigo-500 dark:text-indigo-400">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Total Promo (-)</span>
                                <span className="text-sm font-black tabular-nums">Rp {formatIDR(totalPromo)}</span>
                            </div>
                        </div>

                        <Separator className="bg-zinc-100 dark:bg-zinc-800/60 my-2" />

                        <div className="flex justify-between items-end pt-2">
                            <div className="space-y-1.5">
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em]">Net Profit (Final)</span>
                                <h1 className="text-4xl font-black text-zinc-900 dark:text-white tabular-nums tracking-tighter leading-none">
                                    Rp {formatIDR(finalNettProfit)}
                                </h1>
                            </div>
                            <div className="h-14 w-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-[0_10px_30px_rgba(16,185,129,0.3)] transform group-hover:scale-105 transition-transform">
                                <TrendingUp className="h-7 w-7" />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

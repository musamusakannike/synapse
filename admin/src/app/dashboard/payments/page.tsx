"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable } from "@/components/DataTable";
import { StatCard } from "@/components/StatCard";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import { CreditCard, TrendingUp, ShieldAlert, Award, Search, Loader2 } from "lucide-react";

interface PaymentRow {
  _id: string;
  reference: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  status: string;
  plan: string;
  source: "paystack" | "admin_grant";
  paidAt: string;
}

interface RevenueStats {
  totalRevenue: number;
  organicRevenue: number;
  grantedRevenue: number;
  totalCount: number;
  organicCount: number;
  grantedCount: number;
}

const columns = [
  { key: "reference", label: "Reference" },
  { key: "user", label: "User" },
  { key: "amount", label: "Amount" },
  { key: "plan", label: "Plan" },
  { key: "source", label: "Source" },
  { key: "status", label: "Status" },
  { key: "date", label: "Paid At" },
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search,
      });
      const res = await fetch(`/api/admin/payments?${params}`);
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments);
        setStats(data.revenueStats);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch {
      // Silently fail
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Debounce search
  useEffect(() => {
    setPage(1);
  }, [search]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
      case "successful":
        return <span className="badge badge-success text-[10px]">Success</span>;
      case "failed":
        return <span className="badge badge-danger text-[10px]">Failed</span>;
      default:
        return <span className="badge badge-neutral text-[10px] capitalize">{status}</span>;
    }
  };

  const getSourceBadge = (source: "paystack" | "admin_grant") => {
    if (source === "admin_grant") {
      return (
        <span className="badge badge-warning text-[10px] flex items-center gap-1">
          <Award className="w-2.5 h-2.5" />
          Admin Grant
        </span>
      );
    }
    return (
      <span className="badge badge-neutral text-[10px] flex items-center gap-1">
        <CreditCard className="w-2.5 h-2.5 text-[var(--text-muted)]" />
        Paystack
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold">
          Payments
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Track customer payments, plan acquisitions, and admin-granted premium accounts.
        </p>
      </div>

      {/* Revenue Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Revenue"
          value={stats ? formatCurrency(stats.totalRevenue) : "₦0"}
          sub={stats ? `${stats.totalCount} successful payments` : "0 payments"}
          icon={<TrendingUp className="w-4 h-4 text-[var(--success)]" />}
          loading={loading && !stats}
        />
        <StatCard
          label="Organic (Paystack)"
          value={stats ? formatCurrency(stats.organicRevenue) : "₦0"}
          sub={stats ? `${stats.organicCount} payments processed` : "0 payments"}
          icon={<CreditCard className="w-4 h-4 text-[var(--accent)]" />}
          loading={loading && !stats}
        />
        <StatCard
          label="Admin Granted"
          value={stats ? formatCurrency(stats.grantedRevenue) : "₦0"}
          sub={stats ? `${stats.grantedCount} complimentary upgrades` : "0 upgrades"}
          icon={<Award className="w-4 h-4 text-[var(--warning)]" />}
          loading={loading && !stats}
        />
      </div>

      {/* Payments Table */}
      <DataTable
        columns={columns}
        data={payments as unknown as Record<string, unknown>[]}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by reference or email…"
        loading={loading}
        emptyMessage="No payments found."
        renderRow={(item) => {
          const payment = item as unknown as PaymentRow;
          return (
            <tr key={payment._id}>
              <td>
                <span className="font-mono text-xs font-semibold text-[var(--text-primary)]">
                  {payment.reference}
                </span>
              </td>
              <td>
                <div className="text-xs">
                  <span className="font-medium block text-[var(--text-secondary)] truncate max-w-[150px]">
                    {payment.userName}
                  </span>
                  <span className="text-[var(--text-muted)] block truncate max-w-[150px]">
                    {payment.userEmail}
                  </span>
                </div>
              </td>
              <td className="font-semibold text-xs text-[var(--text-primary)]">
                {formatCurrency(payment.amount)}
              </td>
              <td>
                <span className="capitalize text-xs text-[var(--text-secondary)]">
                  {payment.plan}
                </span>
              </td>
              <td>{getSourceBadge(payment.source)}</td>
              <td>{getStatusBadge(payment.status)}</td>
              <td className="text-xs">{formatDate(payment.paidAt)}</td>
            </tr>
          );
        }}
      />
    </div>
  );
}

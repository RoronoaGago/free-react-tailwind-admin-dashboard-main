import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "../components/ui/button/Button";
import React, { useState, useEffect } from "react";
import CustomerFequencyTable from "@/components/customer-frequency-report/CustomerFrequencyTable";
import { DateRangePicker } from "@/components/common/DateRangePicker";
import { ReportRequestParams } from "@/api/reportService";
import { ConfigProvider, DatePicker, theme, ThemeConfig } from "antd";
import axios from "axios";
import { useTheme } from "@/context/ThemeContext";
import { DownloadOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { toast } from "react-toastify";
import FrequencyPieChart from "@/components/customer-frequency-report/FrequencyPieChart";

const { RangePicker } = DatePicker;

// Light theme configuration
const lightTheme: ThemeConfig = {
  components: {
    DatePicker: {
      fontFamily: "Outfit, sans-serif",
      colorPrimary: "#3641f5",
      colorBorder: "#e5e7eb",
      colorText: "#374151",
      colorTextPlaceholder: "#9ca3af",
      colorBgContainer: "#ffffff",
      colorBgElevated: "#ffffff",
      colorTextHeading: "#111827",
      colorTextDescription: "#6b7280",
      colorIcon: "#9ca3af",
      colorLink: "#3b82f6",
      colorLinkHover: "#2563eb",
      borderRadius: 6,
      fontSize: 14,
      paddingSM: 8,
      controlHeight: 40,
      algorithm: true,
    },
  },
};

// Dark theme configuration
const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  components: {
    DatePicker: {
      fontFamily: "Outfit, sans-serif",
      colorPrimary: "#5a67f7",
      colorBorder: "#4b5563",
      colorText: "#e5e7eb",
      colorTextPlaceholder: "#9ca3af",
      colorBgContainer: "#1f2937",
      colorBgElevated: "#1f2937",
      colorTextHeading: "#f9fafb",
      colorTextDescription: "#d1d5db",
      colorIcon: "#9ca3af",
      colorLink: "#818cf8",
      colorLinkHover: "#677df6",
      borderRadius: 6,
      fontSize: 14,
      paddingSM: 8,
      controlHeight: 40,
    },
  },
};

type TabOption = "Daily" | "Weekly" | "Monthly" | "Custom";
type PeriodMap = {
  [key in TabOption]: ReportRequestParams["period"];
};

const PERIOD_MAP: PeriodMap = {
  Daily: "daily",
  Weekly: "weekly",
  Monthly: "monthly",
  Custom: "custom",
};

interface CustomerFrequencyData {
  id: number;
  first_name: string;
  last_name: string;
  contact_number: string;
  address: string;
  total_transactions: number;
  total_spent: number;
  average_spent: number;
  last_transaction_date: string;
  period: string;
  start_date: string;
  end_date: string;
  transactions?: any[];
}

const CustomerFrequencyReport = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabOption>("Monthly");
  const [loading, setLoading] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [reportData, setReportData] = useState<CustomerFrequencyData[] | null>(
    null
  );
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [filters, setFilters] = useState<ReportRequestParams>({
    period: PERIOD_MAP["Monthly"],
    include_details: true,
  });

  const tabs: TabOption[] = ["Daily", "Weekly", "Monthly", "Custom"];

  useEffect(() => {
    fetchCustomerFrequencyData();
  }, [filters]);
  // Add this helper function to format the report title

  const fetchCustomerFrequencyData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/reports/customer-frequency/",
        {
          params: filters,
          ...(dateRange && {
            start_date: formatDateForAPI(dateRange[0]),
            end_date: formatDateForAPI(dateRange[1]),
          }),
        }
      );
      setReportData(response.data);
      console.log(response.data);
    } catch (error) {
      toast.error("Failed to fetch customer frequency data", {
        position: "top-center",
        autoClose: 5000,
        style: { fontFamily: "Outfit, sans-serif" },
      });
      console.error("Error fetching customer frequency data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForAPI = (date: Date | string) => {
    if (typeof date === "string") return date;
    return dayjs(date).format("YYYY-MM-DD");
  };

  const handleTabChange = (tab: TabOption) => {
    setActiveTab(tab);
    setFilters((prev) => ({
      ...prev,
      period: PERIOD_MAP[tab],
      ...(tab !== "Custom" && {
        start_date: undefined,
        end_date: undefined,
      }),
    }));

    if (tab === "Custom" && !dateRange) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      setDateRange([start, end]);
    }
  };

  const handleDateRangeChange = (
    dates: [Dayjs | null, Dayjs | null] | null,
    dateStrings: [string, string]
  ) => {
    if (!dates || !dates[0] || !dates[1]) {
      setDateRange(null);
      setFilters((prev) => ({
        ...prev,
        period: PERIOD_MAP["Monthly"],
        start_date: undefined,
        end_date: undefined,
      }));
      return;
    }

    const [start, end] = dates;

    if (start.isAfter(end)) {
      toast.error("End date must be after start date", {
        position: "top-center",
        autoClose: 5000,
        style: { fontFamily: "Outfit, sans-serif" },
      });
      return;
    }

    const maxRange = 365;
    if (end.diff(start, "days") > maxRange) {
      toast.error(`Date range cannot exceed ${maxRange} days`, {
        position: "top-center",
        autoClose: 5000,
        style: { fontFamily: "Outfit, sans-serif" },
      });
      return;
    }

    setDateRange([start.toDate(), end.toDate()]);
    setFilters((prev) => ({
      ...prev,
      period: PERIOD_MAP["Custom"],
      start_date: formatDateForAPI(start.toDate()),
      end_date: formatDateForAPI(end.toDate()),
    }));
  };

  const handleExport = async () => {
    try {
      console.log("[handleExport] Starting customer frequency export process");
      setExportLoading(true);

      const response = await axios.get(
        "http://127.0.0.1:8000/api/reports/customer-frequency/export/",
        {
          params: filters,
          responseType: "blob",
        }
      );

      console.log(
        "[handleExport] Received response with headers:",
        response.headers
      );

      // Extract filename from Content-Disposition header if available
      const contentDisposition = response.headers["content-disposition"];
      let filename = `Customer Frequency Report ${
        new Date().toISOString().split("T")[0]
      }.xlsx`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch?.[1]) {
          filename = filenameMatch[1];
        }
      }

      console.log("[handleExport] Using filename:", filename);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log("[handleExport] Cleaned up DOM and revoked object URL");
      }, 100);

      toast.success("Export completed successfully!", {
        position: "top-center",
        autoClose: 5000,
        style: { fontFamily: "Outfit, sans-serif" },
      });
      console.log("[handleExport] Export completed successfully");
    } catch (error) {
      console.error("[handleExport] Export failed:", error);

      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to export report"
        : "An unexpected error occurred";

      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
        style: { fontFamily: "Outfit, sans-serif" },
      });
    } finally {
      setExportLoading(false);
      console.log("[handleExport] Set loading state to false");
    }
  };

  return (
    <div className="p-4">
      <PageBreadcrumb pageTitle="Customer Frequency Report" />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 my-6">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex space-x-1 p-1 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-brand-600 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => handleTabChange(tab)}
                disabled={loading}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Custom" && (
            <ConfigProvider theme={theme === "dark" ? darkTheme : lightTheme}>
              <RangePicker
                onChange={handleDateRangeChange}
                value={
                  dateRange ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null
                }
                disabledDate={(current) =>
                  current && current > dayjs().endOf("day")
                }
                format="YYYY-MM-DD"
                style={{
                  width: "100%",
                  maxWidth: "300px",
                }}
              />
            </ConfigProvider>
          )}
        </div>

        <Button
          size="md"
          variant="primary"
          startIcon={<DownloadOutlined />}
          onClick={handleExport}
          disabled={loading || exportLoading || !reportData}
          loading={exportLoading}
        >
          Export
        </Button>
      </div>
      {!loading && reportData && (
        <div>
          <h1 className="mt-14 font-bold text-gray-800 text-title-sm dark:text-white/90 mb-6">
            {reportData[0]?.period === "daily"
              ? "Daily Report  (" +
                dayjs(reportData[0]?.start_date).format("MMM D, YYYY") +
                ")" // Daily format: "Apr 15, 2025"
              : reportData[0]?.period === "custom"
              ? `${dayjs(reportData[0]?.start_date).format(
                  "MMM D, YYYY"
                )} to ${dayjs(reportData[0]?.end_date).format("MMM D, YYYY")}`
              : `${
                  (reportData[0]?.period ?? "").charAt(0).toUpperCase() +
                  (reportData[0]?.period ?? "").slice(1)
                } Report (${dayjs(reportData[0]?.start_date).format(
                  "MMM D, YYYY"
                )} to ${dayjs(reportData[0]?.end_date).format("MMM D, YYYY")})`}
          </h1>
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 custom-scrollbar">
              <ComponentCard title="Top Customers By Total Transactions Made">
                <CustomerFequencyTable
                  data={reportData || null}
                  loading={loading}
                />
              </ComponentCard>
            </div>
            <div className="col-span-10">
              <FrequencyPieChart data={reportData || []} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerFrequencyReport;

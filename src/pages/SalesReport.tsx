import { DownloadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import SalesMetrics from "@/components/sales-report/SalesMetrics";
import SalesStatistics from "@/components/sales-report/SalesStatistics";
import { Dayjs } from "dayjs";
import Button from "../components/ui/button/Button";
import { DatePicker, theme } from "antd";
import {
  fetchSalesReport,
  exportSalesReport,
  ReportRequestParams,
  SalesReportData,
} from "@/api/reportService";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { toast } from "react-toastify";
import { Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";
import { ConfigProvider } from "antd";
import type { ThemeConfig } from "antd";
import { useTheme } from "@/context/ThemeContext";
import TransactionStatistics from "@/components/sales-report/TransactionStatistics";

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

const SalesReport = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabOption>("Monthly");
  const [loading, setLoading] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [reportData, setReportData] = useState<SalesReportData | null>(null);
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [filters, setFilters] = useState<ReportRequestParams>({
    period: PERIOD_MAP["Monthly"],
    include_details: true,
  });

  const tabs: TabOption[] = ["Daily", "Weekly", "Monthly", "Custom"];

  const formatDateForAPI = (date: Date | string) => {
    if (typeof date === "string") return date;
    return dayjs(date).format("YYYY-MM-DD");
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      const params: ReportRequestParams = {
        ...filters,
        ...(dateRange && {
          start_date: formatDateForAPI(dateRange[0]),
          end_date: formatDateForAPI(dateRange[1]),
        }),
      };
      const data = await fetchSalesReport(params);
      setReportData(data);

      toast.success("Report loaded successfully!", {
        position: "top-center",
        autoClose: 3000,
        style: { fontFamily: "Outfit, sans-serif" },
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load sales report";

      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
        style: { fontFamily: "Outfit, sans-serif" },
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      console.log("[handleExport] Starting export process");

      if (!reportData) {
        console.warn("[handleExport] No report data available");
        toast.error("No report data available to export");
        return;
      }

      setExportLoading(true);
      console.log("[handleExport] Set loading state to true");

      const params: ReportRequestParams = {
        ...filters,
      };

      console.log("[handleExport] Prepared request params:", params);

      // Get both blob and filename from the API
      console.log("[handleExport] Calling exportSalesReport...");
      const { blob, filename } = await exportSalesReport(params);
      console.log("[handleExport] Received blob and filename:", {
        filename,
        blob,
      });

      const url = window.URL.createObjectURL(blob);
      console.log("[handleExport] Created object URL:", url);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      console.log(
        "[handleExport] Created download link with filename:",
        filename
      );

      document.body.appendChild(link);
      link.click();
      console.log("[handleExport] Triggered file download");

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log("[handleExport] Cleaned up DOM and revoked object URL");
      }, 100);

      toast.success("Export completed successfully!");
      console.log("[handleExport] Export completed successfully");
    } catch (err) {
      console.error("[handleExport] Export failed:", err);

      const errorMessage =
        err instanceof Error ? err.message : "Failed to export report";
      toast.error(errorMessage);
    } finally {
      setExportLoading(false);
      console.log("[handleExport] Set loading state to false");
    }
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

  useEffect(() => {
    loadReport();
  }, [filters]);

  return (
    <div className="p-4">
      <PageBreadcrumb pageTitle="Sales Report" />

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
          disabled={loading || exportLoading}
          loading={exportLoading}
        >
          Export
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
        </div>
      )}

      {!loading && reportData && (
        <div>
          <h1 className="mt-14 font-bold text-gray-800 text-title-sm dark:text-white/90 mb-6">
            {reportData?.period === "daily"
              ? "Daily Report  (" +
                dayjs(reportData?.start_date).format("MMM D, YYYY") +
                ")" // Daily format: "Apr 15, 2025"
              : reportData?.period === "custom"
              ? `${dayjs(reportData?.start_date).format(
                  "MMM D, YYYY"
                )} to ${dayjs(reportData?.end_date).format("MMM D, YYYY")}`
              : `${
                  (reportData?.period ?? "").charAt(0).toUpperCase() +
                  (reportData?.period ?? "").slice(1)
                } Report (${dayjs(reportData?.start_date).format(
                  "MMM D, YYYY"
                )} to ${dayjs(reportData?.end_date).format("MMM D, YYYY")})`}
          </h1>
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 xl:col-span-6">
              <SalesStatistics reportData={reportData} />
            </div>
            <div className="col-span-12 space-y-6 xl:col-span-6">
              <SalesMetrics data={reportData} />
            </div>
            <div className="col-span-12 xl:col-span-6">
              <TransactionStatistics reportData={reportData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesReport;

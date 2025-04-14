import { DownloadOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import SalesMetrics from "@/components/sales-report/SalesMetrics";
import SalesStatistics from "@/components/sales-report/SalesStatistics";
import { Dayjs } from 'dayjs';
import Button from "../components/ui/button/Button";
import { DatePicker, theme } from 'antd';
import { fetchSalesReport, ReportRequestParams, SalesReportData } from "@/api/reportService";
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { toast } from 'react-toastify';
import { Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import dayjs from 'dayjs';
import { ConfigProvider} from 'antd';
import type { ThemeConfig } from 'antd';
import { useTheme } from '@/context/ThemeContext';

const { RangePicker } = DatePicker;

// Light theme configuration
const lightTheme: ThemeConfig = {
  components: {
    DatePicker: {
      fontFamily: 'Outfit, sans-serif',
      colorPrimary: '#3641f5',
      colorBorder: '#e5e7eb',
      colorText: '#374151',
      colorTextPlaceholder: '#9ca3af',
      colorBgContainer: '#ffffff',
      colorBgElevated: '#ffffff',
      colorTextHeading: '#111827',
      colorTextDescription: '#6b7280',
      colorIcon: '#9ca3af',
      colorLink: '#3b82f6',
      colorLinkHover: '#2563eb',
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
  algorithm: theme.darkAlgorithm, // This applies the dark mode algorithm
  components: {
    DatePicker: {
      fontFamily: 'Outfit, sans-serif',
    
      colorPrimary: '#5a67f7', // Brighter primary for better visibility in dark
      colorBorder: '#4b5563', // gray-600
      colorText: '#e5e7eb', // gray-200
      colorTextPlaceholder: '#9ca3af', // gray-400
      colorBgContainer: '#1f2937', // gray-800
      colorBgElevated: '#1f2937', // gray-800 (dropdown background)
      colorTextHeading: '#f9fafb', // gray-50
      colorTextDescription: '#d1d5db', // gray-300
      colorIcon: '#9ca3af', // gray-400
      colorLink: '#818cf8', // indigo-400
      colorLinkHover: '#677df6', // Slightly brighter hover
      // Keep the same sizing values
      borderRadius: 6,
      fontSize: 14,
      paddingSM: 8,
      controlHeight: 40,
    },
  },
};


type TabOption = 'Daily' | 'Weekly' | 'Monthly' | 'Custom';
type PeriodMap = {
  [key in TabOption]: ReportRequestParams['period'];
};

const PERIOD_MAP: PeriodMap = {
  Daily: 'daily',
  Weekly: 'weekly',
  Monthly: 'monthly',
  Custom: 'custom'
};

const SalesReport = () => {
  const {theme} = useTheme()
  const [activeTab, setActiveTab] = useState<TabOption>('Monthly');
  const [loading, setLoading] = useState<boolean>(false);
  const [reportData, setReportData] = useState<SalesReportData | null>(null);
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [filters, setFilters] = useState<ReportRequestParams>({
    period: PERIOD_MAP['Monthly'],
    include_details: true,
  });
  const { RangePicker } = DatePicker;
  const tabs: TabOption[] = ['Daily', 'Weekly', 'Monthly', 'Custom'];

  const formatDateForAPI = (date: Date) => {
    return dayjs(date).format('YYYY-MM-DD');
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      const params: ReportRequestParams = {
        ...filters,
        ...(dateRange && {
          start_date: formatDateForAPI(dateRange[0]),
          end_date: formatDateForAPI(dateRange[1])
        })
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sales report';
      
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

  const handleTabChange = (tab: TabOption) => {
    setActiveTab(tab);
    setFilters(prev => ({
      ...prev,
      period: PERIOD_MAP[tab],
      ...(tab !== 'Custom' && { 
        start_date: undefined,
        end_date: undefined 
      })
    }));

    if (tab === 'Custom' && !dateRange) {
      // Set default range (last 30 days)
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
      // Handle clear case
      setDateRange(null);
      setFilters(prev => ({
        ...prev,
        period: PERIOD_MAP['Monthly'],
        start_date: undefined,
        end_date: undefined
      }));
      return;
    }

    const [start, end] = dates;
    
    // Validate dates are in correct order
    if (start.isAfter(end)) {
      toast.error("End date must be after start date", {
        position: "top-center",
        autoClose: 5000,
        style: { fontFamily: "Outfit, sans-serif" },
      });
      return;
    }

    // Limit date range if needed
    const maxRange = 365; // days
    if (end.diff(start, 'days') > maxRange) {
      toast.error(`Date range cannot exceed ${maxRange} days`, {
        position: "top-center",
        autoClose: 5000,
        style: { fontFamily: "Outfit, sans-serif" },
      });
      return;
    }

    setDateRange([start.toDate(), end.toDate()]);
    setFilters(prev => ({
      ...prev,
      period: PERIOD_MAP['Custom'],
      start_date: formatDateForAPI(start.toDate()),
      end_date: formatDateForAPI(end.toDate())
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
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => handleTabChange(tab)}
                disabled={loading}
              >
                {tab}
              </button>
            ))}
          </div>
          
          {activeTab === 'Custom' && (
            <ConfigProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
            <RangePicker
              onChange={handleDateRangeChange}
              value={dateRange ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null}
              disabledDate={(current) => current && current > dayjs().endOf('day')}
              format="YYYY-MM-DD"
              style={{
                width: '100%',
                maxWidth: '300px', // Adjust as needed
              }}
            />
          </ConfigProvider>)}
        </div>
        
        <Button 
          size="md" 
          variant="primary" 
          startIcon={<DownloadOutlined />}
          onClick={() => {
            toast.success("Export started successfully!", {
              position: "top-center",
              autoClose: 3000,
              style: { fontFamily: "Outfit, sans-serif" },
            });
            // Add your export logic here
          }}
          disabled={loading}
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
            {reportData?.period === 'custom' 
              ? `${reportData?.start_date} to ${reportData?.end_date}`
              : `${(reportData?.period ?? '').charAt(0).toUpperCase() + (reportData?.period ?? '').slice(1)} Report (${reportData?.start_date || 'N/A'} to ${reportData?.end_date || 'N/A'})`}
          </h1>
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 xl:col-span-6">
              <SalesStatistics reportData={reportData}/>
            </div>
            <div className="col-span-12 space-y-6 xl:col-span-6">
              <SalesMetrics data={reportData} />
              {/* <SalesBreakdownChart/> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesReport;
// src/components/reports/SalesReport.tsx
// import React, { useState, useEffect } from 'react';
// import { Card, Spin, Alert, Row, Col, Tabs, DatePicker, Button, Select, Radio } from 'antd';
// import { DownloadOutlined } from '@ant-design/icons';
// import ReportSummary from '@/components/sales-report/ReportSummary';
// import ServiceTypeChart from '@/components/sales-report/ServiceTypeChart';
// import StatusChart from '@/components/sales-report/StatusChart';
// import TransactionsTable from '@/components/sales-report/TransactionsTable';
// import { formatDate } from '@/lib/helpers';
// import { exportSalesReport, fetchSalesReport, ReportRequestParams, SalesReportData } from '@/api/reportService';

// const { RangePicker } = DatePicker;
// const { TabPane } = Tabs;
// const { Option } = Select;

// const SalesReport: React.FC = () => {
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [reportData, setReportData] = useState<SalesReportData | null>(null);
//   const [filters, setFilters] = useState<ReportRequestParams>({
//     period: 'monthly',
//     include_details: true,
//   });

//   const loadReport = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const data = await fetchSalesReport(filters);
//       setReportData(data);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'An unknown error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadReport();
//   }, [filters]);

//   const handlePeriodChange = (e: any) => {
//     setFilters({ ...filters, period: e.target.value });
//   };

//   const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
//     if (dates) {
//       setFilters({
//         ...filters,
//         period: 'custom',
//         start_date: dateStrings[0],
//         end_date: dateStrings[1],
//       });
//     } else {
//       setFilters({
//         ...filters,
//         period: 'monthly',
//         start_date: undefined,
//         end_date: undefined,
//       });
//     }
//   };

//   const handleServiceTypeChange = (value: 'standard' | 'express' | undefined) => {
//     setFilters({ ...filters, service_type: value });
//   };

//   const handleStatusChange = (value: string | undefined) => {
//     setFilters({ ...filters, status: value as any });
//   };

//   const handleExport = async () => {
//     try {
//       const blob = await exportSalesReport(filters);
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `sales-report-${formatDate(new Date().toISOString())}.xlsx`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to export report');
//     }
//   };

//   return (
//     <div className="sales-report">
//       <Card title="Sales Report" bordered={false}>
//         <div className="report-filters">
//           <Row gutter={16} align="middle">
//             <Col>
//               <Radio.Group value={filters.period} onChange={handlePeriodChange}>
//                 <Radio.Button value="daily">Daily</Radio.Button>
//                 <Radio.Button value="weekly">Weekly</Radio.Button>
//                 <Radio.Button value="monthly">Monthly</Radio.Button>
//                 <Radio.Button value="custom">Custom</Radio.Button>
//               </Radio.Group>
//             </Col>

//             {filters.period === 'custom' && (
//               <Col>
//                 <RangePicker onChange={handleDateRangeChange} />
//               </Col>
//             )}

//             <Col>
//               <Select
//                 style={{ width: 150 }}
//                 allowClear
//                 placeholder="Service Type"
//                 onChange={handleServiceTypeChange}
//                 value={filters.service_type}
//               >
//                 <Option value="standard">Standard</Option>
//                 <Option value="express">Express</Option>
//               </Select>
//             </Col>

//             <Col>
//               <Select
//                 style={{ width: 150 }}
//                 allowClear
//                 placeholder="Status"
//                 onChange={handleStatusChange}
//                 value={filters.status}
//               >
//                 <Option value="pending">Pending</Option>
//                 <Option value="in_progress">In Progress</Option>
//                 <Option value="ready_for_pickup">Ready for Pickup</Option>
//                 <Option value="completed">Completed</Option>
//                 <Option value="cancelled">Cancelled</Option>
//               </Select>
//             </Col>

//             <Col>
//               <Button 
//                 type="primary" 
//                 icon={<DownloadOutlined />}
//                 onClick={handleExport}
//                 loading={loading}
//               >
//                 Export
//               </Button>
//             </Col>
//           </Row>
//         </div>

//         {loading && <Spin size="large" className="report-spinner" />}

//         {error && (
//           <Alert 
//             message="Error" 
//             description={error} 
//             type="error" 
//             showIcon 
//             closable 
//             onClose={() => setError(null)}
//           />
//         )}

//         {reportData && (
//           <>
//             <ReportSummary data={reportData} />
            
//             <Tabs defaultActiveKey="1" className="report-tabs">
//               <TabPane tab="Charts" key="1">
//                 <Row gutter={[16, 16]}>
//                   <Col span={12}>
//                     <ServiceTypeChart data={reportData.service_type_breakdown} />
//                   </Col>
//                   <Col span={12}>
//                     <StatusChart data={reportData.status_breakdown} />
//                   </Col>
//                 </Row>
//               </TabPane>
              
//               <TabPane tab="Transactions" key="2">
//                 <TransactionsTable
//                   transactions={reportData.transactions || []} 
//                 />
//               </TabPane>
//             </Tabs>
//           </>
//         )}
//       </Card>
//     </div>
//   );
// };

// export default SalesReport;
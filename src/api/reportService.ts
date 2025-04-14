// src/api/reportService.ts
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export interface ReportRequestParams {
  period?: 'daily' | 'weekly' | 'monthly' | 'custom';
  start_date?: string;
  end_date?: string;
  service_type?: 'standard' | 'express';
  status?: 'pending' | 'in_progress' | 'ready_for_pickup' | 'completed' | 'cancelled';
  include_details?: boolean;
}

export interface ServiceTypeBreakdown {
  [key: string]: {
    total: number;
    count: number;
  };
}

export interface StatusBreakdown {
  [key: string]: number;
}

export interface Transaction {
  id: number;
  customer: {
    first_name: string;
    last_name: string;
    contact_number: string;
  };
  service_type: string;
  status: string;
  grand_total: number;
  created_at: string;
}

export interface SalesReportData {
  period: string;
  start_date: string;
  end_date: string;
  total_sales: number;
  total_transactions: number;
  average_sale: number;
  service_type_breakdown: ServiceTypeBreakdown;
  status_breakdown: StatusBreakdown;
  transactions?: Transaction[];
}

export const fetchSalesReport = async (params: ReportRequestParams): Promise<SalesReportData> => {
  try {
    const response = await axios.get<SalesReportData>(`${API_BASE_URL}/reports/sales/`, {
      params: {
        ...params,
        start_date: params.start_date,
        end_date: params.end_date,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch sales report');
    }
    throw new Error('An unexpected error occurred');
  }
};

export const exportSalesReport = async (params: ReportRequestParams): Promise<Blob> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/reports/sales/export/`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to export report');
    }
    throw new Error('An unexpected error occurred');
  }
};
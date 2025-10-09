import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Employee } from '@/types';

interface EmployeeState {
  employees: Employee[];
  currentEmployee: Employee | null;
  selectedEmployee: Employee | null;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    companyId?: number;
    departmentId?: number;
    status?: string;
  };
}

const initialState: EmployeeState = {
  employees: [],
  currentEmployee: null,
  selectedEmployee: null,
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 10,
  isLoading: false,
  error: null,
  searchQuery: '',
  filters: {},
};

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    setEmployees: (state, action: PayloadAction<{
      employees: Employee[];
      totalElements: number;
      totalPages: number;
      currentPage: number;
    }>) => {
      state.employees = action.payload.employees;
      state.totalElements = action.payload.totalElements;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
      state.isLoading = false;
      state.error = null;
    },
    setCurrentEmployee: (state, action: PayloadAction<Employee | null>) => {
      state.currentEmployee = action.payload;
    },
    setSelectedEmployee: (state, action: PayloadAction<Employee | null>) => {
      state.selectedEmployee = action.payload;
    },
    addEmployee: (state, action: PayloadAction<Employee>) => {
      state.employees.unshift(action.payload);
      state.totalElements += 1;
    },
    updateEmployee: (state, action: PayloadAction<Employee>) => {
      const index = state.employees.findIndex(emp => emp.id === action.payload.id);
      if (index !== -1) {
        state.employees[index] = action.payload;
      }
      if (state.selectedEmployee?.id === action.payload.id) {
        state.selectedEmployee = action.payload;
      }
      if (state.currentEmployee?.id === action.payload.id) {
        state.currentEmployee = action.payload;
      }
    },
    deleteEmployee: (state, action: PayloadAction<number>) => {
      state.employees = state.employees.filter(emp => emp.id !== action.payload);
      state.totalElements -= 1;
      if (state.selectedEmployee?.id === action.payload) {
        state.selectedEmployee = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<typeof initialState.filters>) => {
      state.filters = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearEmployeeState: () => initialState,
  },
});

export const {
  setEmployees,
  setCurrentEmployee,
  setSelectedEmployee,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  setLoading,
  setError,
  setSearchQuery,
  setFilters,
  setPageSize,
  setCurrentPage,
  clearEmployeeState,
} = employeeSlice.actions;

export default employeeSlice.reducer;

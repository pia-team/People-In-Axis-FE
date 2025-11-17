import * as yup from 'yup';
import { isValidTCKN } from './tckn';

// Common validation schemas
export const emailSchema = yup
  .string()
  .email('Invalid email address')
  .required('Email is required');

export const phoneSchema = yup
  .string()
  .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone number')
  .required('Phone number is required');

export const tcknSchema = yup
  .string()
  .test('tckn', 'Invalid TCKN number', (value) => {
    if (!value) return true; // Optional
    return isValidTCKN(value);
  });

export const requiredStringSchema = (fieldName: string) =>
  yup.string().required(`${fieldName} is required`);

export const positiveNumberSchema = (fieldName: string) =>
  yup
    .number()
    .typeError(`${fieldName} must be a number`)
    .positive(`${fieldName} must be positive`)
    .required(`${fieldName} is required`);

export const nonNegativeNumberSchema = (fieldName: string) =>
  yup
    .number()
    .typeError(`${fieldName} must be a number`)
    .min(0, `${fieldName} must be non-negative`)
    .required(`${fieldName} is required`);

export const dateSchema = (fieldName: string) =>
  yup
    .string()
    .required(`${fieldName} is required`)
    .test('date', 'Invalid date format', (value) => {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime());
    });

export const futureDateSchema = (fieldName: string) =>
  dateSchema(fieldName).test('future', `${fieldName} must be in the future`, (value) => {
    if (!value) return false;
    return new Date(value) > new Date();
  });

// Employee validation schemas
export const employeeCreateSchema = yup.object({
  firstName: requiredStringSchema('First name'),
  lastName: requiredStringSchema('Last name'),
  email: emailSchema,
  phoneNumber: phoneSchema.optional(),
  mobileNumber: phoneSchema.optional(),
  position: requiredStringSchema('Position'),
  startDate: dateSchema('Start date'),
  companyId: positiveNumberSchema('Company ID'),
  departmentId: yup.number().optional(),
  managerId: yup.number().optional(),
  employmentType: yup.string().required('Employment type is required'),
  status: yup.string().optional(),
});

// Company validation schemas
export const companyCreateSchema = yup.object({
  name: requiredStringSchema('Company name'),
  code: yup.string().optional(),
  taxNumber: yup.string().optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  website: yup.string().url('Invalid website URL').optional(),
  parentCompanyId: yup.number().optional(),
});

// Department validation schemas
export const departmentCreateSchema = yup.object({
  name: requiredStringSchema('Department name'),
  code: yup.string().optional(),
  description: yup.string().optional(),
  companyId: positiveNumberSchema('Company ID'),
  managerId: yup.number().optional(),
  parentDepartmentId: yup.number().optional(),
});

// Project validation schemas
export const projectCreateSchema = yup.object({
  name: requiredStringSchema('Project name'),
  code: yup.string().optional(),
  description: yup.string().optional(),
  startDate: yup.string().required('Start date is required').test('date', 'Invalid date format', (value) => {
    if (!value) return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
  }),
  endDate: yup.string().optional().nullable().test('date', 'Invalid date format', (value) => {
    if (!value) return true;
    const date = new Date(value);
    return !isNaN(date.getTime());
  }),
  deadline: yup.string().optional().nullable().test('date', 'Invalid date format', (value) => {
    if (!value) return true;
    const date = new Date(value);
    return !isNaN(date.getTime());
  }),
  status: yup.string().required('Status is required'),
  companyId: positiveNumberSchema('Company ID'),
  projectManagerId: yup.number().optional(),
  budget: nonNegativeNumberSchema('Budget').optional(),
  currency: yup.string().optional(),
});

// Application validation schemas
export const applicationCreateSchema = yup.object({
  firstName: requiredStringSchema('First name'),
  lastName: requiredStringSchema('Last name'),
  email: emailSchema,
  phone: phoneSchema,
  tckn: tcknSchema.optional(),
  birthDate: yup.string().optional().nullable().test('date', 'Invalid date format', (value) => {
    if (!value) return true;
    const date = new Date(value);
    return !isNaN(date.getTime());
  }),
  address: yup.string().optional(),
  experienceYears: nonNegativeNumberSchema('Experience years').optional(),
  expectedSalary: nonNegativeNumberSchema('Expected salary').optional(),
  availableStartDate: yup.string().optional().nullable().test('date', 'Invalid date format', (value) => {
    if (!value) return true;
    const date = new Date(value);
    return !isNaN(date.getTime());
  }),
  noticePeriodDays: nonNegativeNumberSchema('Notice period days').optional(),
  coverLetter: yup.string().optional(),
  kvkkConsent: yup.boolean().oneOf([true], 'KVKK consent is required'),
});

// Position validation schemas
export const positionCreateSchema = yup.object({
  name: requiredStringSchema('Position name'),
  title: requiredStringSchema('Position title'),
  department: yup.string().optional(),
  location: yup.string().optional(),
  workType: yup.string().optional(),
  minExperience: nonNegativeNumberSchema('Minimum experience').optional(),
  educationLevel: yup.string().optional(),
  description: yup.string().optional(),
  requirements: yup.string().optional(),
  visibility: yup.string().oneOf(['PUBLIC', 'INTERNAL']).optional(),
  applicationDeadline: yup.string().optional().nullable().test('future-date', 'Application deadline must be in the future', (value) => {
    if (!value) return true;
    const date = new Date(value);
    if (isNaN(date.getTime())) return false;
    return date > new Date();
  }),
  salaryRangeMin: nonNegativeNumberSchema('Minimum salary').optional(),
  salaryRangeMax: nonNegativeNumberSchema('Maximum salary').optional(),
}).test('salary-range', 'Minimum salary cannot be greater than maximum salary', function(value) {
  if (value.salaryRangeMin && value.salaryRangeMax) {
    return value.salaryRangeMin <= value.salaryRangeMax;
  }
  return true;
});

// Pool CV validation schemas
export const poolCVCreateSchema = yup.object({
  firstName: requiredStringSchema('First name'),
  lastName: requiredStringSchema('Last name'),
  email: emailSchema,
  phone: phoneSchema,
  tckn: tcknSchema.optional(),
  birthDate: yup.string().optional().nullable().test('date', 'Invalid date format', (value) => {
    if (!value) return true;
    const date = new Date(value);
    return !isNaN(date.getTime());
  }),
  address: yup.string().optional(),
  currentPosition: yup.string().optional(),
  currentCompany: yup.string().optional(),
  experienceYears: nonNegativeNumberSchema('Experience years').optional(),
  expectedSalary: nonNegativeNumberSchema('Expected salary').optional(),
  availableStartDate: yup.string().optional().nullable().test('date', 'Invalid date format', (value) => {
    if (!value) return true;
    const date = new Date(value);
    return !isNaN(date.getTime());
  }),
  noticePeriodDays: nonNegativeNumberSchema('Notice period days').optional(),
  coverLetter: yup.string().optional(),
  isActive: yup.boolean().optional(),
});


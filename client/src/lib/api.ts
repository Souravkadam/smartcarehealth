/**
 * Thin API client — all fetch calls go through here.
 * Falls back to the static data if the server is unreachable (dev without server).
 */

import { Hospital } from "@/data/hospitals";

const BASE = "/api";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}

async function del(path: string): Promise<void> {
  const res = await fetch(`${BASE}${path}`, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    throw new Error(data.error || `Request failed (${res.status})`);
  }
}

// ---------------------------------------------------------------------------
// Hospitals
// ---------------------------------------------------------------------------

export async function fetchHospitals(params?: {
  search?: string;
  level?: string;
  city?: string;
}): Promise<Hospital[]> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.level) qs.set("level", params.level);
  if (params?.city) qs.set("city", params.city);
  const query = qs.toString() ? `?${qs}` : "";
  return get<Hospital[]>(`/hospitals${query}`);
}

export async function fetchHospital(id: string): Promise<Hospital> {
  return get<Hospital>(`/hospitals/${id}`);
}

// ---------------------------------------------------------------------------
// Users (admin)
// ---------------------------------------------------------------------------

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive";
  appointments: number;
  joinDate: string;
}

export async function fetchUsers(): Promise<ApiUser[]> {
  return get<ApiUser[]>("/users");
}

export async function createUser(data: {
  name: string; email: string; phone: string; password: string; status?: string;
}): Promise<ApiUser> {
  return post<ApiUser>("/users", data);
}

export async function updateUserProfile(id: string, data: {
  name?: string; phone?: string; image?: string;
}): Promise<ApiUser> {
  const res = await fetch(`${BASE}/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(json.error || "Failed to update profile");
  return json;
}

export async function deleteUser(id: string): Promise<void> {
  return del(`/users/${id}`);
}

// ---------------------------------------------------------------------------
// Auth — Admin
// ---------------------------------------------------------------------------

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "super_admin";
}

export async function adminLogin(
  email: string,
  password: string
): Promise<AdminUser> {
  const res = await fetch(`${BASE}/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data as AdminUser;
}

// ---------------------------------------------------------------------------
// Auth — User
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function userLogin(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data as AuthResponse;
}

export async function userRegister(
  name: string,
  email: string,
  phone: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, password }),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.error || "Registration failed");
  return data as AuthResponse;
}

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

export interface IAppointment {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  hospitalId: string;
  hospitalName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  reason: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  createdAt: string;
}

function authHeaders(token: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export async function bookAppointment(token: string, data: {
  hospitalId: string; doctorId: string; date: string; time: string;
  reason: string; userName: string; userEmail: string; userPhone: string;
}): Promise<IAppointment> {
  const res = await fetch(`${BASE}/appointments`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(json.error || "Failed to book appointment");
  return json;
}

export async function fetchMyAppointments(token: string): Promise<IAppointment[]> {
  const res = await fetch(`${BASE}/appointments/my`, { headers: authHeaders(token) });
  const text = await res.text();
  const json = text ? JSON.parse(text) : [];
  if (!res.ok) throw new Error(json.error || "Failed to fetch appointments");
  return json;
}

export async function fetchAllAppointments(token: string, status?: string): Promise<IAppointment[]> {
  const qs = status ? `?status=${status}` : "";
  const res = await fetch(`${BASE}/appointments${qs}`, { headers: authHeaders(token) });
  const text = await res.text();
  const json = text ? JSON.parse(text) : [];
  if (!res.ok) throw new Error(json.error || "Failed to fetch appointments");
  return json;
}

export async function updateAppointmentStatus(token: string, id: string, status: string, notes?: string): Promise<IAppointment> {
  const res = await fetch(`${BASE}/appointments/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ status, notes }),
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(json.error || "Failed to update appointment");
  return json;
}

export async function fetchDoctorAppointments(token: string, doctorId: string): Promise<IAppointment[]> {
  const res = await fetch(`${BASE}/appointments/doctor/${doctorId}`, { headers: authHeaders(token) });
  const text = await res.text();
  const json = text ? JSON.parse(text) : [];
  if (!res.ok) throw new Error(json.error || "Failed to fetch appointments");
  return json;
}

export async function createAdminAppointment(token: string, data: {
  hospitalId: string; doctorId: string; date: string; time: string;
  reason: string; userName: string; userEmail: string; userPhone: string; status: string;
}): Promise<IAppointment> {
  const res = await fetch(`${BASE}/appointments/admin`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(json.error || "Failed to create appointment");
  return json;
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export interface IPayment {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  orderId: string;
  paymentId?: string;
  amount: number;       // paise
  currency: string;
  description: string;
  appointmentId?: string;
  status: "CREATED" | "SUCCESS" | "FAILED";
  createdAt: string;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export async function createPaymentOrder(token: string, data: {
  amount: number;
  description: string;
  userName: string;
  userEmail: string;
  appointmentId?: string;
}): Promise<CreateOrderResponse> {
  const res = await fetch(`${BASE}/payments/create-order`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(json.error || "Failed to create order");
  return json;
}

export async function verifyPayment(token: string, data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<{ success: boolean; status: string; paymentId: string }> {
  const res = await fetch(`${BASE}/payments/verify`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(json.error || "Payment verification failed");
  return json;
}

export async function fetchMyPayments(token: string): Promise<IPayment[]> {
  const res = await fetch(`${BASE}/payments/my`, { headers: authHeaders(token) });
  const text = await res.text();
  const json = text ? JSON.parse(text) : [];
  if (!res.ok) throw new Error(json.error || "Failed to fetch payments");
  return json;
}

export async function fetchAllPayments(token: string, params?: {
  status?: string; userId?: string; from?: string; to?: string;
}): Promise<IPayment[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.userId) qs.set("userId", params.userId);
  if (params?.from)   qs.set("from", params.from);
  if (params?.to)     qs.set("to", params.to);
  const query = qs.toString() ? `?${qs}` : "";
  const res = await fetch(`${BASE}/payments${query}`, { headers: authHeaders(token) });
  const text = await res.text();
  const json = text ? JSON.parse(text) : [];
  if (!res.ok) throw new Error(json.error || "Failed to fetch payments");
  return json;
}

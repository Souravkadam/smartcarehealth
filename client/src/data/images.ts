/**
 * Image URLs for hospitals, doctors, and users.
 * All images are from Unsplash (free to use, no attribution required for display).
 * Format: https://images.unsplash.com/photo-{id}?w=400&q=80&fit=crop
 */

// ─── Hospital Images (Maharashtra / modern hospital buildings) ────────────────
export const HOSPITAL_IMAGES: Record<string, string> = {
  "Apollo Hospitals":
    "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&q=80&fit=crop",
  "Lilavati Hospital":
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80&fit=crop",
  "Ruby Hall Clinic":
    "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&q=80&fit=crop",
  "Deenanath Mangeshkar Hospital":
    "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=600&q=80&fit=crop",
  "Inamdar Hospital":
    "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&q=80&fit=crop",
  "Jehangir Hospital":
    "https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=600&q=80&fit=crop",
  "Fortis Hospital Pune":
    "https://images.unsplash.com/photo-1578991624414-276ef23a534f?w=600&q=80&fit=crop",
  "Sahyadri Hospital":
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&q=80&fit=crop",
  "KEM Hospital":
    "https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=600&q=80&fit=crop",
  "Poona Hospital":
    "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&q=80&fit=crop",
  "Medipoint Hospital":
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80&fit=crop",
  "Inlaks & Budhrani Hospital":
    "https://images.unsplash.com/photo-1596541223130-5d31a73fb6c6?w=600&q=80&fit=crop",
  "Aditya Birla Memorial Hospital":
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80&fit=crop",
  "Noble Hospital":
    "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&q=80&fit=crop",
  "Sanjeevan Hospital":
    "https://images.unsplash.com/photo-1626315869436-d6781ba69d6e?w=600&q=80&fit=crop",
  "Surya Mother & Child Care":
    "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=600&q=80&fit=crop",
  "Oyster & Pearl Hospital":
    "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=600&q=80&fit=crop",
  "Lokmanya Hospital":
    "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&q=80&fit=crop",
  "Pune Institute of Medical Sciences":
    "https://images.unsplash.com/photo-1609188076864-c35269136b09?w=600&q=80&fit=crop",
  "Bharati Hospital":
    "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600&q=80&fit=crop",
};

// ─── Doctor Images (Indian male/female doctors) ───────────────────────────────
export const DOCTOR_IMAGES: string[] = [
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&q=80&fit=crop&face",
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&q=80&fit=crop&face",
  "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300&q=80&fit=crop&face",
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&q=80&fit=crop&face",
  "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=300&q=80&fit=crop&face",
  "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&q=80&fit=crop&face",
  "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&q=80&fit=crop&face",
  "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=300&q=80&fit=crop&face",
  "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=300&q=80&fit=crop&face",
  "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=300&q=80&fit=crop&face",
];

// ─── User / Avatar Images ─────────────────────────────────────────────────────
export const USER_IMAGES: string[] = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&fit=crop&face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&fit=crop&face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&fit=crop&face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80&fit=crop&face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80&fit=crop&face",
];

/** Get hospital image, fallback to a generic hospital photo */
export function getHospitalImage(name: string): string {
  return (
    HOSPITAL_IMAGES[name] ||
    "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&q=80&fit=crop"
  );
}

/** Get a doctor image by index (cycles through the list) */
export function getDoctorImage(index: number): string {
  return DOCTOR_IMAGES[index % DOCTOR_IMAGES.length];
}

/** Get a user avatar by index */
export function getUserImage(index: number): string {
  return USER_IMAGES[index % USER_IMAGES.length];
}

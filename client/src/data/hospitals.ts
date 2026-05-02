// Design Note: Modern Healthcare Minimalism
// This data structure follows the hospital schema with all required fields
// for comparison, filtering, and detailed views

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number; // years
  rating: number;
  availability: string; // e.g., "Mon-Fri, 10am-5pm"
  consultationFee: number;
  image?: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  estimatedStay: number; // days
  description?: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  distance: number; // km
  rating: number;
  reviews: number;
  beds: number;
  icuBeds: number;
  ots: number; // Operation Theaters
  level: "Premium" | "Standard" | "Basic"; // Hospital tier
  doctors: Doctor[];
  services: Service[];
  facilities: string[];
  specialties: string[];
  insurance: string[];
  aiScore: number; // 0-100, for AI recommendations
  bestFor: string[];
  image?: string;
  phone: string;
  email: string;
  website?: string;
}

export const hospitalsData: Hospital[] = [
  {
    id: "1",
    name: "Apollo Hospitals",
    address: "123 Medical Avenue, Sector 5",
    city: "Pune",
    distance: 2.5,
    rating: 4.8,
    reviews: 2341,
    beds: 450,
    icuBeds: 85,
    ots: 18,
    level: "Premium",
    phone: "+91-20-6630-5000",
    email: "info@apollopune.com",
    website: "https://www.apollohospitals.com",
    doctors: [
      {
        id: "d1",
        name: "Dr. Rajesh Kumar",
        specialty: "Cardiology",
        experience: 18,
        rating: 4.9,
        availability: "Mon-Fri, 10am-5pm",
        consultationFee: 1500,
      },
      {
        id: "d2",
        name: "Dr. Priya Sharma",
        specialty: "Obstetrics & Gynecology",
        experience: 14,
        rating: 4.8,
        availability: "Mon-Sat, 9am-6pm",
        consultationFee: 1200,
      },
      {
        id: "d3",
        name: "Dr. Amit Patel",
        specialty: "Orthopedics",
        experience: 16,
        rating: 4.7,
        availability: "Tue-Sat, 11am-4pm",
        consultationFee: 1300,
      },
    ],
    services: [
      {
        id: "s1",
        name: "CABG Surgery",
        category: "Cardiology",
        basePrice: 450000,
        estimatedStay: 7,
        description: "Coronary Artery Bypass Grafting",
      },
      {
        id: "s2",
        name: "Normal Delivery",
        category: "Obstetrics",
        basePrice: 80000,
        estimatedStay: 2,
      },
      {
        id: "s3",
        name: "Cesarean Section",
        category: "Obstetrics",
        basePrice: 150000,
        estimatedStay: 3,
      },
      {
        id: "s4",
        name: "MRI Scan",
        category: "Diagnostics",
        basePrice: 8000,
        estimatedStay: 0,
      },
      {
        id: "s5",
        name: "CT Scan",
        category: "Diagnostics",
        basePrice: 6000,
        estimatedStay: 0,
      },
    ],
    facilities: [
      "ICU",
      "Emergency",
      "Trauma Center",
      "Pharmacy",
      "Lab",
      "Imaging",
      "Cafeteria",
      "Parking",
    ],
    specialties: [
      "Cardiology",
      "Obstetrics",
      "Orthopedics",
      "Neurology",
      "Oncology",
    ],
    insurance: [
      "HDFC ERGO",
      "Aditya Birla",
      "Bajaj Allianz",
      "ICICI Lombard",
      "Star Health",
    ],
    aiScore: 92,
    bestFor: ["Cardiac Care", "Maternity", "Emergency Services"],
  },
  {
    id: "2",
    name: "Lilavati Hospital",
    address: "456 Health Plaza, Downtown",
    city: "Pune",
    distance: 4.2,
    rating: 4.7,
    reviews: 1856,
    beds: 380,
    icuBeds: 72,
    ots: 15,
    level: "Premium",
    phone: "+91-20-6630-6000",
    email: "info@lilavati.com",
    website: "https://www.lilavati.com",
    doctors: [
      {
        id: "d4",
        name: "Dr. Vikram Singh",
        specialty: "Neurology",
        experience: 20,
        rating: 4.9,
        availability: "Mon-Thu, 2pm-6pm",
        consultationFee: 1800,
      },
      {
        id: "d5",
        name: "Dr. Sneha Desai",
        specialty: "Pediatrics",
        experience: 12,
        rating: 4.8,
        availability: "Mon-Fri, 10am-4pm",
        consultationFee: 1000,
      },
    ],
    services: [
      {
        id: "s6",
        name: "Angioplasty",
        category: "Cardiology",
        basePrice: 350000,
        estimatedStay: 5,
      },
      {
        id: "s7",
        name: "Brain Surgery",
        category: "Neurology",
        basePrice: 600000,
        estimatedStay: 10,
      },
      {
        id: "s8",
        name: "Vaccination Package",
        category: "Pediatrics",
        basePrice: 5000,
        estimatedStay: 0,
      },
    ],
    facilities: [
      "ICU",
      "Emergency",
      "Pediatric Ward",
      "Pharmacy",
      "Lab",
      "Imaging",
    ],
    specialties: ["Neurology", "Pediatrics", "Cardiology", "Gastroenterology"],
    insurance: [
      "HDFC ERGO",
      "Aditya Birla",
      "Bajaj Allianz",
      "National Insurance",
    ],
    aiScore: 88,
    bestFor: ["Neurological Care", "Pediatric Services", "Cardiology"],
  },
  {
    id: "3",
    name: "Ruby Hall Clinic",
    address: "789 Medical Complex, Koregaon Park",
    city: "Pune",
    distance: 5.8,
    rating: 4.6,
    reviews: 1432,
    beds: 320,
    icuBeds: 60,
    ots: 12,
    level: "Standard",
    phone: "+91-20-6630-7000",
    email: "info@rubyhall.com",
    website: "https://www.rubyhall.com",
    doctors: [
      {
        id: "d6",
        name: "Dr. Arun Verma",
        specialty: "Orthopedics",
        experience: 15,
        rating: 4.7,
        availability: "Tue-Sat, 10am-5pm",
        consultationFee: 1200,
      },
      {
        id: "d7",
        name: "Dr. Meera Nair",
        specialty: "Dermatology",
        experience: 11,
        rating: 4.6,
        availability: "Mon-Fri, 3pm-7pm",
        consultationFee: 900,
      },
    ],
    services: [
      {
        id: "s9",
        name: "Joint Replacement",
        category: "Orthopedics",
        basePrice: 280000,
        estimatedStay: 6,
      },
      {
        id: "s10",
        name: "Skin Treatment",
        category: "Dermatology",
        basePrice: 15000,
        estimatedStay: 0,
      },
    ],
    facilities: ["ICU", "Emergency", "Pharmacy", "Lab", "Imaging", "Cafeteria"],
    specialties: ["Orthopedics", "Dermatology", "General Surgery"],
    insurance: ["HDFC ERGO", "Bajaj Allianz", "ICICI Lombard"],
    aiScore: 82,
    bestFor: ["Orthopedic Surgery", "Dermatology"],
  },
  {
    id: "4",
    name: "Deenanath Mangeshkar Hospital",
    address: "321 Healthcare Street, Erandwane",
    city: "Pune",
    distance: 3.1,
    rating: 4.5,
    reviews: 1205,
    beds: 280,
    icuBeds: 50,
    ots: 10,
    level: "Standard",
    phone: "+91-20-6630-8000",
    email: "info@dmh.com",
    website: "https://www.dmh.com",
    doctors: [
      {
        id: "d8",
        name: "Dr. Sanjay Kulkarni",
        specialty: "General Surgery",
        experience: 19,
        rating: 4.8,
        availability: "Mon-Fri, 9am-5pm",
        consultationFee: 1100,
      },
    ],
    services: [
      {
        id: "s11",
        name: "Appendectomy",
        category: "General Surgery",
        basePrice: 120000,
        estimatedStay: 3,
      },
      {
        id: "s12",
        name: "Hernia Repair",
        category: "General Surgery",
        basePrice: 100000,
        estimatedStay: 2,
      },
    ],
    facilities: ["ICU", "Emergency", "Pharmacy", "Lab", "Imaging"],
    specialties: ["General Surgery", "Internal Medicine"],
    insurance: ["HDFC ERGO", "Bajaj Allianz"],
    aiScore: 78,
    bestFor: ["General Surgery", "Emergency Care"],
  },
  {
    id: "5",
    name: "Inamdar Hospital",
    address: "654 Medical Drive, Bibwewadi",
    city: "Pune",
    distance: 6.5,
    rating: 4.4,
    reviews: 892,
    beds: 220,
    icuBeds: 40,
    ots: 8,
    level: "Basic",
    phone: "+91-20-6630-9000",
    email: "info@inamdar.com",
    website: "https://www.inamdar.com",
    doctors: [
      {
        id: "d9",
        name: "Dr. Ramesh Joshi",
        specialty: "Internal Medicine",
        experience: 17,
        rating: 4.5,
        availability: "Mon-Sat, 10am-4pm",
        consultationFee: 800,
      },
    ],
    services: [
      {
        id: "s13",
        name: "General Consultation",
        category: "Internal Medicine",
        basePrice: 500,
        estimatedStay: 0,
      },
      {
        id: "s14",
        name: "Blood Test",
        category: "Diagnostics",
        basePrice: 1500,
        estimatedStay: 0,
      },
    ],
    facilities: ["Emergency", "Pharmacy", "Lab", "Imaging"],
    specialties: ["Internal Medicine", "General Practice"],
    insurance: ["HDFC ERGO"],
    aiScore: 72,
    bestFor: ["General Consultation", "Diagnostics"],
  },
  {
    id: "6",
    name: "Jehangir Hospital",
    address: "987 Health Boulevard, Camp",
    city: "Pune",
    distance: 2.8,
    rating: 4.7,
    reviews: 1678,
    beds: 350,
    icuBeds: 65,
    ots: 14,
    level: "Premium",
    phone: "+91-20-6630-10000",
    email: "info@jehangir.com",
    website: "https://www.jehangir.com",
    doctors: [
      {
        id: "d10",
        name: "Dr. Isha Gupta",
        specialty: "Oncology",
        experience: 16,
        rating: 4.9,
        availability: "Mon-Fri, 11am-6pm",
        consultationFee: 2000,
      },
      {
        id: "d11",
        name: "Dr. Nikhil Deshmukh",
        specialty: "Gastroenterology",
        experience: 13,
        rating: 4.7,
        availability: "Tue-Sat, 2pm-7pm",
        consultationFee: 1400,
      },
    ],
    services: [
      {
        id: "s15",
        name: "Chemotherapy",
        category: "Oncology",
        basePrice: 200000,
        estimatedStay: 5,
      },
      {
        id: "s16",
        name: "Endoscopy",
        category: "Gastroenterology",
        basePrice: 25000,
        estimatedStay: 1,
      },
    ],
    facilities: [
      "ICU",
      "Emergency",
      "Oncology Ward",
      "Pharmacy",
      "Lab",
      "Imaging",
      "Cafeteria",
    ],
    specialties: ["Oncology", "Gastroenterology", "Cardiology"],
    insurance: [
      "HDFC ERGO",
      "Aditya Birla",
      "Bajaj Allianz",
      "ICICI Lombard",
    ],
    aiScore: 85,
    bestFor: ["Cancer Treatment", "Gastroenterology", "Premium Care"],
  },
];

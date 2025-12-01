// backend/src/types.ts
export interface IUser {
  userId: string;
  email: string;
  password?: string;
  name: string;
  phone: string;
  userType: 'customer' | 'provider';
  location: ILocation;
  createdAt: Date;
  profileImage?: string;
  isVerified?: boolean;
  googleId?: string;
}

export interface IService {
  serviceId: string;
  providerId: string;
  category: string;
  description: string;
  pricing: number;
  availability: ITimeSlot[];
  location: ILocation;
  averageRating: number;
}

export interface IBooking {
  bookingId: string;
  customerId: string;
  serviceId: string;
  date: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalCost: number;
  paymentMethod: 'cash' | 'orange' | 'mtn' | 'moov';
}

export interface IReview {
  reviewId: string;
  bookingId: string;
  customerId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface ICategory {
  categoryId: string;
  name: string;
  description: string;
  icon: string;
}

export interface ILocation {
  city: string;
  district: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface ITimeSlot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface AuthContext {
  user?: IUser;
}

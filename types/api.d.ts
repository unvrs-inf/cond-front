export interface ServiceType {
	id: number
	cost: number
	serviceName: string
	serviceDescription: string
	durationOfWork: number
	imageUrl: string
	active: boolean
	priceFixed: boolean
	unitName?: string
}

export interface PaginationInfo {
	size: number
	number: number
	totalElements: number
	totalPages: number
}

export interface ServiceTypesResponse {
	content: ServiceType[]
	page: PaginationInfo
}

export interface ApiError {
	message: string
	status?: number
	details?: unknown
}

export interface Schedule {
	id: number
	date: string
	workBeginning: string
	workEnding: string
}

export interface SchedulesResponse {
	content: Schedule[]
	page: PaginationInfo
}

export interface CreateScheduleDto {
	date: string
	workBeginning: string
	workEnding: string
}

export interface TypeOfServiceDto {
	serviceName: string
	cost: number
	priceFixed: boolean
	durationOfWork: number
	serviceDescription?: string
	unitName?: string
}

export interface AdditionalService {
	id: number
	serviceName: string
	serviceDescription?: string
	pricingFixed: boolean
	cost: number
	unitName?: string
	imageUrl?: string
	active: boolean
}

export interface AdditionalServiceDto {
	serviceName: string
	pricingFixed: boolean
	cost: number
	unitName?: string
	serviceDescription?: string
}

export interface AdditionalServicesResponse {
	content: AdditionalService[]
	page: PaginationInfo
}

export interface ClientReservation {
	id: number
	startDateTime: string
	endDateTime: string
	duration: number
	status: string
	typeOfService: {
		id: number
		serviceName: string
		cost: number
		durationOfWork: number
		serviceDescription: string
		imageUrl: string
		active: boolean
		priceFixed: boolean
		unitName?: string
	}
	client: {
		id: number
		username: string
		tgUsername: string
	}
	clientPhoneNumber: string
	clientAddress: string
	additionalServices?: AdditionalService[]
}

export interface CreateReservationDto {
	start: string
	serviceId: number
	clientName: string
	clientPhoneNumber: string
	clientAddress: string
	additionalServicesIds?: number[]
}

export interface UserInfoDto {
	id: number
	name: string
	isAdmin: boolean
}

export interface AdminReservation {
	id: number
	startDateTime: string
	endDateTime: string
	duration: number
	status: string
	typeOfService: {
		id: number
		serviceName: string
		cost: number
		durationOfWork: number
		serviceDescription: string
		imageUrl: string
		active: boolean
		priceFixed: boolean
		unitName?: string
	}
	client: {
		id: number
		username: string
		tgUsername: string
	}
	clientPhoneNumber: string
	clientAddress: string
	additionalServices?: AdditionalService[]
}

export interface AdminReservationsResponse {
	content: AdminReservation[]
	page: PaginationInfo
}

export interface Admin {
	id: number
	name: string
}

export interface AdminDto {
	id: number
	name: string
}

export interface AdminsResponse {
	content: Admin[]
	page: PaginationInfo
}

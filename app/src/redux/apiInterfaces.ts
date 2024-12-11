export interface AuthError {
    msg: string
}

export interface IUser {
    id: number
    email: string
    password: string
    role: string
    name: string
    job: string
    specialization: string
    phone: string
    address: string
    birthdate: string
    avatar: string
    description: string
}

export interface IClient {
    id: number
    id_user: number
    title: string
    type: string
    description: string
    phone: string
    email: string
    address: string
    logo: string
    lead_date: string
    contact_person_name: string  
    contact_person_contact_type: string
    contact_person_contact_value: string
}

export interface IDeal {
    id: number
    id_client: number
    title: string
    description: string
    sum: number
    currency: ICurrency,
    status: IDealStatus
    beginning_date: string
    completion_date: string
}

export interface INote {
    id: number
    id_deal: number
    title: string
    content: string
    creation_date: string
}

export interface IGetAllClientsResponseWithQuantity {
    quantity: number
    items: IClient[]
}

export interface IGetAllDealsResponseWithQuantity {
    quantity: number
    items: IDeal[]
}

export interface IRole {
    id: number
    title: string
}

export interface IJob {
    id: number
    title: string
}

export interface IClientType {
    id: number
    title: string
}

export interface IClientContactPersonContactType {
    id: number
    title: string
    alias: string
}

export interface IDealStatus {
    id: number
    title: string
}

export interface ICurrency {
    id: number
    title: string
    code: string
}

export interface ICountRowsResponse {
    quantity: number
}

// id тут используется для того чтобы по нему вытаскивать те или иные списки элементов
export interface IItemsPageListRequest {
    mode?: string
    id?: number
    offset?: number
    limit?: number
    sortDir?: string
}

export interface ICreateUserRequest {
    email: string
    password: string
    role: number
    job: number
    specialization: number
    name: string
    phone: string
    address: string
    birthdate: string,
    avatar?: string,
    description: string
}

export interface ICreateUserResponse {
    newUserId: number
}

export interface ICreateClientRequest {
    id_user: number
    title: string
    type: number
    description: string
    phone: string
    email: string
    address: string
    logo?: string
    contact_person_name: string  
    contact_person_contact_type: number
    contact_person_contact_value: string
}

export interface ICreateClientResponse {
    newClientId: number
}

export interface ICreateDealRequest {
    id_client: number
    title: string
    description: string
    sum: number
    currency: number
    status: number
    completion_date: string | null
}

export interface ICreateDealResponse {
    newDealId: number
}

export interface ICreateNoteRequest {
    id_deal: number
    title: string
    content: string
}

export interface ICreateNoteResponse {
    newNoteId: number
}

export interface IUpdateUserRequestBody {
    email: string
    password?: string
    role?: number
    job?: number
    specialization?: number
    name: string
    phone: string
    address: string
    birthdate: string,
    avatar?: string,
    description: string
}
export interface IUpdateUserRequest {
    id: number
    body: IUpdateUserRequestBody
}

export interface IUpdateClientRequestBody {
    id_user?: number
    title: string
    type: number
    description: string
    phone: string
    email: string
    address: string
    logo?: string
    contact_person_name: string  
    contact_person_contact_type: number
    contact_person_contact_value: string
}
export interface IUpdateClientRequest {
    id: number
    body: IUpdateClientRequestBody
}

export interface IUpdateDealRequestBody {
    title: string
    description: string
    sum: number
    currency: number
    status: number
    completion_date: string | null
}
export interface IUpdateDealRequest {
    id: number
    body: IUpdateDealRequestBody
}

export interface IUpdateNoteRequestBody {
    title: string
    content: string
}
export interface IUpdateNoteRequest {
    id: number
    body: IUpdateNoteRequestBody
}

export interface IUpdateItemResponse {
    status: boolean
}

export interface ISigninRequest {
    email: string
    password: string
}

export interface ISigninResponse {
    status: boolean
    msg?: string
    accessToken?: string
}

export interface ISignoutResponse {
    status: boolean,
    msg: string
}

export interface IRefreshResponse {
    status: boolean
    accessToken?: string
    refreshToken?: string
    msg?: string
}

export interface IUploadSinglePhotoResponse {
    filename: string
}

// id тут используется для того чтобы по нему вытаскивать те или иные списки элементов
export interface ISearchRequest {
    query: string
    mode: string
    id?: number
    // offset?: number
    // limit?: number
    sortDir?: string
}

export interface ISearchResponseItem {
    id: number
    name: string
    description: string
    item_type: string
}
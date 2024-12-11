import { FieldErrors, UseFormRegister } from "react-hook-form"

export type TSelect = {
    label: string,
    value: number | null
}

export type TCheckList = {
    [key: string]: string | boolean | number | 
                   { [key: string]: string | boolean | number | RegExp } |
                   ((value:string) => boolean | string)
}

type TFormSimple = {
    name: string,
    title: string,
    phone: string,
    email: string,
    address: string,
    contact_person_name: string,
    contact_person_contact_value: string,
    password: string,
    sum: number,
    birthdate: string,
    completion_date: string
}
export type TFormSelects = {
    role: TSelect | null,
    job: TSelect | null,
    client_type: TSelect | null,
    client_contact_person_contact_type: TSelect | null,
    currency: TSelect | null,
    dealStatus: TSelect | null,
    manager: TSelect | null,
    client: TSelect | null,
    deal: TSelect | null
}
export type TFormRitchText = {
    description: string,
    content: string
}
type TFormFiles = {
    file: File[]
}
export type TForm = TFormSimple & TFormSelects & TFormRitchText & TFormFiles

export type TInputShort = {
    title: string
    name: keyof TForm
    placeholder: string
    checklist: TCheckList
}

export type TInputFull = {
    title: string
    name: keyof TForm
    placeholder: string
    reg: UseFormRegister<TForm>
    checklist: TCheckList
    errors: FieldErrors<TForm>
}

export type ISelect = {
    listType: string,
    title: string
    name: keyof TFormSelects
    initialValue?: string
    checklist: TCheckList
}
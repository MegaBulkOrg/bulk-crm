import { useEffect, useState } from 'react';
import Select from 'react-select';
import { 
    useLazyGetAllRolesQuery, 
    useLazyGetAllJobsQuery, 
    useLazyGetAllClientsTypesQuery, 
    useLazyGetAllClientsContactPersonsContactTypesQuery, 
    useLazyGetAllCurrenciesQuery,
    useLazyGetAllDealsStatusesQuery, 
    useLazyGetAllManagersQuery
} from 'Redux/api/directories';
import { useLazyGetClientsByCurrentUserQuery } from 'Redux/api/clients';
import { useLazyGetDealsByCurrentClientQuery } from 'Redux/api/deals';
import { TCheckList, TFormSelects } from 'Components/Forms/types';
import { FieldErrors, UseFormGetValues, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { TForm } from '../types';
import { useLazyRefreshQuery, useSignoutMutation } from 'Redux/api/auth';
import { useAppDispatch, useAppSelector } from 'Redux/hooks';
import { useNavigate } from 'react-router-dom';
import { tokenErrorHandler } from '../../../helpers/tokenErrorHandler';
import styles from './fields.module.sass';

type TList = {
    value: number
    label: string
}

type TSelect = {
    initialValue?: string
    managerId?: number
    clientId?: number
    listType: string
    title: string
    name: keyof TFormSelects
    reg: UseFormRegister<TForm>
    checklist: TCheckList
    setValue: UseFormSetValue<TForm>
    getValues: UseFormGetValues<TForm>
    errors: FieldErrors<TForm>
}

type TResponseList = {
    id: number | null
    title: string
    code?: string
    specialization?: number
}

export function SelectField({ initialValue, managerId, clientId, listType, title, name, setValue, getValues, reg, checklist, errors }:TSelect) {
    const [list, setList] = useState<TList[]>([])
    
    const [getRoles, {isError: isGetRolesError, error: getRolesError}] = useLazyGetAllRolesQuery()
    const [getJobs, {isError: isGetJobsError, error: getJobsError}] = useLazyGetAllJobsQuery()
    const [getClientsTypes, {isError: isGetClientsTypesError, error: getClientsTypesError}] = useLazyGetAllClientsTypesQuery()
    const [getClientsContactPersonsContactTypes, {isError: isGetClientsContactPersonsContactTypesError, error: getClientsContactPersonsContactTypesError}] = useLazyGetAllClientsContactPersonsContactTypesQuery()
    const [getCurrencies, {isError: isGetCurrenciesError, error: getCurrenciesError}] = useLazyGetAllCurrenciesQuery()
    const [getDealsStatuses, {isError: isGetDealsError, error: getDealsError}] = useLazyGetAllDealsStatusesQuery()
    const [getManagers, {isError: isGetManagersError, error: getManagersError}] = useLazyGetAllManagersQuery()
    const [getClientsByCurrentUser, {data: clientsByCurrentUser, isError: isGetClientsByCurrentUserError, error: getClientsByCurrentUserError}] = useLazyGetClientsByCurrentUserQuery()
    const [getDealsByCurrentClient, {data: dealsByCurrentClient, isError: isGetDealsByCurrentClientError, error: getDealsByCurrentClientError}] = useLazyGetDealsByCurrentClientQuery()
    
    async function getList() {            
        let response:TResponseList[] = []
        if (listType === 'roles') {
            const {data} = await getRoles()
            if (data && Array.isArray(data) && data.length !== 0) response = data
        }
        if (listType === 'jobs') {
            const {data} = await getJobs()
            if (data && Array.isArray(data) && data.length !== 0) response = data
        }
        if (listType === 'clientsTypes') {
            const {data} = await getClientsTypes()
            if (data && Array.isArray(data) && data.length !== 0) response = data
        }
        if (listType === 'clientsContactPersonsContactTypes') {
            const {data} = await getClientsContactPersonsContactTypes()
            if (data && Array.isArray(data) && data.length !== 0) response = data
        }
        if (listType === 'currencies') {
            const {data} = await getCurrencies()
            if (data && Array.isArray(data) && data.length !== 0) response = data
        }   
        if (listType === 'dealsStatuses') {
            const {data} = await getDealsStatuses()
            if (data && Array.isArray(data) && data.length !== 0) response = data
        }
        if (listType === 'managers') {
            const {data} = await getManagers()
            if (data && Array.isArray(data) && data.length !== 0) response = data.map(item => ({
                id: item.id,
                title: item.name,
                specialization: Number(item.specialization)
            }))
        }
        if (listType === 'clients') {
            if (clientsByCurrentUser && Array.isArray(clientsByCurrentUser)) response = clientsByCurrentUser.map(item => ({
                id: item.id,
                title: item.title
            }))
        }
        if (listType === 'deals') {
            if (dealsByCurrentClient && Array.isArray(dealsByCurrentClient)) response = dealsByCurrentClient.map(item => ({
                id: item.id,
                title: item.title
            }))
        }        
        setList(() => response.map((item:TResponseList) => (
            {label: item.title, value: item.id || 1}
        )))
    }

    useEffect(() => {
        if (initialValue && list.length > 0) {            
            const initialItem = list.find(item => item.label === initialValue)
            if (initialItem) setValue(name, initialItem, { shouldValidate: true })
        }
    },[list])

    // для форм редактирования: установка первоначального значения
    useEffect(() => {
        if (list && initialValue) {
            // приводим оба значения к строчным буквам так как в таких справочниках как например
            // "Тип контакта контактного лица" у значений будет разный регистр букв
            const currentItem = list.find(item => item.label.toLowerCase() === initialValue.toLowerCase())
            if (currentItem) setValue(name, currentItem)
        }
    },[list])

    useEffect(() => {
        getList()
    },[clientsByCurrentUser,dealsByCurrentClient])

	useEffect(() => {
        getClientsByCurrentUser({id:managerId, sortDir:'asc'})
    },[managerId])

	useEffect(() => {
        getDealsByCurrentClient({id:clientId, sortDir:'asc'})
    },[clientId])

    const formGroupStyles = errors?.[name]
        ? `${styles.formGroup} ${styles.formGroupError} form-select-error`
        : styles.formGroup

    const [signout] = useSignoutMutation()
    const [refresh] = useLazyRefreshQuery()
    const authUserId = useAppSelector(state => state.auth.authUserId)
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    useEffect(() => {
        async function tokenError() {     
            if (isGetRolesError && 'status' in getRolesError && (getRolesError.status === 401 || getRolesError.status === 403)) {
                const response = await tokenErrorHandler({error: getRolesError, dispatch, signout, authUserId, refresh})
                response ? getList() : navigate('/login')
            }
            if (isGetJobsError && 'status' in getJobsError && (getJobsError.status === 401 || getJobsError.status === 403)) {
                const response = await tokenErrorHandler({error: getJobsError, dispatch, signout, authUserId, refresh})
                response ? getList() : navigate('/login')
            }
            if (isGetClientsTypesError && 'status' in getClientsTypesError && (getClientsTypesError.status === 401 || getClientsTypesError.status === 403)) {
                const response = await tokenErrorHandler({error: getClientsTypesError, dispatch, signout, authUserId, refresh})
                response ? getList() : navigate('/login')
            }
            if (isGetClientsContactPersonsContactTypesError && 'status' in getClientsContactPersonsContactTypesError && (getClientsContactPersonsContactTypesError.status === 401 || getClientsContactPersonsContactTypesError.status === 403)) {
                const response = await tokenErrorHandler({error: getClientsContactPersonsContactTypesError, dispatch, signout, authUserId, refresh})
                response ? getList() : navigate('/login')
            }
            if (isGetCurrenciesError && 'status' in getCurrenciesError && (getCurrenciesError.status === 401 || getCurrenciesError.status === 403)) {
                const response = await tokenErrorHandler({error: getCurrenciesError, dispatch, signout, authUserId, refresh})
                response ? getList() : navigate('/login')
            }
            if (isGetDealsError && 'status' in getDealsError && (getDealsError.status === 401 || getDealsError.status === 403)) {
                const response = await tokenErrorHandler({error: getDealsError, dispatch, signout, authUserId, refresh})
                response ? getList() : navigate('/login')
            }
            if (isGetManagersError && 'status' in getManagersError && (getManagersError.status === 401 || getManagersError.status === 403)) {
                const response = await tokenErrorHandler({error:getManagersError, dispatch, signout, authUserId, refresh})
                response ? getList() : navigate('/login')
            }
            if (isGetClientsByCurrentUserError && 'status' in getClientsByCurrentUserError && (getClientsByCurrentUserError.status === 401 || getClientsByCurrentUserError.status === 403)) {
                const response = await tokenErrorHandler({error:getClientsByCurrentUserError, dispatch, signout, authUserId, refresh})
                response ? getList() : navigate('/login')
            }
            if (isGetDealsByCurrentClientError && 'status' in getDealsByCurrentClientError && (getDealsByCurrentClientError.status === 401 || getDealsByCurrentClientError.status === 403)) {
                const response = await tokenErrorHandler({error:getDealsByCurrentClientError, dispatch, signout, authUserId, refresh})
                response ? getList() : navigate('/login')
            }
        }
        tokenError()
    }, [
        isGetRolesError, getRolesError,
        isGetJobsError, getJobsError,
        isGetClientsTypesError, getClientsTypesError,
        isGetClientsContactPersonsContactTypesError, getClientsContactPersonsContactTypesError,
        isGetCurrenciesError, getCurrenciesError,
        isGetDealsError, getDealsError,
        isGetManagersError, getManagersError,
        isGetClientsByCurrentUserError, getClientsByCurrentUserError,
        isGetDealsByCurrentClientError, getDealsByCurrentClientError
    ])

    return (
        <div className={formGroupStyles}>
            <label className={styles.formLabel}>{title}</label>
            <Select options={list}
                placeholder={title}
                classNamePrefix="formSelect"
                onChange={selectedOption => setValue(name, selectedOption, { shouldValidate: true })}
                {...(name === 'client' ? { value: !managerId
                    ? null : getValues('client')
                } : {})}
                {...(name === 'deal' ? { value: !clientId
                    ? null : getValues('deal')
                } : {})}
                {...(initialValue ? { value: getValues(name)} : {})}
            />
            <input {...reg(name, checklist)} type="hidden" />
            {errors?.[name] &&
                <p className={styles.formSelectErrorMsg}>
                    {errors[name]?.message}
                </p>
            }
        </div>
    )
}
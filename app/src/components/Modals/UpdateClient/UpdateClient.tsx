import { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faHurricane } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector, useAppDispatch } from 'Redux/hooks';
import { modalSwitch } from 'Redux/slices/modalSwitcherSlice';
import { SubmitHandler, useForm } from 'react-hook-form'
import { InputField } from 'Components/Forms/Fields/InputField';
import { SelectField } from 'Components/Forms/Fields/SelectField';
import { RichTextField } from 'Components/Forms/Fields/RichTextField';
import { AttachField } from 'Components/Forms/Fields/AttachField';
import { ISelect, TForm, TInputShort } from 'Components/Forms/types';
import { TNotifications } from 'Components/Content';
import { useUploadSinglePhotoMutation } from 'Redux/api/files';
import { useGetCurrentClientQuery, useUpdateClientMutation } from 'Redux/api/clients';
import { useLazyRefreshQuery, useSignoutMutation } from 'Redux/api/auth';
import { useNavigate } from 'react-router-dom';
import { tokenErrorHandler } from '../../../helpers/tokenErrorHandler';
import { useGetCurrentUserQuery } from 'Redux/api/users';
import { IUpdateClientRequestBody } from 'Redux/apiInterfaces';
import styles from './updateclient.module.sass';

type TProps = {
    setNotifications: React.Dispatch<React.SetStateAction<TNotifications>>
}

export function UpdateClient({setNotifications}:TProps) {
    const updatedClientId = useAppSelector(state => state.modalSwitcher.itemId)
    const authState = useAppSelector(state => state.auth)
    
    const { data: updatedClientData, isSuccess: isUpdatedClientDataSuccess, isError: isUpdatedClientDataError, error: updatedClientDataError, refetch: refetchUpdatedClientData } = useGetCurrentClientQuery(updatedClientId || 0)
    const {data: manager, isError: isManagerError, error: managerError, refetch: refetchManager} = useGetCurrentUserQuery(updatedClientData && 'id' in updatedClientData ? updatedClientData.id_user : 0)
    const [ uploadPhoto, {isLoading: isUploadPhotoLoading, isError: isUploadPhotoError, error: uploadPhotoError} ] = useUploadSinglePhotoMutation()
    const [ updateClient, {isLoading: isUpdateClientLoading, isError: isUpdateClientError, error: updateClientError} ] = useUpdateClientMutation()
    
    const dispatch = useAppDispatch()
    const modalRef = useRef(null);
    function modalClose() { 
       dispatch(modalSwitch({open: false, modalName: '', itemId: null}))
    }
    
    const { register, handleSubmit, setValue, getValues, watch, formState: {errors} } = useForm<TForm>()

    useEffect(() => {              
        if (updatedClientData && 'id' in updatedClientData) {              
            setValue('title', updatedClientData.title)
            setValue('phone', updatedClientData.phone)
            setValue('email', updatedClientData.email)
            setValue('address', updatedClientData.address)
            setValue('contact_person_name', updatedClientData.contact_person_name)
            setValue('contact_person_contact_value', updatedClientData.contact_person_contact_value)
        } 
    },[isUpdatedClientDataSuccess])

    const requiredCommonMsg = 'Это поле обязательно для заполнения'

    const inputs:TInputShort[] = [
        {
            title: 'Наименование клиента',
            name: 'title',
            placeholder: 'ООО "Полёт"',
            checklist: {required: requiredCommonMsg}
        },        
        {
            title: 'Телефон',
            name: 'phone',
            placeholder: '+78121234567',
            checklist: {
                required: requiredCommonMsg,
                pattern: {
                    value: /^\+\d*$/,
                    message: 'Телефон указан неправильно'
                }
            }
        },
        {
            title: 'E-mail',
            name: 'email',
            placeholder: 'asd@asd.ru',
            checklist: {
                required: requiredCommonMsg,
                pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: 'E-mail указан неправильно'
                }
            }
        },
        {
            title: 'Адрес',
            name: 'address',
            placeholder: 'улица Хошимина, дом Чжоу Мина',
            checklist: {}
        },
        {
            title: 'Контактное лицо',
            name: 'contact_person_name',
            placeholder: 'Анастасия',
            checklist: {required: requiredCommonMsg}
        },
        {
            title: 'Контакт контактного лица',
            name: 'contact_person_contact_value',
            placeholder: '+78121234567',
            checklist: {required: requiredCommonMsg}
        }
    ]
    
    const basicSelects:ISelect[] = [
        {
            listType: 'clientsTypes',
            title: 'Тип клиента',
            name: 'client_type',
            initialValue: updatedClientData && 'id' in updatedClientData ? updatedClientData.type : '',
            checklist: {required: requiredCommonMsg}
        },
        {
            listType: 'clientsContactPersonsContactTypes',
            title: 'Тип контакта контактного лица',
            name: 'client_contact_person_contact_type',
            initialValue: updatedClientData && 'id' in updatedClientData ? updatedClientData.contact_person_contact_type : '',
            checklist: {required: requiredCommonMsg}
        }
    ]
    const additionalSelects:ISelect[] = authState.authUserRoleId !== 1    
        ? [
            {
                listType: 'managers',
                title: 'Менеджер',
                name: 'manager',
                initialValue: manager && 'id' in manager ? manager.name : '',
                checklist: {required: requiredCommonMsg}
            }
        ]
        : []
    const selects:ISelect[] = [
        ...basicSelects,
        ...additionalSelects
    ]

    const onSubmit: SubmitHandler<TForm> = async (data) => {        
        const dataToSend:IUpdateClientRequestBody = {
            title: data.title,
            type: data.client_type?.value || 1,
            description: data.description,
            phone: data.phone,
            email: data.email,
            address: data.address,
            contact_person_name: data.contact_person_name,  
            contact_person_contact_type: data.client_contact_person_contact_type?.value || 1,
            contact_person_contact_value: data.contact_person_contact_value
        }
        if (authState.authUserRoleId !== 1) {
            dataToSend.id_user = data.manager?.value || 1
        }
        if (data.file) {
            const formData = new FormData()
            formData.append('folder', 'clients')
            formData.append('file', data.file[0])
            const { data:uploadPhotoResponse } = await uploadPhoto(formData)
            if (uploadPhotoResponse && 'filename' in uploadPhotoResponse) dataToSend.logo = uploadPhotoResponse.filename
        }
        const updResponse = await updateClient({
            id: updatedClientId || 1,
            body: dataToSend
        })
        if (updResponse.data && 'status' in updResponse.data && updResponse.data.status === true ) {
            modalClose()
            setNotifications({show: true, status: true, text: 'Информация о клиенте обновлена'})
        }
    }

    const [signout] = useSignoutMutation()
    const [refresh] = useLazyRefreshQuery()
    const navigate = useNavigate()
    useEffect(() => {
        async function errorHandler() {
            if (isUpdatedClientDataError && updatedClientDataError && 'status' in updatedClientDataError) {
                if (updatedClientDataError.status === 401 || updatedClientDataError.status === 403) {
                    const response = await tokenErrorHandler({error: updatedClientDataError, dispatch, signout, authUserId:authState.authUserId, refresh})
                    response ? refetchUpdatedClientData() : navigate('/login')
                } else {
                    setNotifications({show: true, status: false, text: `Произошла ошибка при получении информации о клиенте: ${updatedClientDataError}`})
                }
            }
            if (isUploadPhotoError && uploadPhotoError && 'status' in uploadPhotoError) {
                if (uploadPhotoError.status === 401 || uploadPhotoError.status === 403) {
                    const response = await tokenErrorHandler({error: uploadPhotoError, dispatch, signout, authUserId:authState.authUserId, refresh})
                    response ? handleSubmit(onSubmit) : navigate('/login')
                } else {
                    setNotifications({show: true, status: false, text: `Произошла ошибка при сохранении файла: ${uploadPhotoError}`})
                }
            }
            if (isUpdateClientError && updateClientError && 'status' in updateClientError) {
                if (updateClientError.status === 401 || updateClientError.status === 403) {
                    const response = await tokenErrorHandler({error: updateClientError, dispatch, signout, authUserId:authState.authUserId, refresh})
                    response ? handleSubmit(onSubmit) : navigate('/login')
                } else {
                    setNotifications({show: true, status: false, text: `Произошла ошибка при обновлении информации: ${updateClientError}`})
                }
            }
            if (isManagerError && 'status' in managerError && (managerError.status === 401 || managerError.status === 403)) {
                const response = await tokenErrorHandler({error:managerError, dispatch, signout, authUserId:authState.authUserId, refresh})
                response ? refetchManager() : navigate('/login')
            }
        }
        errorHandler()
    },[
        isUpdatedClientDataError, updatedClientDataError,
        isUploadPhotoError, uploadPhotoError,
        isUpdateClientError, updateClientError,
        isManagerError, managerError
    ])

    return (
        <div className={styles.updateClient} ref={modalRef}>
            <button className={styles.updateClient__closeBtn} onClick={modalClose}>
                <FontAwesomeIcon icon={faClose} />
            </button>
            <h2 className={styles.updateClient__title}>Редактирование информации о клиенте</h2>
            <form className={styles.updateClient__form} autoComplete='on' onSubmit={handleSubmit(onSubmit)}>                                
                {inputs.map((input, index) => <InputField 
                    key={index} 
                    title={input.title}
                    name={input.name}
                    placeholder={input.placeholder}
                    reg={register}
                    checklist={input.checklist}
                    errors={errors}
                />)}
                {selects.map((select, index) => <SelectField 
                    key={index}
                    listType={select.listType}
                    title={select.title}
                    name={select.name}
                    initialValue={select.initialValue}
                    reg={register}
                    checklist={select.checklist}
                    setValue={setValue}
                    getValues={getValues}
                    errors={errors}
                />)}
                <RichTextField
                    title="Описание клиента"
                    name="description"
                    checklist={{}}
                    reg={register}
                    setValue={setValue}
                    {...(updatedClientData && 'id' in updatedClientData ? { initialValue: updatedClientData.description} : {})}
                    errors={errors}
                />
                <div className={styles.updateClient__formBtns}>
                    <AttachField 
                        reg={register}
                        watch={watch}
                        setValue={setValue}
                        {...(updatedClientData && 'id' in updatedClientData && updatedClientData.logo !== ''
                            ? { initialValue: updatedClientData.logo } 
                            : {}
                        )}
                    />
                    <button className={styles.updateClient__submitBtn} type='submit'>
                        Сохранить
                        {(isUploadPhotoLoading || isUpdateClientLoading) && <FontAwesomeIcon icon={faHurricane} spin />}
                    </button>
                </div>               
            </form>
        </div>
    )
}
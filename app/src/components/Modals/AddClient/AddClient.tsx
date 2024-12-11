import { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faHurricane } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from 'Redux/hooks';
import { modalSwitch } from 'Redux/slices/modalSwitcherSlice';
import { SubmitHandler, useForm } from 'react-hook-form';
import { ICreateClientRequest } from 'Redux/apiInterfaces';
import { InputField } from 'Components/Forms/Fields/InputField';
import { SelectField } from 'Components/Forms/Fields/SelectField';
import { RichTextField } from 'Components/Forms/Fields/RichTextField';
import { AttachField } from 'Components/Forms/Fields/AttachField';
import { ISelect, TForm, TInputShort } from 'Components/Forms/types';
import { TNotifications } from 'Components/Content';
import { useUploadSinglePhotoMutation } from 'Redux/api/files';
import { useCreateClientMutation } from 'Redux/api/clients';
import { useLazyRefreshQuery, useSignoutMutation } from 'Redux/api/auth';
import { useNavigate } from 'react-router-dom';
import { tokenErrorHandler } from '../../../helpers/tokenErrorHandler';
import styles from './addclient.module.sass';

type TProps = {
    setNotifications: React.Dispatch<React.SetStateAction<TNotifications>>
}

export function AddClient({setNotifications}:TProps) {
    const [ uploadPhoto, {isLoading: isUploadPhotoLoading, isError: isUploadPhotoError, error: uploadPhotoError} ] = useUploadSinglePhotoMutation()
    const [ createClient, {isLoading: isCreateClientLoading, isError: isCreateClientError, error: createClientError} ] = useCreateClientMutation()

    const authState = useAppSelector(state => state.auth)

    const dispatch = useAppDispatch()
    const modalRef = useRef(null);
    function modalClose() { 
       dispatch(modalSwitch({open: false, modalName: '', itemId: null}))
    }
    
    const { register, handleSubmit, setValue, getValues, watch, formState: {errors} } = useForm<TForm>()

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
            checklist: {}
        },
        {
            title: 'E-mail',
            name: 'email',
            placeholder: 'asd@asd.ru',
            checklist: {}
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
            checklist: {required: requiredCommonMsg}
        },
        {
            listType: 'clientsContactPersonsContactTypes',
            title: 'Тип контакта контактного лица',
            name: 'client_contact_person_contact_type',
            checklist: {required: requiredCommonMsg}
        }
    ]
    const additionalSelects:ISelect[] = authState.authUserRoleId !== 1    
        ? [
            {
                listType: 'managers',
                title: 'Менеджер',
                name: 'manager',
                checklist: {required: requiredCommonMsg}
            }
        ]
        : []
    const selects:ISelect[] = [
        ...basicSelects,
        ...additionalSelects
    ]

    const onSubmit: SubmitHandler<TForm> = async (data) => {
        const dataToSend:ICreateClientRequest = {
            id_user: authState.authUserRoleId === 1
                ? authState.authUserId || 1
                : data.manager?.value || 1,
            title: data.title,
            type: data.client_type?.value || 1,
            description: data.description,
            phone: data.phone,
            email: data.email,
            address: data.address,
            contact_person_name: data.contact_person_name,  
            contact_person_contact_value: data.contact_person_contact_value,
            contact_person_contact_type: data.client_contact_person_contact_type?.value|| 1
        }
        if (data.file) {
            const formData = new FormData()
            formData.append('folder', 'clients')
            formData.append('file', data.file[0])
            const { data:uploadImageResponse } = await uploadPhoto(formData)
            if (uploadImageResponse && 'filename' in uploadImageResponse) dataToSend.logo = uploadImageResponse.filename
        }
        const createResponse = await createClient(dataToSend)
        if (createResponse.data && 'newClientId' in createResponse.data) {
            modalClose()
            setNotifications({show: true, status: true, text: 'Создан новый клиент'})
        }
    }

    const [signout] = useSignoutMutation()
    const [refresh] = useLazyRefreshQuery()
    const navigate = useNavigate()
    useEffect(() => {
        async function errorHandler() {
            if (isUploadPhotoError && uploadPhotoError && 'status' in uploadPhotoError) {
                if (uploadPhotoError.status === 401 || uploadPhotoError.status === 403) {
                    const response = await tokenErrorHandler({error: uploadPhotoError, dispatch, signout, authUserId:authState.authUserId, refresh})
                    response ? handleSubmit(onSubmit) : navigate('/login')
                } else {
                    setNotifications({show: true, status: false, text: `Произошла ошибка при сохранении файла: ${uploadPhotoError}`})
                }
            }
            if (isCreateClientError && createClientError && 'status' in createClientError) {
                if (createClientError.status === 401 || createClientError.status === 403) {
                    const response = await tokenErrorHandler({error: createClientError, dispatch, signout, authUserId:authState.authUserId, refresh})
                    response ? handleSubmit(onSubmit) : navigate('/login')
                } else {
                    setNotifications({show: true, status: false, text: `Произошла ошибка при создании нового клиента: ${createClientError}`})
                }
            }
        }
        errorHandler()
    },[
        isUploadPhotoError, uploadPhotoError,
        isCreateClientError, createClientError
    ])

    return (
        <div className={styles.addClient} ref={modalRef}>
            <button className={styles.addClient__closeBtn} onClick={modalClose}>
                <FontAwesomeIcon icon={faClose} />
            </button>
            <h2 className={styles.addClient__title}>Добавление нового клиента</h2>
            <form className={styles.addClient__form} autoComplete='on' onSubmit={handleSubmit(onSubmit)}>                                
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
                    errors={errors}
                />
                <div className={styles.addClient__formBtns}>
                    <AttachField 
                        reg={register}
                        watch={watch}
                        setValue={setValue}
                    />
                    <button className={styles.addClient__submitBtn} type='submit'>
                        Сохранить
                        {(isUploadPhotoLoading || isCreateClientLoading) && <FontAwesomeIcon icon={faHurricane} spin />}
                    </button>
                </div>               
            </form>
        </div>
    )
}
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
import { useGetCurrentUserQuery, useLazyUserExistenceCheckQuery, useUpdateUserMutation } from 'Redux/api/users';
import { useLazyCountClientsByCurrentUserQuery } from 'Redux/api/clients';
import { TNotifications } from 'Components/Content';
import { useUploadSinglePhotoMutation } from 'Redux/api/files';
import { useNavigate } from 'react-router-dom';
import { useLazyRefreshQuery, useSignoutMutation } from 'Redux/api/auth';
import { tokenErrorHandler } from '../../../helpers/tokenErrorHandler';
import { IUpdateUserRequestBody } from 'Redux/apiInterfaces';
import { tzDateStringToCommonDateStringForForms } from '../../../helpers/date';
import styles from './updateuser.module.sass';

type TProps = {
    setNotifications: React.Dispatch<React.SetStateAction<TNotifications>>
}

export function UpdateUser({setNotifications}:TProps) {
    const updatedUserId = useAppSelector(state => state.modalSwitcher.itemId)
    const authState = useAppSelector(state => state.auth)

    const { data: updatedUserData, isSuccess: isUpdatedUserDataSuccess, isError: isUpdatedUserDataError, error: updatedUserDataError, refetch: refetchUpdatedUserData } = useGetCurrentUserQuery(updatedUserId || 1)
    const [ userExistenceCheck, {isLoading: isUserExistenceLoading, isError: isUserExistenceError, error: userExistenceError} ] = useLazyUserExistenceCheckQuery()
    const [ countClientsByCurrentUser, {isLoading: isCountClientsByCurrentUserLoading, isError: isCountClientsByCurrentUserError, error: countClientsByCurrentUserError} ] = useLazyCountClientsByCurrentUserQuery()
    const [ uploadPhoto, {isLoading: isUploadPhotoLoading, isError: isUploadPhotoError, error: uploadPhotoError} ] = useUploadSinglePhotoMutation()
    const [ updateUser, {isLoading: isUpdateUserLoading, isError: isUpdateUserError, error: updateUserError} ] = useUpdateUserMutation()

    const dispatch = useAppDispatch()
    const modalRef = useRef(null);
    function modalClose() { 
       dispatch(modalSwitch({open: false, modalName: '', itemId: null}))
    }

    const { register, handleSubmit, setValue, getValues, watch, formState: {errors} } = useForm<TForm>()

    useEffect(() => {
        if (updatedUserData && 'id' in updatedUserData) {              
            setValue('email', updatedUserData.email)
            setValue('name', updatedUserData.name)
            setValue('phone', updatedUserData.phone)
            setValue('address', updatedUserData.address)
            setValue('birthdate', tzDateStringToCommonDateStringForForms(updatedUserData.birthdate))
        } 
    },[isUpdatedUserDataSuccess])

    const requiredCommonMsg = 'Это поле обязательно для заполнения'

    const inputs:TInputShort[] = [
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
            title: 'Пароль (чтобы не менять пароль, оставьте поле пустым)',
            name: 'password',
            placeholder: '*****',
            checklist: {}
        },  
        {
            title: 'ФИО',
            name: 'name',
            placeholder: 'Иванов Иван Иванович',
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
            title: 'Адрес',
            name: 'address',
            placeholder: 'улица Хошимина, дом Чжоу Мина',
            checklist: {}
        },
        {
            title: 'Дата Рождения',
            name: 'birthdate',
            placeholder: 'ГГГГ-ММ-ДД',
            checklist: {
                required: requiredCommonMsg,
                pattern: {
                    value: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[01])$/,
                    message: 'Дата рождения указана неправильно'
                }
            }
        }
    ]
    
    const selects:ISelect[] = authState.authUserRoleId !== 1
        ? [
            {
                listType: 'jobs',
                title: 'Должность',
                name: 'job',
                initialValue: updatedUserData && 'id' in updatedUserData ? updatedUserData.job : '',
                checklist: {required: requiredCommonMsg}
            },
            {
                listType: 'clientsTypes',
                title: 'Специализация',
                name: 'client_type',
                initialValue: updatedUserData && 'id' in updatedUserData ? updatedUserData.specialization : '',
                checklist: {required: requiredCommonMsg}
            },
            {
                listType: 'roles',
                title: 'Роль',
                name: 'role',
                initialValue: updatedUserData && 'id' in updatedUserData ? updatedUserData.role : '',
                checklist: {required: requiredCommonMsg}
            }
        ]
        : []

    const onSubmit: SubmitHandler<TForm> = async (data) => {
        // проверка №1
        const {data:checkResult} = await userExistenceCheck(data.email)
        if (
            checkResult && 'quantity' in checkResult && checkResult.quantity !== 0 
            && updatedUserData && 'id' in updatedUserData && updatedUserData.email !== data.email
        ) {
            setNotifications({show: true, status: false, text: 'Пользователь с таким email уже существует'})
            return
        }
        // проверка №2
        if (authState.authUserRoleId !== 1 && data.role?.value !== 1 && data.client_type?.value !== 6) {
            setNotifications({show: true, status: false, text: 'Только менеджер может иметь специализацию'})
            return
        }
        // проверка №3
        if (authState.authUserRoleId !== 1 && updatedUserData && 'id' in updatedUserData) {
            const {data:countClients} = await countClientsByCurrentUser(updatedUserData.id)
            if (countClients && 'quantity' in countClients && countClients.quantity > 0 && data.role?.value !== 1) {
                setNotifications({show: true, status: false, text: 'За данным пользователем закреплены клиенты. Чтобы поменять роль, переназначьте их другим пользователям, так как только менеджер может иметь клиентов.'})
                return
            }
        }
        // если все проверки пройдены
        const dataToSend:IUpdateUserRequestBody = {
            email: data.email,
            name: data.name,
            phone: data.phone,
            address: data.address,
            birthdate: data.birthdate,
            description: data.description,
        }
        if (data.password) dataToSend.password = data.password
        if (authState.authUserRoleId !== 1) {
            dataToSend.role = data.role?.value || 1
            dataToSend.job = data.job?.value || 1
            dataToSend.specialization = data.client_type?.value || 1
        }
        if (data.file) {
            const formData = new FormData()
            formData.append('folder', 'users')
            formData.append('file', data.file[0])
            const { data:uploadPhotoResponse } = await uploadPhoto(formData)
            if (uploadPhotoResponse && 'filename' in uploadPhotoResponse) dataToSend.avatar = uploadPhotoResponse.filename
        }  
        const updResponse = await updateUser({
            id: updatedUserId || 1,
            body: dataToSend
        })
        if (updResponse.data && 'status' in updResponse.data && updResponse.data.status === true ) {
            modalClose()
            setNotifications({show: true, status: true, text: 'Информация о пользователе обновлена'})
        }
    }

    const [signout] = useSignoutMutation()
    const [refresh] = useLazyRefreshQuery()
    const navigate = useNavigate()
    useEffect(() => {
        async function errorHandler() {
            if (isUpdatedUserDataError && updatedUserDataError && 'status' in updatedUserDataError) {
                if (updatedUserDataError.status === 401 || updatedUserDataError.status === 403) {
                    const response = await tokenErrorHandler({error: updatedUserDataError, dispatch, signout, authUserId:authState.authUserId, refresh})
                    response ? refetchUpdatedUserData() : navigate('/login')
                } else {
                    setNotifications({show: true, status: false, text: `Произошла ошибка при получении информации о пользователе: ${updatedUserDataError}`})
                }
            }
            if (isUserExistenceError && userExistenceError && 'status' in userExistenceError) {
                if (userExistenceError.status === 401 || userExistenceError.status === 403) {
                    const response = await tokenErrorHandler({error: userExistenceError, dispatch, signout, authUserId:authState.authUserId, refresh})
                    response ? handleSubmit(onSubmit) : navigate('/login')
                } else {
                    setNotifications({show: true, status: false, text: `Произошла ошибка при проверке на существования пользователя с данным email: ${userExistenceError}`})
                }
            }
            if (isCountClientsByCurrentUserError && countClientsByCurrentUserError && 'status' in countClientsByCurrentUserError) {
                if (countClientsByCurrentUserError.status === 401 || countClientsByCurrentUserError.status === 403) {
                    const response = await tokenErrorHandler({error: countClientsByCurrentUserError, dispatch, signout, authUserId:authState.authUserId, refresh})
                    response ? handleSubmit(onSubmit) : navigate('/login')
                } else {
                    setNotifications({show: true, status: false, text: `Произошла ошибка при подсчете количества клиентов, закрепленных за данным пользователем: ${countClientsByCurrentUserError}`})
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
            if (isUpdateUserError && updateUserError && 'status' in updateUserError) {
                if (updateUserError.status === 401 || updateUserError.status === 403) {
                    const response = await tokenErrorHandler({error: updateUserError, dispatch, signout, authUserId:authState.authUserId, refresh})
                    response ? handleSubmit(onSubmit) : navigate('/login')
                } else {
                    setNotifications({show: true, status: false, text: `Произошла ошибка при обновлении информации: ${updateUserError}`})
                }
            }
        }
        errorHandler()
    },[
        isUpdatedUserDataError, updatedUserDataError,
        isUserExistenceError, userExistenceError,
        isCountClientsByCurrentUserError, countClientsByCurrentUserError,
        isUploadPhotoError, uploadPhotoError,
        isUpdateUserError, updateUserError
    ])

    return (
        <div className={styles.updateUser} ref={modalRef}>
            <button className={styles.updateUser__closeBtn} onClick={modalClose}>
                <FontAwesomeIcon icon={faClose} />
            </button>
            <h2 className={styles.updateUser__title}>Редактирование информации о пользователе</h2>
            <form className={styles.updateUser__form} autoComplete='on' onSubmit={handleSubmit(onSubmit)}>                                
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
                    title="Описание пользователя"
                    name="description"
                    checklist={{}}
                    reg={register}
                    setValue={setValue}
                    {...(updatedUserData && 'id' in updatedUserData ? { initialValue: updatedUserData.description} : {})}
                    errors={errors}
                />
                <div className={styles.updateUser__formBtns}>
                    <AttachField 
                        reg={register}
                        watch={watch}
                        setValue={setValue}
                        {...(updatedUserData && 'id' in updatedUserData && updatedUserData.avatar !== ''
                            ? { initialValue: updatedUserData.avatar } 
                            : {}
                        )}
                    />
                    <button className={styles.updateUser__submitBtn} type='submit'>
                        Сохранить
                        {(isUserExistenceLoading || isCountClientsByCurrentUserLoading || isUploadPhotoLoading || isUpdateUserLoading) && <FontAwesomeIcon icon={faHurricane} spin />}
                    </button>
                </div>               
            </form>
        </div>
    )
}
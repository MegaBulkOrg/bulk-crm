import { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faHurricane } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from 'Redux/hooks';
import { modalSwitch } from 'Redux/slices/modalSwitcherSlice';
import { SubmitHandler, useForm } from 'react-hook-form'
import { InputField } from 'Components/Forms/Fields/InputField';
import { SelectField } from 'Components/Forms/Fields/SelectField';
import { RichTextField } from 'Components/Forms/Fields/RichTextField';
import { AttachField } from 'Components/Forms/Fields/AttachField';
import { ISelect, TForm, TInputShort } from 'Components/Forms/types';
import { useCreateUserMutation, useLazyUserExistenceCheckQuery } from 'Redux/api/users';
import { TNotifications } from 'Components/Content';
import { useUploadSinglePhotoMutation } from 'Redux/api/files';
import { useNavigate } from 'react-router-dom';
import { useLazyRefreshQuery, useSignoutMutation } from 'Redux/api/auth';
import { tokenErrorHandler } from '../../../helpers/tokenErrorHandler';
import { ICreateUserRequest } from 'Redux/apiInterfaces';
import styles from './adduser.module.sass';

type TProps = {
    setNotifications: React.Dispatch<React.SetStateAction<TNotifications>>
}

export function AddUser({setNotifications}:TProps) {
    const [ userExistenceCheck, {isLoading: isUserExistenceLoading, isError: isUserExistenceError, error: userExistenceError} ] = useLazyUserExistenceCheckQuery()
    const [ uploadPhoto, {isLoading: isUploadPhotoLoading, isError: isUploadPhotoError, error: uploadPhotoError} ] = useUploadSinglePhotoMutation()
    const [ createUser, {isLoading: isCreateUserLoading, isError: isCreateUserError, error: createUserError} ] = useCreateUserMutation()
    
    const dispatch = useAppDispatch()
    const modalRef = useRef(null);
    function modalClose() { 
       dispatch(modalSwitch({open: false, modalName: '', itemId: null}))
    }
    
    const { register, handleSubmit, setValue, getValues, watch, formState: {errors} } = useForm<TForm>()

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
            title: 'Пароль',
            name: 'password',
            placeholder: '*****',
            checklist: {required: requiredCommonMsg}
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
    
    const selects:ISelect[] = [
        {
            listType: 'jobs',
            title: 'Должность',
            name: 'job',
            checklist: {required: requiredCommonMsg}
        },
        {
            listType: 'clientsTypes',
            title: 'Специализация',
            name: 'client_type',
            checklist: {required: requiredCommonMsg}
        },
        {
            listType: 'roles',
            title: 'Роль',
            name: 'role',
            checklist: {required: requiredCommonMsg}
        }
    ]

    const onSubmit: SubmitHandler<TForm> = async (data) => {
        // проверка №1
        const {data:checkResult} = await userExistenceCheck(data.email)
        if (checkResult && 'quantity' in checkResult && checkResult.quantity !== 0) {
            setNotifications({show: true, status: false, text: 'Пользователь с таким email уже существует'})
            return
        }
        // проверка №2
        if (data.role?.value !== 1 && data.client_type?.value !== 6) {
            setNotifications({show: true, status: false, text: 'Только менеджер может иметь специализацию'})
            return
        }
        // если проверка пройдена
        const dataToSend:ICreateUserRequest = {
            email: data.email,
            password: data.password,
            role: data.role?.value || 1,
            job: data.job?.value || 1,
            specialization: data.client_type?.value || 1,
            name: data.name,
            phone: data.phone,
            address: data.address,
            birthdate: data.birthdate,
            description: data.description,
        }
        if (data.file) {
            const formData = new FormData()
            formData.append('folder', 'users')
            formData.append('file', data.file[0])
            const { data:uploadImageResponse } = await uploadPhoto(formData)
            if (uploadImageResponse && 'filename' in uploadImageResponse) dataToSend.avatar = uploadImageResponse.filename
        }
        const createResponse = await createUser(dataToSend) 
        if (createResponse.data && 'newUserId' in createResponse.data) {
            modalClose()
            setNotifications({show: true, status: true, text: 'Создан новый пользователь'})
        }
    }

    const [signout] = useSignoutMutation()
    const [refresh] = useLazyRefreshQuery()
    const authUserId = useAppSelector(state => state.auth.authUserId)
    const navigate = useNavigate()
    useEffect(() => {
        async function errorHandler() {
            if (isUserExistenceError && userExistenceError && 'status' in userExistenceError) {
                if (userExistenceError.status === 401 || userExistenceError.status === 403) {
                    const response = await tokenErrorHandler({error: userExistenceError, dispatch, signout, authUserId, refresh})
                    response ? handleSubmit(onSubmit) : navigate('/login')
                } else {
                    setNotifications({show: true, status: false, text: `Произошла ошибка при проверке на существования пользователя с данным email: ${userExistenceError}`})
                }
            }
            if (isUploadPhotoError && uploadPhotoError && 'status' in uploadPhotoError) {
                if (uploadPhotoError.status === 401 || uploadPhotoError.status === 403) {
                    const response = await tokenErrorHandler({error: uploadPhotoError, dispatch, signout, authUserId, refresh})
                    response ? handleSubmit(onSubmit) : navigate('/login')
                } else {
                    setNotifications({show: true, status: false, text: `Произошла ошибка при сохранении файла: ${uploadPhotoError}`})
                }
            }
            if (isCreateUserError && createUserError && 'status' in createUserError) {
                if (createUserError.status === 401 || createUserError.status === 403) {
                    const response = await tokenErrorHandler({error: createUserError, dispatch, signout, authUserId, refresh})
                    response ? handleSubmit(onSubmit) : navigate('/login')
                } else {
                    setNotifications({show: true, status: false, text: `Произошла ошибка при создании нового пользователя: ${createUserError}`})
                }
            }
        }
        errorHandler()
    },[
        isUserExistenceError, userExistenceError,
        isUploadPhotoError, uploadPhotoError,
        isCreateUserError, createUserError
    ])

    return (
        <div className={styles.addClient} ref={modalRef}>
            <button className={styles.addClient__closeBtn} onClick={modalClose}>
                <FontAwesomeIcon icon={faClose} />
            </button>
            <h2 className={styles.addClient__title}>Добавление нового пользователя</h2>
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
                    title="Описание пользователя"
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
                        {(isUserExistenceLoading || isUploadPhotoLoading || isCreateUserLoading) && <FontAwesomeIcon icon={faHurricane} spin />}
                    </button>
                </div>               
            </form>
        </div>
    )
}